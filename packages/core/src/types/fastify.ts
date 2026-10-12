import type { FastifyRequest, FastifyReply } from 'fastify';
import type { PrincipalType, TenantRole } from '../db/schema/memberships.js';

export interface RequestUser {
  id: string;
  userId: string;
  principalType: PrincipalType;
  role?: TenantRole;
  isPlatformAdmin: boolean;
  capabilities: string[];
}

export interface RequestTenant {
  id: string;
  name?: string;
  slug: string;
  tier?: string;
  [key: string]: unknown;
}

export type FastifyAuthHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

declare module 'fastify' {
  interface FastifyRequest {
    user: RequestUser;
    tenant: RequestTenant;
  }
  interface FastifyInstance {
    authenticate: FastifyAuthHandler;
    requireCapability: (capability: string) => FastifyAuthHandler;
  }
}
