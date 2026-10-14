import { getSqlClient } from '../db/client.js';
import type { AuditLogInput } from './types.js';
import { createHash } from 'node:crypto';

/**
 * Persists an immutable security audit trail event with cryptographic hash-chaining.
 * Forms a tamper-evident audit ledger per tenant.
 *
 * Runs with app.bypass_rls = 'on' because this is a trusted server-side write —
 * the RLS policy governs end-user data access, not internal audit trail writes.
 */
export async function logAuditEvent(entry: AuditLogInput): Promise<void> {
  const sqlClient = getSqlClient();

  // userId must be a valid UUID FK — coerce non-UUID strings (test IDs, service names) to null
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const resolvedUserId = entry.userId && uuidRegex.test(entry.userId) ? entry.userId : null;

  await sqlClient.begin(async (tx) => {
    // Bypass RLS: audit writes are always trusted internal server operations
    await tx.unsafe(`SELECT set_config('app.bypass_rls', 'on', true)`);

    // 1. Fetch latest audit entry for tenant to compute prevHash (hash-chain integrity)
    const prevRows = await tx.unsafe<{ hash: string }[]>(
      `SELECT hash FROM audit_log WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [entry.tenantId],
    );

    const prevHash =
      prevRows[0]?.hash ||
      '0000000000000000000000000000000000000000000000000000000000000000'; // 64-char genesis sentinel
    const timestamp = new Date().toISOString();

    // 2. Compute SHA-256 hash of this entry chained to prevHash
    const hash = createHash('sha256')
      .update(
        `${prevHash}:${entry.tenantId}:${entry.principalType}:${entry.action}:${entry.entity}:${entry.entityId}:${JSON.stringify(entry.changes || {})}:${timestamp}`,
      )
      .digest('hex');

    // 3. Append-only insert — audit records are never mutated or deleted
    await tx.unsafe(
      `INSERT INTO audit_log
         (tenant_id, user_id, principal_type, action, entity, entity_id,
          changes, prev_hash, hash, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        entry.tenantId,
        resolvedUserId,
        entry.principalType,
        entry.action,
        entry.entity,
        entry.entityId ?? null,
        JSON.stringify(entry.changes || {}),
        prevHash,
        hash,
        entry.ipAddress ?? null,
        entry.userAgent ?? null,
      ],
    );
  });
}
