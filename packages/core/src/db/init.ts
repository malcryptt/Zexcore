import { getAdminSqlClient, getRuntimeRoleName } from './client.js';
import { applyCoreRlsPolicies, applyRlsToTable } from './rls/index.js';
import { STRUCTURE_SQL, SECURITY_FUNCTIONS_SQL, buildGrantsSql } from './sql/security.js';

const BOOTSTRAP_LOCK_KEY = 727000;

/**
 * Runs the whole boot-time setup (schema, every module's tables, grants) as one critical section across
 * all API instances/processes sharing a database. Concurrent DDL on a fresh database otherwise fails with
 * "deadlock detected", "tuple concurrently updated" or "duplicate key ... pg_type_typname_nsp_index"
 * (rolling deploys start the new instance while the old one is still booting or running).
 * A session-level advisory lock is released automatically if the process dies.
 */
export async function withBootstrapLock<T>(fn: () => Promise<T>): Promise<T> {
  const admin = getAdminSqlClient();
  const conn = await admin.reserve();
  try {
    await conn`SELECT pg_advisory_lock(${BOOTSTRAP_LOCK_KEY})`;
    try {
      return await fn();
    } finally {
      await conn`SELECT pg_advisory_unlock(${BOOTSTRAP_LOCK_KEY})`.catch(() => undefined);
    }
  } finally {
    conn.release();
  }
}

/**
 * Re-applies least-privilege grants for the runtime role. Must run AFTER every module has created
 * its tables (tables are created by the admin role, so the runtime role has no access until this).
 */
export async function grantRuntimeAccess(): Promise<void> {
  const admin = getAdminSqlClient();
  await admin.unsafe(buildGrantsSql(getRuntimeRoleName()));
}

/**
 * Creates/updates schema, RLS policies, security functions and audit triggers.
 * Uses the ADMIN connection (schema owner). Safe to run on every boot; serialised across
 * instances with an advisory lock.
 */
export async function initializeDatabaseSchema(): Promise<void> {
  const admin = getAdminSqlClient();
  await admin.begin(async (sql) => {
  await sql`SELECT pg_advisory_xact_lock(727001)`;

  // Create extension for UUID generation if not present
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  // 1. Tenants table
  await sql`
    CREATE TABLE IF NOT EXISTS tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug VARCHAR(64) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      status VARCHAR(32) DEFAULT 'active' NOT NULL,
      tier VARCHAR(32) DEFAULT 'standard' NOT NULL,
      config JSONB DEFAULT '{}'::jsonb NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `;

  // 2. Users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      is_platform_admin BOOLEAN DEFAULT FALSE NOT NULL,
      status VARCHAR(32) DEFAULT 'active' NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `;

  // 3. Memberships table
  await sql`
    CREATE TABLE IF NOT EXISTS memberships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      principal_type VARCHAR(32) DEFAULT 'tenant_user' NOT NULL,
      role VARCHAR(64) DEFAULT 'member' NOT NULL,
      capabilities JSONB DEFAULT '[]'::jsonb NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      CONSTRAINT memberships_tenant_user_unique UNIQUE (tenant_id, user_id)
    );
  `;

  // 4. Content Types table
  await sql`
    CREATE TABLE IF NOT EXISTS content_types (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      slug VARCHAR(64) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      schema_json JSONB NOT NULL,
      version INT DEFAULT 1 NOT NULL,
      is_system BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      CONSTRAINT content_types_tenant_slug_unique UNIQUE (tenant_id, slug)
    );
  `;

  // 5. Records table
  await sql`
    CREATE TABLE IF NOT EXISTS records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      content_type_id UUID NOT NULL REFERENCES content_types(id) ON DELETE CASCADE,
      slug VARCHAR(255),
      status VARCHAR(32) DEFAULT 'draft' NOT NULL,
      data JSONB DEFAULT '{}'::jsonb NOT NULL,
      version INT DEFAULT 1 NOT NULL,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS records_tenant_content_type_idx ON records(tenant_id, content_type_id);`;
  await sql`CREATE INDEX IF NOT EXISTS records_tenant_slug_idx ON records(tenant_id, slug);`;

  // 6. Audit Log table (with cryptographic hash-chaining)
  await sql`
    CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      principal_type VARCHAR(32) NOT NULL,
      action VARCHAR(64) NOT NULL,
      entity VARCHAR(64) NOT NULL,
      entity_id VARCHAR(255) NOT NULL,
      changes JSONB DEFAULT '{}'::jsonb NOT NULL,
      prev_hash VARCHAR(64),
      hash VARCHAR(64),
      ip_address VARCHAR(64),
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `;

  await sql`ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS prev_hash VARCHAR(64);`;
  await sql`ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS hash VARCHAR(64);`;

  await sql`CREATE INDEX IF NOT EXISTS audit_log_tenant_created_at_idx ON audit_log(tenant_id, created_at);`;
  await sql`CREATE INDEX IF NOT EXISTS audit_log_tenant_entity_idx ON audit_log(tenant_id, entity, entity_id);`;

  // 7. Transactional Outbox table
  await sql`
    CREATE TABLE IF NOT EXISTS outbox_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      event_name VARCHAR(64) NOT NULL,
      payload JSONB NOT NULL,
      status VARCHAR(32) DEFAULT 'pending' NOT NULL,
      retry_count INT DEFAULT 0 NOT NULL,
      error TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      processed_at TIMESTAMPTZ
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS outbox_events_tenant_status_idx ON outbox_events(tenant_id, status, created_at);`;

  // Structure additions (composite FKs, audit seq, billing), security functions, triggers
  await sql.unsafe(STRUCTURE_SQL);
  await sql.unsafe(SECURITY_FUNCTIONS_SQL);
  });

  // Row-Level Security policies (no bypass) + least-privilege grants
  await applyCoreRlsPolicies();
  await applyRlsToTable('outbox_events');
  await grantRuntimeAccess();
}
