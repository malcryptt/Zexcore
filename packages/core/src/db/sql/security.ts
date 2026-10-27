/**
 * Database-level security objects, installed by the ADMIN (schema owner) connection only.
 *
 * Model:
 *  - Tenant-scoped tables: ENABLE + FORCE RLS, policy = tenant_id matches app.current_tenant_id.
 *    There is NO bypass setting. Nothing the app role can SET makes another tenant's rows visible.
 *  - tenants / users / memberships / billing_payments: RLS enabled (owner exempt, so definer functions work). The runtime role can only
 *    see its own tenant row; users are invisible to it. Cross-tenant lookups (login, tenant
 *    resolution, plan activation, audit append) go through narrow SECURITY DEFINER functions.
 *  - audit_log: append-only (triggers + no INSERT/UPDATE/DELETE grant), written only through
 *    zex_audit_append(), hash-chained in the database, verifiable with zex_audit_verify().
 */

export const TENANT_GUC_EXPR = `NULLIF(current_setting('app.current_tenant_id', true), '')::uuid`;

export const CORE_RLS_SQL = `
ALTER TABLE IF EXISTS memberships   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS memberships   NO FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_types FORCE  ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS records       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS records       FORCE  ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log     FORCE  ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_memberships   ON memberships;
DROP POLICY IF EXISTS tenant_isolation_content_types ON content_types;
DROP POLICY IF EXISTS tenant_isolation_records       ON records;
DROP POLICY IF EXISTS tenant_isolation_audit_log     ON audit_log;

CREATE POLICY tenant_isolation_memberships ON memberships FOR ALL
  USING (tenant_id = ${TENANT_GUC_EXPR}) WITH CHECK (tenant_id = ${TENANT_GUC_EXPR});
CREATE POLICY tenant_isolation_content_types ON content_types FOR ALL
  USING (tenant_id = ${TENANT_GUC_EXPR}) WITH CHECK (tenant_id = ${TENANT_GUC_EXPR});
CREATE POLICY tenant_isolation_records ON records FOR ALL
  USING (tenant_id = ${TENANT_GUC_EXPR}) WITH CHECK (tenant_id = ${TENANT_GUC_EXPR});
CREATE POLICY tenant_isolation_audit_log ON audit_log FOR ALL
  USING (tenant_id = ${TENANT_GUC_EXPR}) WITH CHECK (tenant_id = ${TENANT_GUC_EXPR});

-- tenants: runtime role may only read its own row. No INSERT/UPDATE/DELETE policy => denied.
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_self_select ON tenants;
CREATE POLICY tenant_self_select ON tenants FOR SELECT USING (id = ${TENANT_GUC_EXPR});

-- users: no policy => runtime role sees nothing. Login uses zex_login_lookup().
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- billing_payments: tenants may read their own and create PENDING intents; only
-- zex_activate_plan() (verified webhook path) can change status.
ALTER TABLE billing_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bp_select ON billing_payments;
DROP POLICY IF EXISTS bp_insert ON billing_payments;
CREATE POLICY bp_select ON billing_payments FOR SELECT USING (tenant_id = ${TENANT_GUC_EXPR});
CREATE POLICY bp_insert ON billing_payments FOR INSERT
  WITH CHECK (tenant_id = ${TENANT_GUC_EXPR} AND status = 'pending');
`;

