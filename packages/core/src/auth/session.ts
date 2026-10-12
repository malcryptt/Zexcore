import type { PrincipalType, TenantRole } from '../db/schema/memberships.js';

export interface SessionContext {
  userId: string;
  tenantId?: string;
  principalType: PrincipalType;
  role?: TenantRole;
  capabilities: string[];
  isPlatformAdmin: boolean;
}
