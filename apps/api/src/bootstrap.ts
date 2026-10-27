import type { FastifyInstance } from 'fastify';
import {
  initializeDatabaseSchema,
  globalModuleRegistry,
  records,
  eq,
  desc,
  withTenantDb,
  verifyPassword,
  hashPassword,
  lookupUserForLogin,
  createDefaultCoreContext,
  grantRuntimeAccess,
  checkRuntimeRoleSafety,
} from '@zexcore/core';
import { registerBillingRoutes } from './billing/routes.js';
import { registerAccountRoutes } from './routes/account.js';
import { registerGoogleRoutes } from './routes/google.js';
import { registerAuthSecurityRoutes } from './routes/authSecurity.js';
import { startSession } from './auth/session.js';
import { registerOverviewRoutes } from './routes/overview.js';
import { cmsModule } from '@zexcore/module-cms';
import { crmModule } from '@zexcore/module-crm';
import { iotModule } from '@zexcore/module-iot';
import { complianceModule } from '@zexcore/compliance';
import { rulesModule } from '@zexcore/rules';
import { auditModule } from '@zexcore/module-audit';
import { bookingsModule } from '@zexcore/module-bookings';

// Pre-computed hash used to equalise login timing for unknown users
const DUMMY_HASH = await hashPassword('zexcore-timing-equaliser-' + Math.random());

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

  server.log.info('[bootstrap] Registering Bookings module...');
  globalModuleRegistry.register(bookingsModule);

  // 3. Initialize all modules (lifecycle onInit)
  const coreContext = createDefaultCoreContext();
  await globalModuleRegistry.initAll(coreContext);

  // Module tables now exist: apply least-privilege grants for the runtime role, then (in production)
  // refuse to serve if the runtime role could undermine tenant isolation.
  await grantRuntimeAccess();
  const roleSafety = await checkRuntimeRoleSafety();
  if (!roleSafety.ok) {
    const msg = `Runtime DB role is unsafe: ${roleSafety.problems.join('; ')}`;
    if (process.env.NODE_ENV === 'production' && process.env.ZEXCORE_ALLOW_SINGLE_DB_ROLE !== 'true') {
      throw new Error(`[FATAL SECURITY CONFIGURATION] ${msg}`);
    }
    server.log.warn(`[bootstrap] ${msg}`);
  }

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
    const userRecord = await lookupUserForLogin(email.toLowerCase().trim());
    // Always burn a password verification so unknown emails and wrong passwords take similar time.
    const isValid = await verifyPassword(password, userRecord?.password_hash ?? DUMMY_HASH);
    if (!userRecord || !isValid) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const session = await startSession(userRecord, tenantSlug, request);
    if (session.kind === 'choose') return reply.send({ workspaces: session.workspaces });
    if (session.kind === 'denied') return reply.status(401).send({ error: 'Invalid email or password' });
    return reply.send({ token: session.token, user: session.user });
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

  registerBillingRoutes(server);
  registerAccountRoutes(server);
  registerGoogleRoutes(server);
  registerAuthSecurityRoutes(server);
  registerOverviewRoutes(server);

  // 7. Mount registered module routes
  server.log.info('[bootstrap] Mounting module routes...');
  await globalModuleRegistry.registerAllRoutes(server, coreContext);
}
