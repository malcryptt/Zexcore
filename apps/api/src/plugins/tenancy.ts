import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { runWithTenant, getDb, tenants, eq } from '@zexcore/core';


const tenancyPluginAsync: FastifyPluginAsync = async (server) => {
  server.addHook('onRequest', async (request: FastifyRequest, reply) => {
    // 1. Resolve tenant identifier from headers or host subdomain
    const headerTenantId = request.headers['x-tenant-id'] as string | undefined;
    const headerTenantSlug = request.headers['x-tenant-slug'] as string | undefined;

    const tenantId = headerTenantId;
    let tenantSlug = headerTenantSlug;

    // Subdomain resolution: e.g. "acme.api.zexcore.local" -> "acme"
    if (!tenantId && !tenantSlug && request.hostname) {
      const parts = request.hostname.split('.');
      if (parts.length > 2 && parts[0] && parts[0] !== 'localhost' && parts[0] !== 'api') {
        tenantSlug = parts[0];
      }
    }

    if (!tenantId && !tenantSlug) {
      // Optional for health check or public root endpoints
      return;
    }

    // 2. Fetch tenant record from DB
    const db = getDb();
    let tenantRecord;

    if (tenantId) {
      const results = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
      tenantRecord = results[0];
    } else if (tenantSlug) {
      const results = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1);
      tenantRecord = results[0];
    }

    if (!tenantRecord) {
      return reply.status(404).send({ error: 'Tenant not found or inactive' });
    }

    request.tenant = {
      id: tenantRecord.id,
      slug: tenantRecord.slug,
      tier: tenantRecord.tier,
    };
  });

  // Wrap handler execution in AsyncLocalStorage tenant context
  server.addHook('preHandler', async (request: FastifyRequest) => {
    if (request.tenant) {
      runWithTenant(
        {
          tenantId: request.tenant.id,
          tenantSlug: request.tenant.slug,
        },
        () => {},
      );
    }
  });
};

export const tenancyPlugin = fp(tenancyPluginAsync, {
  name: 'tenancy-plugin',
});
