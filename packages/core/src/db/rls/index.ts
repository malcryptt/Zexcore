import { getAdminSqlClient } from '../client.js';
import { CORE_RLS_SQL, TENANT_GUC_EXPR } from '../sql/security.js';

/**
 * Applies tenant-isolation RLS to a tenant-scoped table (must have a tenant_id column).
 * Runs on the ADMIN connection. Idempotent: the policy is always dropped and recreated so a stale
 * policy from an older release (e.g. one with the removed bypass clause) can never survive.
 */
export async function applyRlsToTable(tableName: string): Promise<void> {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    throw new Error(`Unsafe table name for RLS: ${tableName}`);
  }
  const admin = getAdminSqlClient();
  const policyName = `tenant_isolation_${tableName}`;
  await admin.begin(async (tx) => {
    await tx.unsafe(`ALTER TABLE IF EXISTS "${tableName}" ENABLE ROW LEVEL SECURITY`);
    await tx.unsafe(`ALTER TABLE IF EXISTS "${tableName}" FORCE ROW LEVEL SECURITY`);
    await tx.unsafe(`DROP POLICY IF EXISTS "${policyName}" ON "${tableName}"`);
    // Table may not exist in partial deployments; skip silently like ENABLE ... IF EXISTS
    const exists = await tx.unsafe(`SELECT to_regclass('public."${tableName}"') AS t`);
    if (!exists[0]?.t) return;
    await tx.unsafe(
      `CREATE POLICY "${policyName}" ON "${tableName}" FOR ALL
         USING (tenant_id = ${TENANT_GUC_EXPR}) WITH CHECK (tenant_id = ${TENANT_GUC_EXPR})`,
    );
  });
}

/**
 * Applies the core RLS policies (memberships, content_types, records, audit_log, tenants, users,
 * billing_payments). Runs on the ADMIN connection.
 */
export async function applyCoreRlsPolicies(): Promise<void> {
  await getAdminSqlClient().unsafe(CORE_RLS_SQL);
}