export const STRUCTURE_SQL = `
-- Composite FK: a record can only reference a content type of the SAME tenant.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_types_tenant_id_id_unique') THEN
    ALTER TABLE content_types ADD CONSTRAINT content_types_tenant_id_id_unique UNIQUE (tenant_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'records_tenant_content_type_fk') THEN
    ALTER TABLE records ADD CONSTRAINT records_tenant_content_type_fk
      FOREIGN KEY (tenant_id, content_type_id) REFERENCES content_types (tenant_id, id) ON DELETE CASCADE;
  END IF;
END $$;

-- audit_log: sequence number for gap detection; drop the user FK (ON DELETE SET NULL would try to
-- UPDATE audit rows, which are immutable).
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS seq BIGINT;
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey;
CREATE UNIQUE INDEX IF NOT EXISTS audit_log_tenant_seq_uidx ON audit_log (tenant_id, seq) WHERE seq IS NOT NULL;

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_cycle VARCHAR(16);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS billing_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  reference VARCHAR(128) NOT NULL UNIQUE,
  tier VARCHAR(32) NOT NULL,
  cycle VARCHAR(16) NOT NULL CHECK (cycle IN ('monthly','annual')),
  currency VARCHAR(8) NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','mismatch')),
  gateway VARCHAR(32),
  paid_minor BIGINT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS billing_payments_tenant_idx ON billing_payments (tenant_id, created_at);

-- ── Auth: email verification + revocable sessions + one-time tokens ─────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  user_agent VARCHAR(255),
  ip VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS auth_sessions_user_idx ON auth_sessions (user_id);

CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind VARCHAR(16) NOT NULL CHECK (kind IN ('verify','reset')),
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS auth_tokens_user_idx ON auth_tokens (user_id, kind);
-- Deny-by-default for the runtime role: only the SECURITY DEFINER functions below touch these tables.
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;
`;

