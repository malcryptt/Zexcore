import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { verifyAuthToken, hasCapability } from '@zexcore/core';
import type { PrincipalType, TenantRole } from '@zexcore/core';

export interface RequestUser {
  userId: string;
  tenantId?: string;
  principalType: PrincipalType;
  role?: TenantRole;
  isPlatformAdmin: boolean;
  capabilities: string[];
}

const authPluginAsync: FastifyPluginAsync = async (server) => {
  // Pre-handler hook to inspect Bearer token if present
  server.addHook('preHandler', async (request: FastifyRequest) => {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = verifyAuthToken(token);
        request.user = {
          id: payload.userId,
          userId: payload.userId,
          tenantId: payload.tenantId,
          principalType: payload.principalType,
          role: payload.role,
          isPlatformAdmin: Boolean(payload.isPlatformAdmin),
          capabilities: [],
        };
      } catch {
        // Invalid token; leave request.user undefined
      }
    }

    // Default to 'public' principal if no authenticated user
    if (!request.user) {
      request.user = {
        id: 'anonymous',
        userId: 'anonymous',
        principalType: 'public',
        isPlatformAdmin: false,
        capabilities: [],
      };
    }
  });

  // Decorator: require active authentication with cross-tenant context verification
  server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user || request.user.principalType === 'public') {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    // Cross-tenant defense: ensure token tenant matches request tenant context
    if (
      request.tenant &&
      request.user.tenantId &&
      !request.user.isPlatformAdmin &&
      request.user.tenantId !== request.tenant.id
    ) {
      return reply.status(403).send({ error: 'Tenant context mismatch: Access to foreign tenant is forbidden' });
    }
  });

  // Decorator: require specific capability
  server.decorate('requireCapability', (capability: string) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const principal = request.user || {
        principalType: 'public',
        capabilities: [],
      };

      if (!hasCapability(principal, capability)) {
        return reply.status(403).send({
          error: `Forbidden: Missing required capability '${capability}'`,
        });
      }
    };
  });
};

export const authPlugin = fp(authPluginAsync, {
  name: 'auth-plugin',
});
