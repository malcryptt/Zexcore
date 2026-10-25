import { getSqlClient } from '../db/client.js';
import type { AuditLogInput } from './types.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AuditVerification {
  valid: boolean;
  total: number;
  brokenSeq: number | null;
  reason: string | null;
  headSeq: number | null;
  /** Publish/anchor this externally (e.g. weekly) to detect truncation of the newest rows. */
  headHash: string | null;
}

/**
 * Appends a tamper-evident audit event for the entry's tenant.
 *
 * The write goes through the zex_audit_append() database function: the chain (sequence number,
 * previous hash, timestamp, SHA-256) is computed inside the database under a per-tenant advisory
 * lock, so concurrent writers cannot fork the chain and application code cannot forge links.
 * The table itself is append-only (triggers + no INSERT/UPDATE/DELETE grant for the app role).
 */
export async function logAuditEvent(entry: AuditLogInput): Promise<void> {
  const sqlClient = getSqlClient();
  const userId = entry.userId && UUID_RE.test(entry.userId) ? entry.userId : null;

  await sqlClient.begin(async (tx) => {
    await tx.unsafe(`SELECT set_config('app.current_tenant_id', $1, true)`, [entry.tenantId]);
    await tx.unsafe(`SELECT * FROM zex_audit_append($1::uuid,$2::uuid,$3,$4,$5,$6,$7::jsonb,$8,$9)`, [
      entry.tenantId,
      userId,
      entry.principalType,
      entry.action,
      entry.entity,
      entry.entityId ?? '',
      JSON.stringify(entry.changes || {}),
      entry.ipAddress ?? null,
      entry.userAgent ?? null,
    ] as any);
  });
}

/**
 * Recomputes every hash in a tenant's chain inside the database and checks links + sequence.
 */
export async function verifyAuditChain(tenantId: string): Promise<AuditVerification> {
  const sqlClient = getSqlClient();
  const rows = await sqlClient.begin(async (tx) => {
    await tx.unsafe(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId]);
    return await tx.unsafe<
      { out_valid: boolean; out_total: string; out_broken_seq: string | null; out_reason: string | null; out_head_seq: string | null; out_head_hash: string | null }[]
    >(`SELECT * FROM zex_audit_verify($1::uuid)`, [tenantId] as any);
  });
  const r = rows[0]!;
  return {
    valid: r.out_valid,
    total: Number(r.out_total),
    brokenSeq: r.out_broken_seq === null ? null : Number(r.out_broken_seq),
    reason: r.out_reason,
    headSeq: r.out_head_seq === null ? null : Number(r.out_head_seq),
    headHash: r.out_head_hash,
  };
}