export const SECURITY_FUNCTIONS_SQL = `
-- ── Hash-chain primitive (single source of truth for append AND verify) ─────────────
CREATE OR REPLACE FUNCTION zex_audit_hash(
  p_prev text, p_tenant uuid, p_seq bigint, p_user uuid, p_principal text, p_action text,
  p_entity text, p_entity_id text, p_changes jsonb, p_ts timestamptz
) RETURNS text LANGUAGE sql IMMUTABLE AS $f$
  SELECT encode(sha256(convert_to(jsonb_build_array(
    coalesce(p_prev, ''), p_tenant::text, p_seq, coalesce(p_user::text, ''), p_principal, p_action,
    p_entity, p_entity_id, p_changes,
    to_char(p_ts AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
  )::text, 'UTF8')), 'hex')
$f$;

-- ── Append (internal, no tenant check; never granted to the runtime role) ───────────
CREATE OR REPLACE FUNCTION zex_audit_append_unchecked(
  p_tenant uuid, p_user uuid, p_principal text, p_action text, p_entity text, p_entity_id text,
  p_changes jsonb, p_ip text, p_ua text
) RETURNS TABLE (out_seq bigint, out_hash text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
DECLARE
  v_guc text; v_prev_hash text; v_seq bigint; v_ts timestamptz; v_hash text;
BEGIN
  v_guc := current_setting('app.current_tenant_id', true);
  PERFORM set_config('app.current_tenant_id', p_tenant::text, true);
  -- serialise appends per tenant so the chain cannot fork under concurrency
  PERFORM pg_advisory_xact_lock(hashtextextended('zex_audit:' || p_tenant::text, 0));

  SELECT a.seq, a.hash INTO v_seq, v_prev_hash
    FROM audit_log a WHERE a.tenant_id = p_tenant AND a.seq IS NOT NULL
    ORDER BY a.seq DESC LIMIT 1;
  v_seq := coalesce(v_seq, 0) + 1;
  v_ts := clock_timestamp();
  v_hash := zex_audit_hash(v_prev_hash, p_tenant, v_seq, p_user, p_principal, p_action,
                           p_entity, coalesce(p_entity_id, ''), coalesce(p_changes, '{}'::jsonb), v_ts);

  INSERT INTO audit_log (tenant_id, user_id, principal_type, action, entity, entity_id, changes,
                         prev_hash, hash, seq, ip_address, user_agent, created_at)
  VALUES (p_tenant, p_user, p_principal, p_action, p_entity, coalesce(p_entity_id, ''),
          coalesce(p_changes, '{}'::jsonb), v_prev_hash, v_hash, v_seq, p_ip, p_ua, v_ts);

  PERFORM set_config('app.current_tenant_id', coalesce(v_guc, ''), true);
  RETURN QUERY SELECT v_seq, v_hash;
END $f$;

-- ── Append (runtime-facing: only for the caller's own tenant) ───────────────────────
CREATE OR REPLACE FUNCTION zex_audit_append(
  p_tenant uuid, p_user uuid, p_principal text, p_action text, p_entity text, p_entity_id text,
  p_changes jsonb, p_ip text, p_ua text
) RETURNS TABLE (out_seq bigint, out_hash text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
BEGIN
  IF p_tenant IS DISTINCT FROM NULLIF(current_setting('app.current_tenant_id', true), '')::uuid THEN
    RAISE EXCEPTION 'audit append refused: tenant does not match session tenant' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM zex_audit_append_unchecked(
    p_tenant, p_user, p_principal, p_action, p_entity, p_entity_id, p_changes, p_ip, p_ua);
END $f$;

-- ── Verify: recompute every hash, check links and sequence (own tenant only) ────────
CREATE OR REPLACE FUNCTION zex_audit_verify(p_tenant uuid)
RETURNS TABLE (out_valid boolean, out_total bigint, out_broken_seq bigint, out_reason text,
               out_head_seq bigint, out_head_hash text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
DECLARE
  r record; v_prev text := NULL; v_expect bigint := 1; v_total bigint := 0; v_head_seq bigint; v_head_hash text;
  v_guc text;
BEGIN
  IF p_tenant IS DISTINCT FROM NULLIF(current_setting('app.current_tenant_id', true), '')::uuid THEN
    RAISE EXCEPTION 'audit verify refused: tenant does not match session tenant' USING ERRCODE = '42501';
  END IF;
  FOR r IN SELECT * FROM audit_log a WHERE a.tenant_id = p_tenant AND a.seq IS NOT NULL ORDER BY a.seq LOOP
    v_total := v_total + 1;
    IF r.seq <> v_expect THEN
      RETURN QUERY SELECT false, v_total, r.seq, format('sequence gap: expected %s got %s', v_expect, r.seq), v_head_seq, v_head_hash; RETURN;
    END IF;
    IF r.prev_hash IS DISTINCT FROM v_prev THEN
      RETURN QUERY SELECT false, v_total, r.seq, 'prev_hash does not match previous row', v_head_seq, v_head_hash; RETURN;
    END IF;
    IF r.hash IS DISTINCT FROM zex_audit_hash(r.prev_hash, r.tenant_id, r.seq, r.user_id, r.principal_type,
         r.action, r.entity, r.entity_id, r.changes, r.created_at) THEN
      RETURN QUERY SELECT false, v_total, r.seq, 'row content does not match its hash', v_head_seq, v_head_hash; RETURN;
    END IF;
    v_prev := r.hash; v_expect := r.seq + 1; v_head_seq := r.seq; v_head_hash := r.hash;
  END LOOP;
  RETURN QUERY SELECT true, v_total, NULL::bigint, NULL::text, v_head_seq, v_head_hash;
END $f$;

CREATE OR REPLACE FUNCTION zex_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only: % is not permitted', TG_OP USING ERRCODE = '42501';
END $f$;

DROP TRIGGER IF EXISTS audit_log_no_mutate ON audit_log;
CREATE TRIGGER audit_log_no_mutate BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION zex_audit_immutable();
DROP TRIGGER IF EXISTS audit_log_no_truncate ON audit_log;
CREATE TRIGGER audit_log_no_truncate BEFORE TRUNCATE ON audit_log
  FOR EACH STATEMENT EXECUTE FUNCTION zex_audit_immutable();

-- ── Controlled cross-tenant lookups ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION zex_resolve_tenant(p_id uuid, p_slug text)
RETURNS TABLE (id uuid, slug varchar, tier varchar, status varchar)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
  SELECT t.id, t.slug, t.tier, t.status FROM tenants t
   WHERE t.status = 'active'
     AND ((p_id IS NOT NULL AND t.id = p_id) OR (p_id IS NULL AND p_slug IS NOT NULL AND t.slug = p_slug))
   LIMIT 1
$f$;

CREATE OR REPLACE FUNCTION zex_login_lookup(p_email text)
RETURNS TABLE (id uuid, email varchar, password_hash varchar, name varchar, is_platform_admin boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
  SELECT u.id, u.email, u.password_hash, u.name, u.is_platform_admin FROM users u
   WHERE lower(u.email) = lower(p_email) AND u.status = 'active' LIMIT 1
$f$;

-- ── Plan activation: the ONLY way a tenant's tier changes at runtime ────────────────
CREATE OR REPLACE FUNCTION zex_activate_plan(p_reference text, p_gateway text, p_paid_minor bigint, p_currency text)
RETURNS TABLE (out_outcome text, out_tenant uuid, out_tier text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
DECLARE v billing_payments%ROWTYPE;
BEGIN
  SELECT * INTO v FROM billing_payments WHERE reference = p_reference FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'unknown_reference'::text, NULL::uuid, NULL::text; RETURN;
  END IF;
  IF v.status = 'paid' THEN
    RETURN QUERY SELECT 'duplicate'::text, v.tenant_id, v.tier::text; RETURN;
  END IF;
  IF upper(p_currency) <> upper(v.currency) OR p_paid_minor < v.amount_minor THEN
    UPDATE billing_payments SET status = 'mismatch', gateway = p_gateway, paid_minor = p_paid_minor WHERE id = v.id;
    PERFORM zex_audit_append_unchecked(v.tenant_id, NULL, 'system', 'billing.payment_mismatch', 'billing_payment', v.reference,
      jsonb_build_object('expected_minor', v.amount_minor, 'expected_currency', v.currency,
                         'paid_minor', p_paid_minor, 'paid_currency', upper(p_currency), 'gateway', p_gateway), NULL, NULL);
    RETURN QUERY SELECT 'amount_mismatch'::text, v.tenant_id, v.tier::text; RETURN;
  END IF;
  UPDATE billing_payments SET status = 'paid', gateway = p_gateway, paid_minor = p_paid_minor, paid_at = now() WHERE id = v.id;
  UPDATE tenants SET tier = v.tier, plan_cycle = v.cycle, updated_at = now(),
         plan_expires_at = now() + (CASE v.cycle WHEN 'annual' THEN interval '365 days' ELSE interval '31 days' END)
   WHERE id = v.tenant_id;
  PERFORM zex_audit_append_unchecked(v.tenant_id, NULL, 'system', 'billing.plan_activated', 'tenant', v.tenant_id::text,
    jsonb_build_object('reference', v.reference, 'tier', v.tier, 'cycle', v.cycle,
                       'gateway', p_gateway, 'paid_minor', p_paid_minor, 'currency', upper(p_currency)), NULL, NULL);
  RETURN QUERY SELECT 'activated'::text, v.tenant_id, v.tier::text;
END $f$;

-- ── Booking deposit settlement (verified webhook path; owner-run, sets tenant GUC itself) ──────
CREATE OR REPLACE FUNCTION zex_settle_deposit(p_reference text, p_gateway text, p_paid_minor bigint, p_currency text)
RETURNS TABLE (out_outcome text, out_tenant uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
DECLARE v record;
BEGIN
  IF to_regclass('public.bk_bookings') IS NULL THEN
    RETURN QUERY SELECT 'unknown_reference'::text, NULL::uuid; RETURN;
  END IF;
  SELECT * INTO v FROM bk_bookings WHERE payment_reference = p_reference FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'unknown_reference'::text, NULL::uuid; RETURN;
  END IF;
  IF v.deposit_status = 'paid' THEN
    RETURN QUERY SELECT 'duplicate'::text, v.tenant_id; RETURN;
  END IF;
  IF upper(p_currency) <> upper(v.currency) OR p_paid_minor < v.deposit_minor THEN
    UPDATE bk_bookings SET deposit_status = 'mismatch', updated_at = now() WHERE id = v.id;
    PERFORM zex_audit_append_unchecked(v.tenant_id, NULL, 'system', 'bookings.deposit_mismatch', 'booking', v.id::text,
      jsonb_build_object('reference', v.payment_reference, 'expected_minor', v.deposit_minor, 'expected_currency', v.currency,
                         'paid_minor', p_paid_minor, 'paid_currency', upper(p_currency), 'gateway', p_gateway), NULL, NULL);
    RETURN QUERY SELECT 'amount_mismatch'::text, v.tenant_id; RETURN;
  END IF;
  UPDATE bk_bookings
     SET deposit_status = 'paid', paid_at = now(), updated_at = now(),
         status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END
   WHERE id = v.id;
  INSERT INTO bk_messages (tenant_id, booking_id, customer_name, customer_phone, direction, kind, body)
  VALUES (v.tenant_id, v.id, v.customer_name, v.customer_phone, 'in', 'payment',
          'Deposit of ' || v.currency || ' ' || to_char(p_paid_minor / 100.0, 'FM999,999,999,990.00') || ' received for ' || v.ref
          || ' (' || p_gateway || ' ref ' || v.payment_reference || ')');
  PERFORM zex_audit_append_unchecked(v.tenant_id, NULL, 'system', 'bookings.deposit_paid', 'booking', v.id::text,
    jsonb_build_object('ref', v.ref, 'reference', v.payment_reference, 'gateway', p_gateway, 'paid_minor', p_paid_minor, 'currency', upper(p_currency)), NULL, NULL);
  RETURN QUERY SELECT 'activated'::text, v.tenant_id;
END $f$;

-- ── Self-service signup: tenant + owner user + membership, atomically ───────────────
CREATE OR REPLACE FUNCTION zex_register_tenant(
  p_slug text, p_tenant_name text, p_email text, p_user_name text, p_password_hash text
) RETURNS TABLE (out_tenant uuid, out_user uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
DECLARE v_tenant uuid; v_user uuid; v_guc text; v_email text := lower(trim(p_email));
BEGIN
  IF p_slug !~ '^[a-z0-9][a-z0-9-]{2,39}$' THEN
    RAISE EXCEPTION 'invalid_slug' USING ERRCODE = '22023';
  END IF;
  IF p_slug = ANY (ARRAY['www','api','app','admin','console','dashboard','static','assets','docs','status','mail','support','billing','zexcore','zexlabs','signin','signup','login','logout','forgot-password','reset-password','verify-email','security','pricing','product','security','contact','privacy','terms','about','blog','book','booking','bookings','onboarding','pay','legal','help','null','undefined']) THEN
    RAISE EXCEPTION 'reserved_slug' USING ERRCODE = '22023';
  END IF;
  IF v_email !~ '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' OR length(v_email) > 254 THEN
    RAISE EXCEPTION 'invalid_email' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM tenants WHERE slug = p_slug) THEN
    RAISE EXCEPTION 'slug_taken' USING ERRCODE = '23505';
  END IF;
  IF EXISTS (SELECT 1 FROM users WHERE lower(email) = v_email) THEN
    RAISE EXCEPTION 'email_taken' USING ERRCODE = '23505';
  END IF;

  INSERT INTO tenants (slug, name, tier) VALUES (p_slug, left(trim(p_tenant_name), 255), 'free') RETURNING id INTO v_tenant;
  INSERT INTO users (email, password_hash, name) VALUES (v_email, p_password_hash, left(trim(p_user_name), 255)) RETURNING id INTO v_user;

  v_guc := current_setting('app.current_tenant_id', true);
  PERFORM set_config('app.current_tenant_id', v_tenant::text, true);
  INSERT INTO memberships (tenant_id, user_id, principal_type, role) VALUES (v_tenant, v_user, 'tenant_admin', 'owner');
  PERFORM set_config('app.current_tenant_id', coalesce(v_guc, ''), true);

  PERFORM zex_audit_append_unchecked(v_tenant, v_user, 'tenant_admin', 'tenant.registered', 'tenant', v_tenant::text,
    jsonb_build_object('slug', p_slug), NULL, NULL);
  RETURN QUERY SELECT v_tenant, v_user;
END $f$;

-- ── Workspaces a user belongs to (login without knowing the slug) ───────────────────
-- memberships is ENABLE-only (owner exempt, like tenants/users): the runtime role stays filtered by
-- the tenant policy, while this owner-run function can answer a single-user question efficiently.
CREATE OR REPLACE FUNCTION zex_user_tenants(p_user uuid)
RETURNS TABLE (id uuid, slug varchar, name varchar, role varchar)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
  SELECT t.id, t.slug, t.name, m.role FROM memberships m
    JOIN tenants t ON t.id = m.tenant_id AND t.status = 'active'
   WHERE m.user_id = p_user ORDER BY t.created_at
$f$;

-- ── Profile of a user, only if they belong to the caller's current tenant ───────────
CREATE OR REPLACE FUNCTION zex_user_profile(p_user uuid)
RETURNS TABLE (id uuid, email varchar, name varchar)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
  SELECT u.id, u.email, u.name FROM users u
   WHERE u.id = p_user AND EXISTS (
     SELECT 1 FROM memberships m
      WHERE m.user_id = u.id AND m.tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
$f$;

-- ── Revocable sessions (the JWT carries the session id; every request re-checks it) ──
CREATE OR REPLACE FUNCTION zex_session_create(p_user uuid, p_ttl_seconds int, p_ua text, p_ip text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
DECLARE v_id uuid;
BEGIN
  DELETE FROM auth_sessions WHERE user_id = p_user AND (expires_at < now() - interval '14 days' OR revoked_at < now() - interval '14 days');
  INSERT INTO auth_sessions (user_id, expires_at, user_agent, ip)
    VALUES (p_user, now() + make_interval(secs => p_ttl_seconds), left(p_ua, 255), left(p_ip, 64)) RETURNING id INTO v_id;
  RETURN v_id;
END $f$;

CREATE OR REPLACE FUNCTION zex_session_valid(p_sid uuid, p_user uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
DECLARE v_ok boolean;
BEGIN
  SELECT true INTO v_ok FROM auth_sessions s JOIN users u ON u.id = s.user_id
   WHERE s.id = p_sid AND s.user_id = p_user AND s.revoked_at IS NULL AND s.expires_at > now() AND u.status = 'active';
  IF v_ok THEN
    UPDATE auth_sessions SET last_seen_at = now() WHERE id = p_sid AND last_seen_at < now() - interval '5 minutes';
  END IF;
  RETURN coalesce(v_ok, false);
END $f$;

CREATE OR REPLACE FUNCTION zex_session_revoke(p_sid uuid, p_user uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
DECLARE v_n int;
BEGIN
  UPDATE auth_sessions SET revoked_at = now() WHERE id = p_sid AND user_id = p_user AND revoked_at IS NULL;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RETURN v_n > 0;
END $f$;

CREATE OR REPLACE FUNCTION zex_session_revoke_all(p_user uuid, p_except uuid)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
DECLARE v_n int;
BEGIN
  UPDATE auth_sessions SET revoked_at = now()
   WHERE user_id = p_user AND revoked_at IS NULL AND (p_except IS NULL OR id <> p_except);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RETURN v_n;
END $f$;

CREATE OR REPLACE FUNCTION zex_session_list(p_user uuid)
RETURNS TABLE (id uuid, created_at timestamptz, last_seen_at timestamptz, user_agent varchar, ip varchar)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
  SELECT s.id, s.created_at, s.last_seen_at, s.user_agent, s.ip FROM auth_sessions s
   WHERE s.user_id = p_user AND s.revoked_at IS NULL AND s.expires_at > now()
   ORDER BY s.last_seen_at DESC LIMIT 50
$f$;

-- ── One-time tokens (email verification, password reset). Only the SHA-256 hash is stored. ──
CREATE OR REPLACE FUNCTION zex_token_issue(p_user uuid, p_kind text, p_hash text, p_ttl_seconds int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
BEGIN
  DELETE FROM auth_tokens WHERE user_id = p_user AND kind = p_kind AND used_at IS NULL;
  INSERT INTO auth_tokens (user_id, kind, token_hash, expires_at) VALUES (p_user, p_kind, p_hash, now() + make_interval(secs => p_ttl_seconds));
END $f$;

CREATE OR REPLACE FUNCTION zex_token_consume(p_hash text, p_kind text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
DECLARE v_user uuid;
BEGIN
  UPDATE auth_tokens SET used_at = now()
   WHERE token_hash = p_hash AND kind = p_kind AND used_at IS NULL AND expires_at > now()
   RETURNING user_id INTO v_user;
  RETURN v_user;
END $f$;

CREATE OR REPLACE FUNCTION zex_token_peek(p_hash text, p_kind text)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
  SELECT user_id FROM auth_tokens WHERE token_hash = p_hash AND kind = p_kind AND used_at IS NULL AND expires_at > now()
$f$;

-- Changing a password signs the account out everywhere.
CREATE OR REPLACE FUNCTION zex_set_password(p_user uuid, p_hash text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
BEGIN
  UPDATE users SET password_hash = p_hash, updated_at = now() WHERE id = p_user;
  UPDATE auth_sessions SET revoked_at = now() WHERE user_id = p_user AND revoked_at IS NULL;
END $f$;

CREATE OR REPLACE FUNCTION zex_mark_email_verified(p_user uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
  UPDATE users SET email_verified_at = coalesce(email_verified_at, now()), updated_at = now() WHERE id = p_user
$f$;

CREATE OR REPLACE FUNCTION zex_user_account(p_user uuid)
RETURNS TABLE (id uuid, email varchar, name varchar, email_verified boolean, password_hash varchar)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $f$
  SELECT u.id, u.email, u.name, u.email_verified_at IS NOT NULL, u.password_hash FROM users u WHERE u.id = p_user AND u.status = 'active'
$f$;
`;

