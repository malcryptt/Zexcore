-- ==============================================================================
-- ZexCore Row-Level Security (RLS) Policies
-- Enforces absolute multi-tenant isolation at the database engine level.
-- ==============================================================================

-- 1. Enable & FORCE RLS on tenant-scoped tables
-- (FORCE ensures table owners and superusers in application roles adhere to RLS)

ALTER TABLE IF EXISTS memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS memberships FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS content_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_types FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS records FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log FORCE ROW LEVEL SECURITY;

-- 2. Drop existing policies if re-applying
DROP POLICY IF EXISTS tenant_isolation_memberships ON memberships;
DROP POLICY IF EXISTS tenant_isolation_content_types ON content_types;
DROP POLICY IF EXISTS tenant_isolation_records ON records;
DROP POLICY IF EXISTS tenant_isolation_audit_log ON audit_log;

-- 3. Create Tenant Isolation Policies
-- Evaluates current_setting('app.current_tenant_id', true)
-- Rejects all operations if app.current_tenant_id is missing/empty/mismatched

CREATE POLICY tenant_isolation_memberships ON memberships
  FOR ALL
  USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  );

CREATE POLICY tenant_isolation_content_types ON content_types
  FOR ALL
  USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  );

CREATE POLICY tenant_isolation_records ON records
  FOR ALL
  USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  );

CREATE POLICY tenant_isolation_audit_log ON audit_log
  FOR ALL
  USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  );
