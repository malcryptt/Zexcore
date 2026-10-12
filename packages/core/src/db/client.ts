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

  const url =
    connectionString ||
    process.env.DATABASE_URL ||
    'postgres://zexcore:zexcore_secret@localhost:5433/zexcore_db';

  globalSql = postgres(url, {
    max: 20,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  globalDb = drizzle(globalSql, { schema });
  return { sqlClient: globalSql, db: globalDb };
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
    await tx.execute(sql`SELECT set_config('app.bypass_rls', 'off', true)`);
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
}
