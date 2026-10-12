import type { PrincipalType } from '../db/schema/memberships.js';

export interface AuditLogInput {
  tenantId: string;
  userId?: string;
  principalType: PrincipalType;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}
