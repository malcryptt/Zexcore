import type { FastifyInstance } from 'fastify';
import {
  initializeDatabaseSchema,
  globalModuleRegistry,
  getDb,
  tenants,
  users,
  records,
  eq,
  desc,
  withTenantDb,
  verifyPassword,
  signAuthToken,
  createDefaultCoreContext,
  memberships,
  and,
} from '@zexcore/core';
import { cmsModule } from '@zexcore/module-cms';
import { crmModule } from '@zexcore/module-crm';
import { iotModule } from '@zexcore/module-iot';
import { complianceModule } from '@zexcore/compliance';
import { rulesModule } from '@zexcore/rules';
import { auditModule } from '@zexcore/module-audit';

export async function bootstrapApp(server: FastifyInstance): Promise<void> {
  // 1. Initialize DB schema and RLS policies
  server.log.info('[bootstrap] Initializing database schema & RLS policies...');
  await initializeDatabaseSchema();

  // 2. Register modules into the module registry
  server.log.info('[bootstrap] Registering CMS module...');
  globalModuleRegistry.register(cmsModule);

  server.log.info('[bootstrap] Registering CRM module...');
  globalModuleRegistry.register(crmModule);

  server.log.info('[bootstrap] Registering IoT module...');
  globalModuleRegistry.register(iotModule);

  server.log.info('[bootstrap] Registering Compliance module...');
  globalModuleRegistry.register(complianceModule);

  server.log.info('[bootstrap] Registering Rules engine...');
  globalModuleRegistry.register(rulesModule);

  server.log.info('[bootstrap] Registering Audit & Financial Health module...');
  globalModuleRegistry.register(auditModule);

  // 3. Initialize all modules (lifecycle onInit)
  const coreContext = createDefaultCoreContext();
  await globalModuleRegistry.initAll(coreContext);

  // 4. Register health check
  server.get('/api/health', async () => {
    return {
      status: 'ok',
      service: 'zexcore-api',
      timestamp: new Date().toISOString(),
      modules: globalModuleRegistry.getAll().map((m) => ({ name: m.name, version: m.version })),
    };
  });

  // 5. Auth route: Login
  server.post<{
    Body: { email: string; password: string; tenantSlug?: string };
  }>('/api/auth/login', async (request, reply) => {
    const { email, password, tenantSlug } = request.body ?? ({} as any);
    if (typeof email !== 'string' || typeof password !== 'string') {
      return reply.status(400).send({ error: 'email and password required' });
    }
    const db = getDb();

    const [userRecord] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!userRecord) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const isValid = await verifyPassword(password, userRecord.passwordHash);
    if (!isValid) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    let resolvedTenantId: string | undefined;
    let role: 'owner' | 'admin' | 'member' | 'viewer' | undefined;
    if (tenantSlug) {
      const [t] = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1);
      if (!t) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }
      // Membership is mandatory: a valid password does not grant access to a tenant you don't belong to.
      const [m] = await withTenantDb(t.id, async (tx) =>
        tx.select().from(memberships)
          .where(and(eq(memberships.tenantId, t.id), eq(memberships.userId, userRecord.id)))
          .limit(1),
      );
      if (!m && !userRecord.isPlatformAdmin) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }
      resolvedTenantId = t.id;
      role = m?.role as typeof role;
    }

    const token = signAuthToken({
      userId: userRecord.id,
      tenantId: resolvedTenantId,
      role,
      principalType: userRecord.isPlatformAdmin ? 'platform_admin' : 'tenant_user',
      isPlatformAdmin: userRecord.isPlatformAdmin,
    });

    return reply.send({
      token,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        isPlatformAdmin: userRecord.isPlatformAdmin,
      },
    });
  });

  // 6. Generic records endpoint (Dynamic Content Engine)
  server.get('/api/records', {
    preHandler: [server.authenticate, server.requireCapability('records:read')],
  }, async (request, reply) => {
    const tenant = (request as any).tenant;
    if (!tenant) {
      return reply.status(400).send({ error: 'Tenant context required' });
    }

    const recordsList = await withTenantDb(tenant.id, async (tx) => {
      return await tx
        .select()
        .from(records)
        .where(eq(records.tenantId, tenant.id))
        .orderBy(desc(records.createdAt));
    });

    return reply.send({ records: recordsList });
  });

  // 7. Mount registered module routes
  server.log.info('[bootstrap] Mounting module routes...');
  await globalModuleRegistry.registerAllRoutes(server, coreContext);
}
