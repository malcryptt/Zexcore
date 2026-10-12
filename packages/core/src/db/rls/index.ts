import { sql } from 'drizzle-orm';
import { getDb, getSqlClient } from '../client.js';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Applies RLS enablement and default policies to an arbitrary tenant-scoped table.
 * Used by core starter tables and modules (e.g. cms_pages, crm_contacts).
 */
export async function applyRlsToTable(tableName: string): Promise<void> {
  const db = getDb();

  await db.execute(sql.raw(`ALTER TABLE IF EXISTS "${tableName}" ENABLE ROW LEVEL SECURITY;`));
  await db.execute(sql.raw(`ALTER TABLE IF EXISTS "${tableName}" FORCE ROW LEVEL SECURITY;`));

  const policyName = `tenant_isolation_${tableName.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  await db.execute(sql.raw(`DROP POLICY IF EXISTS "${policyName}" ON "${tableName}";`));

  await db.execute(
    sql.raw(`
    CREATE POLICY "${policyName}" ON "${tableName}"
      FOR ALL
      USING (
        current_setting('app.bypass_rls', true) = 'on'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
      )
      WITH CHECK (
        current_setting('app.bypass_rls', true) = 'on'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
      );
  `),
  );
}

/**
 * Applies the core RLS policies from policies.sql.
 */
export async function applyCoreRlsPolicies(): Promise<void> {
  const sqlClient = getSqlClient();
  const sqlPath = join(__dirname, 'policies.sql');
  const policySql = readFileSync(sqlPath, 'utf-8');
  await sqlClient.unsafe(policySql);
}
