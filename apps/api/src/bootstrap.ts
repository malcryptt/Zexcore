import type { FastifyInstance } from 'fastify';
import {
  initializeDatabaseSchema,
  globalModuleRegistry,
  getDb,
  globalEventBus,
  tenants,
  users,
  records,
  eq,
  desc,
  withTenantDb,
  verifyPassword,
  signAuthToken,
} from '@zexcore/core';
import { cmsModule } from '@zexcore/module-cms';
import { crmModule } from '@zexcore/module-crm';

export async function bootstrapApp(server: FastifyInstance): Promise<void> {
  // 1. Initialize DB schema and RLS policies
  server.log.info('[bootstrap] Initializing database schema & RLS policies...');
  await initializeDatabaseSchema();

  // 2. Register modules into the module registry
  server.log.info('[bootstrap] Registering CMS module...');
  globalModuleRegistry.register(cmsModule);

  server.log.info('[bootstrap] Registering CRM module...');
  globalModuleRegistry.register(crmModule);

  // 3. Initialize all modules (lifecycle onInit)
  const coreContext = {
    db: getDb(),
    events: globalEventBus,
  };
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
    const { email, password, tenantSlug } = request.body;
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
    if (tenantSlug) {
      const [t] = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1);
      resolvedTenantId = t?.id;
    }

    const token = signAuthToken({
      userId: userRecord.id,
      tenantId: resolvedTenantId,
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
  server.get('/api/records', async (request, reply) => {
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