const RUNTIME_FUNCTIONS = [
  'zex_audit_append(uuid, uuid, text, text, text, text, jsonb, text, text)',
  'zex_audit_verify(uuid)',
  'zex_resolve_tenant(uuid, text)',
  'zex_login_lookup(text)',
  'zex_activate_plan(text, text, bigint, text)',
  'zex_register_tenant(text, text, text, text, text)',
  'zex_user_profile(uuid)',
  'zex_settle_deposit(text, text, bigint, text)',
  'zex_user_tenants(uuid)',
  'zex_session_create(uuid, int, text, text)',
  'zex_session_valid(uuid, uuid)',
  'zex_session_revoke(uuid, uuid)',
  'zex_session_revoke_all(uuid, uuid)',
  'zex_session_list(uuid)',
  'zex_token_issue(uuid, text, text, int)',
  'zex_token_consume(text, text)',
  'zex_token_peek(text, text)',
  'zex_set_password(uuid, text)',
  'zex_mark_email_verified(uuid)',
  'zex_user_account(uuid)',
];
const INTERNAL_FUNCTIONS = [
  'zex_audit_append_unchecked(uuid, uuid, text, text, text, text, jsonb, text, text)',
  'zex_audit_hash(text, uuid, bigint, uuid, text, text, text, text, jsonb, timestamptz)',
];

export function buildGrantsSql(role: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/.test(role)) {
    throw new Error(`Unsafe runtime role name: ${role}`);
  }
  const r = `"${role}"`;
  return `
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM ${r};
GRANT USAGE ON SCHEMA public TO ${r};
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${r};
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${r};

-- Principle of least privilege on the sensitive tables
REVOKE ALL ON users FROM ${r};
REVOKE ALL ON auth_sessions FROM ${r};
REVOKE ALL ON auth_tokens FROM ${r};
REVOKE ALL ON tenants FROM ${r};
GRANT SELECT ON tenants TO ${r};
REVOKE ALL ON audit_log FROM ${r};
GRANT SELECT ON audit_log TO ${r};
REVOKE UPDATE, DELETE, TRUNCATE ON billing_payments FROM ${r};

${INTERNAL_FUNCTIONS.map((f) => `REVOKE ALL ON FUNCTION ${f} FROM PUBLIC; REVOKE ALL ON FUNCTION ${f} FROM ${r};`).join('\n')}
${RUNTIME_FUNCTIONS.map((f) => `REVOKE ALL ON FUNCTION ${f} FROM PUBLIC; GRANT EXECUTE ON FUNCTION ${f} TO ${r};`).join('\n')}
`;
}
