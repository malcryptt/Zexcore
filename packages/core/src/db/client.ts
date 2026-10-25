import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';
import { getTenantContext } from '../tenancy/context.js';
import { sql, eq, and, or, inArray, desc, asc } from 'drizzle-orm';

export { sql, eq, and, or, inArray, desc, asc };

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let globalSql: postgres.Sql | null = null;
let globalDb: DrizzleDb | null = null;

export function getDatabaseConnection(connectionString?: string): { sqlClient: postgres.Sql; db: DrizzleDb } {
  if (globalDb && globalSql) {
    return { sqlClient: globalSql, db: globalDb };
  }

  if (!connectionString && !process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    throw new Error('[FATAL] DATABASE_URL must be set in production');
  }
  const url =
    connectionString ||
    process.env.DATABASE_URL ||
    'postgres://zexcore_app:zexcore_secret@localhost:5433/zexcore_db';

  globalSql = postgres(url, {
    max: 20,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  globalDb = drizzle(globalSql, { schema });
  return { sqlClient: globalSql, db: globalDb };
}

/**
 * ADMIN connection (schema owner). Used ONLY for migrations, RLS/policy/function installation,
 * module DDL at boot, and test/seed provisioning. Request handling never uses it.
 *
 * Production requires ADMIN_DATABASE_URL to be a different role from DATABASE_URL: if the runtime
 * role could own tables, an injection bug could `ALTER TABLE ... DISABLE ROW LEVEL SECURITY`.
 * Set ZEXCORE_ALLOW_SINGLE_DB_ROLE=true to knowingly accept that risk (not recommended).
 */
let adminSql: postgres.Sql | null = null;
let adminDb: DrizzleDb | null = null;

export function getAdminConnection(): { sqlClient: postgres.Sql; db: DrizzleDb } {
  if (adminDb && adminSql) return { sqlClient: adminSql, db: adminDb };

  let url = process.env.ADMIN_DATABASE_URL;
  if (!url) {
    if (process.env.NODE_ENV === 'production' && process.env.ZEXCORE_ALLOW_SINGLE_DB_ROLE !== 'true') {
      throw new Error(
        '[FATAL SECURITY CONFIGURATION] ADMIN_DATABASE_URL is required in production and must be a different ' +
          'role from DATABASE_URL (schema owner vs. restricted runtime role). See docs/PRODUCTION_DATABASE.md.',
      );
    }
    url = process.env.DATABASE_URL || 'postgres://zexcore:zexcore_secret@localhost:5433/zexcore_db';
  }

  adminSql = postgres(url, { max: 4, idle_timeout: 20, connect_timeout: 10, onnotice: () => {} });
  adminDb = drizzle(adminSql, { schema });
  return { sqlClient: adminSql, db: adminDb };
}

export function getAdminDb(): DrizzleDb {
  return getAdminConnection().db;
}

export function getAdminSqlClient(): postgres.Sql {
  return getAdminConnection().sqlClient;
}

export function getDb(): DrizzleDb {
  return getDatabaseConnection().db;
}

export function getSqlClient(): postgres.Sql {
  return getDatabaseConnection().sqlClient;
}

/**
 * Executes database operations scoped to a tenant.
 * Sets the Postgres local session setting 'app.current_tenant_id' within a transaction,
 * activating Row-Level Security (RLS) on all tenant-scoped tables.
 */
export async function withTenantDb<T>(
  tenantId: string,
  callback: (tx: DrizzleDb) => Promise<T>,
): Promise<T> {
  const { db } = getDatabaseConnection();

  return await db.transaction(async (tx) => {
    // Set local session variable for PostgreSQL RLS policies
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
    return await callback(tx as unknown as DrizzleDb);
  });
}

/**
 * Executes a callback using the tenant from the active AsyncLocalStorage context,
 * or throws if not in a tenant context.
 */
export async function withCurrentTenantDb<T>(callback: (tx: DrizzleDb) => Promise<T>): Promise<T> {
  const context = getTenantContext();
  if (!context || !context.tenantId) {
    throw new Error('No tenant context found in execution scope for withCurrentTenantDb');
  }
  return withTenantDb(context.tenantId, callback);
}

/**
 * Utility to close the database pool cleanly during shutdown or tests.
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (globalSql) {
    await globalSql.end();
    globalSql = null;
    globalDb = null;
  }
  if (adminSql) {
    await adminSql.end();
    adminSql = null;
    adminDb = null;
  }
}

/**
 * Name of the restricted runtime role: DB_RUNTIME_ROLE, else the user in DATABASE_URL.
 */
export function getRuntimeRoleName(): string {
  if (process.env.DB_RUNTIME_ROLE) return process.env.DB_RUNTIME_ROLE;
  const url = process.env.DATABASE_URL || 'postgres://zexcore_app:x@localhost/db';
  try {
    return decodeURIComponent(new URL(url).username);
  } catch {
    return 'zexcore_app';
  }
}

export interface RoleSafetyReport {
  ok: boolean;
  problems: string[];
}

/**
 * Verifies the RUNTIME connection cannot undermine tenant isolation:
 * not superuser, not BYPASSRLS, owns no application tables, cannot create objects.
 * In production a failed check aborts boot.
 */
export async function checkRuntimeRoleSafety(): Promise<RoleSafetyReport> {
  const { sqlClient } = getDatabaseConnection();
  const problems: string[] = [];

  const [role] = await sqlClient.unsafe<{ rolsuper: boolean; rolbypassrls: boolean; rolcreaterole: boolean; rolcreatedb: boolean; current_user: string }[]>(
    `SELECT r.rolsuper, r.rolbypassrls, r.rolcreaterole, r.rolcreatedb, current_user
       FROM pg_roles r WHERE r.rolname = current_user`,
  );
  if (!role) return { ok: false, problems: ['cannot read current role'] };
  if (role.rolsuper) problems.push(`runtime role "${role.current_user}" is a SUPERUSER (bypasses RLS)`);
  if (role.rolbypassrls) problems.push(`runtime role "${role.current_user}" has BYPASSRLS`);
  if (role.rolcreaterole || role.rolcreatedb) problems.push(`runtime role "${role.current_user}" can create roles/databases`);

  const owned = await sqlClient.unsafe<{ tablename: string }[]>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tableowner = current_user LIMIT 5`,
  );
  if (owned.length > 0) {
    problems.push(`runtime role owns tables (${owned.map((r) => r.tablename).join(', ')}); owners can disable RLS`);
  }
  const [canCreate] = await sqlClient.unsafe<{ ok: boolean }[]>(
    `SELECT has_schema_privilege(current_user, 'public', 'CREATE') AS ok`,
  );
  if (canCreate?.ok) problems.push('runtime role has CREATE on schema public');

  return { ok: problems.length === 0, problems };
}
