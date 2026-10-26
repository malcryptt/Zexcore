import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { runWithTenant, resolveTenant, verifyAuthToken } from '@zexcore/core';

const tenancyPluginAsync: FastifyPluginAsync = async (server) => {
  /**
   * onRequest hook — runs first in every request lifecycle.
   * Resolves tenant and uses AsyncLocalStorage.run() wrapping done()
   * so all downstream hooks, preHandlers, and route handlers inherit the context.
   */
  server.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
    (async () => {
      let resolvedTenantId: string | undefined;
      const headerTenantId = request.headers['x-tenant-id'] as string | undefined;
      const headerTenantSlug = request.headers['x-tenant-slug'] as string | undefined;

      // Extract and verify Bearer token if present to prevent header spoofing
      if (request.headers.authorization?.startsWith('Bearer ')) {
        try {
          const token = request.headers.authorization.substring(7);
          const payload = verifyAuthToken(token);
          if (payload && payload.tenantId) {
            // Anti-spoofing rule: Non-admin users cannot override their token's tenant
            if (!payload.isPlatformAdmin && headerTenantId && headerTenantId !== payload.tenantId) {
              reply.status(403).send({ error: 'Tenant context mismatch: Access to foreign tenant is forbidden' });
              return;
            }
            resolvedTenantId = payload.tenantId;
          }
        } catch {
          // Token will be rejected in preHandler / authenticate
        }
      }

      if (!resolvedTenantId && headerTenantId) {
        resolvedTenantId = headerTenantId;
      }

      const tenantId = resolvedTenantId;
      let tenantSlug = headerTenantSlug;

      // Subdomain resolution is opt-in: set TENANT_BASE_DOMAIN (e.g. "zexcore.me") so that "acme.zexcore.me"
      // resolves to tenant "acme". Without it, host names such as IP addresses or the hosting provider's
      // default domain must never be interpreted as tenant slugs.
      const base = process.env.TENANT_BASE_DOMAIN?.toLowerCase();
      if (!tenantId && !tenantSlug && base && request.hostname) {
        const host = request.hostname.toLowerCase().replace(/:\d+$/, '');
        if (host.endsWith(`.${base}`)) {
          const sub = host.slice(0, -(base.length + 1));
          if (/^[a-z0-9][a-z0-9-]{1,62}$/.test(sub) && sub !== 'api' && sub !== 'www') tenantSlug = sub;
        }
      }

      if (!tenantId && !tenantSlug) {
        return done(); // Public endpoint — no tenant context required
      }

      // Resolve via the SECURITY DEFINER lookup (the runtime role cannot read other tenants' rows)
      const tenantRecord = await resolveTenant(tenantId ? { id: tenantId } : { slug: tenantSlug });

      if (!tenantRecord) {
        reply.status(404).send({ error: 'Tenant not found or inactive' });
        return;
      }

      request.tenant = {
        id: tenantRecord.id,
        slug: tenantRecord.slug,
        tier: tenantRecord.tier,
      };

      // Wrap downstream execution in AsyncLocalStorage
      runWithTenant({ tenantId: tenantRecord.id, tenantSlug: tenantRecord.slug }, () => {
        done();
      });
    })().catch((err) => {
      done(err);
    });
  });
};

export const tenancyPlugin = fp(tenancyPluginAsync, {
  name: 'tenancy-plugin',
});

