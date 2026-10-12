import { getDb } from '../db/client.js';
import { auditLog } from '../db/schema/audit_log.js';
import type { AuditLogInput } from './types.js';

/**
 * Persists an immutable security audit trail event to the database.
 */
export async function logAuditEvent(entry: AuditLogInput): Promise<void> {
  const db = getDb();
  await db.insert(auditLog).values({
    tenantId: entry.tenantId,
    userId: entry.userId,
    principalType: entry.principalType,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    changes: entry.changes || {},
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
  });
}
