import { getSqlClient } from './client.js';
import { applyCoreRlsPolicies } from './rls/index.js';

export async function initializeDatabaseSchema(): Promise<void> {
  const sql = getSqlClient();

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

  // 6. Audit Log table
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
      ip_address VARCHAR(64),
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS audit_log_tenant_created_at_idx ON audit_log(tenant_id, created_at);`;
  await sql`CREATE INDEX IF NOT EXISTS audit_log_tenant_entity_idx ON audit_log(tenant_id, entity, entity_id);`;

  // Apply Row-Level Security policies
  await applyCoreRlsPolicies();
}
