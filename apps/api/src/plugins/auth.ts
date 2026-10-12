import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { verifyAuthToken, hasCapability } from '@zexcore/core';
import type { PrincipalType, TenantRole } from '@zexcore/core';

export interface RequestUser {
  userId: string;
  principalType: PrincipalType;
  role?: TenantRole;
  isPlatformAdmin: boolean;
  capabilities: string[];
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: RequestUser;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireCapability: (capability: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
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
          userId: payload.userId,
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
        userId: 'anonymous',
        principalType: 'public',
        isPlatformAdmin: false,
        capabilities: [],
      };
    }
  });

  // Decorator: require active authentication
  server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user || request.user.principalType === 'public') {
      return reply.status(401).send({ error: 'Authentication required' });
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
