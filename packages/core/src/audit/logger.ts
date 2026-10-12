import { getDb } from '../db/client.js';
import { auditLog } from '../db/schema/audit_log.js';
import type { AuditLogInput } from './types.js';
import { createHash } from 'node:crypto';
import { eq, desc } from 'drizzle-orm';

/**
 * Persists an immutable security audit trail event with cryptographic hash-chaining.
 * Forms a tamper-evident audit ledger per tenant.
 */
export async function logAuditEvent(entry: AuditLogInput): Promise<void> {
  const db = getDb();

  // 1. Fetch latest audit entry for tenant to compute prevHash
  const [latestEntry] = await db
    .select({ hash: auditLog.hash })
    .from(auditLog)
    .where(eq(auditLog.tenantId, entry.tenantId))
    .orderBy(desc(auditLog.createdAt))
    .limit(1);

  const prevHash = latestEntry?.hash || 'GENESIS_000000000000000000000000000000000000000000000000000000000000';
  const timestamp = new Date().toISOString();

  // 2. Compute SHA-256 hash of this entry chained to prevHash
  const hash = createHash('sha256')
    .update(
      `${prevHash}:${entry.tenantId}:${entry.principalType}:${entry.action}:${entry.entity}:${entry.entityId}:${JSON.stringify(entry.changes || {})}:${timestamp}`,
    )
    .digest('hex');

  // 3. Insert append-only record
  await db.insert(auditLog).values({
    tenantId: entry.tenantId,
    userId: entry.userId,
    principalType: entry.principalType,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    changes: entry.changes || {},
    prevHash,
    hash,
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
  });
}
