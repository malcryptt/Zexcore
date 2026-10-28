import { retrying } from './retry.js';
import { getSqlClient } from './client.js';

/**
 * Narrow, audited cross-tenant lookups. They call SECURITY DEFINER functions installed by the
 * schema owner; the runtime role has no direct access to the users table and can read only its own
 * tenant row, so these are the ONLY ways request code reaches across tenants.
 */

export interface ResolvedTenant {
  id: string;
  slug: string;
  tier: string;
  status: string;
}

export async function resolveTenant(by: { id?: string; slug?: string }): Promise<ResolvedTenant | undefined> {
  const sql = retrying(getSqlClient());
  const rows = await sql.unsafe<ResolvedTenant[]>(`SELECT * FROM zex_resolve_tenant($1::uuid, $2::text)`, [
    by.id ?? null,
    by.id ? null : by.slug ?? null,
  ] as any);
  return rows[0];
}

export interface LoginUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  is_platform_admin: boolean;
}

export async function lookupUserForLogin(email: string): Promise<LoginUser | undefined> {
  const sql = retrying(getSqlClient());
  const rows = await sql.unsafe<LoginUser[]>(`SELECT * FROM zex_login_lookup($1::text)`, [email] as any);
  return rows[0];
}

export interface PlanActivationResult {
  outcome: 'activated' | 'duplicate' | 'amount_mismatch' | 'unknown_reference';
  tenantId: string | null;
  tier: string | null;
}

/** Atomically validates a verified gateway payment against its server-created intent and upgrades the tenant. */
export async function activatePlan(args: {
  reference: string;
  gateway: string;
  paidMinor: number;
  currency: string;
}): Promise<PlanActivationResult> {
  const sql = retrying(getSqlClient());
  const rows = await sql.unsafe<{ out_outcome: PlanActivationResult['outcome']; out_tenant: string | null; out_tier: string | null }[]>(
    `SELECT * FROM zex_activate_plan($1::text, $2::text, $3::bigint, $4::text)`,
    [args.reference, args.gateway, String(Math.round(args.paidMinor)), args.currency] as any,
  );
  const r = rows[0]!;
  return { outcome: r.out_outcome, tenantId: r.out_tenant, tier: r.out_tier };
}

export interface DepositSettlementResult {
  outcome: 'activated' | 'duplicate' | 'amount_mismatch' | 'unknown_reference';
  tenantId: string | null;
}

/** Validates a verified gateway payment against a booking deposit intent and confirms the booking. */
export async function settleDeposit(args: {
  reference: string;
  gateway: string;
  paidMinor: number;
  currency: string;
}): Promise<DepositSettlementResult> {
  const sql = retrying(getSqlClient());
  const rows = await sql.unsafe<{ out_outcome: DepositSettlementResult['outcome']; out_tenant: string | null }[]>(
    `SELECT * FROM zex_settle_deposit($1::text, $2::text, $3::bigint, $4::text)`,
    [args.reference, args.gateway, String(Math.round(args.paidMinor)), args.currency] as any,
  );
  const r = rows[0]!;
  return { outcome: r.out_outcome, tenantId: r.out_tenant };
}

export interface UserWorkspace { id: string; slug: string; name: string; role: string }

export async function listUserWorkspaces(userId: string): Promise<UserWorkspace[]> {
  const sql = retrying(getSqlClient());
  return sql.unsafe<UserWorkspace[]>(`SELECT * FROM zex_user_tenants($1::uuid)`, [userId] as any);
}

export class RegistrationError extends Error {
  constructor(public code: 'invalid_slug' | 'reserved_slug' | 'invalid_email' | 'slug_taken' | 'email_taken') {
    super(code);
  }
}

/** Atomically creates tenant + owner user + membership (free tier). */
export async function registerTenant(args: {
  slug: string;
  tenantName: string;
  email: string;
  userName: string;
  passwordHash: string;
}): Promise<{ tenantId: string; userId: string }> {
  const sql = retrying(getSqlClient());
  try {
    const rows = await sql.unsafe<{ out_tenant: string; out_user: string }[]>(
      `SELECT * FROM zex_register_tenant($1::text,$2::text,$3::text,$4::text,$5::text)`,
      [args.slug, args.tenantName, args.email, args.userName, args.passwordHash] as any,
    );
    return { tenantId: rows[0]!.out_tenant, userId: rows[0]!.out_user };
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    for (const code of ['invalid_slug', 'reserved_slug', 'invalid_email', 'slug_taken', 'email_taken'] as const) {
      if (msg.includes(code)) throw new RegistrationError(code);
    }
    throw err;
  }
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

/** Profile of a user who is a member of the current tenant session (call inside withTenantDb). */
export async function getUserProfileInTenant(tx: { unsafe: (q: string, p?: any[]) => Promise<any[]> }, userId: string): Promise<UserProfile | undefined> {
  const rows = await tx.unsafe(`SELECT * FROM zex_user_profile($1::uuid)`, [userId]);
  return rows[0];
}

// ── Sessions & one-time tokens (all access goes through SECURITY DEFINER functions) ──────────

export const SESSION_TTL_SECONDS = 24 * 60 * 60;

export async function createSession(userId: string, meta: { userAgent?: string; ip?: string } = {}): Promise<string> {
  const sql = retrying(getSqlClient());
  const rows = await sql.unsafe<{ id: string }[]>(
    `SELECT zex_session_create($1::uuid, $2::int, $3::text, $4::text) AS id`,
    [userId, SESSION_TTL_SECONDS, meta.userAgent ?? null, meta.ip ?? null] as any,
  );
  return rows[0]!.id;
}

export async function isSessionValid(sid: string, userId: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(sid) || !/^[0-9a-f-]{36}$/i.test(userId)) return false;
  const sql = retrying(getSqlClient());
  const rows = await sql.unsafe<{ ok: boolean }[]>(`SELECT zex_session_valid($1::uuid, $2::uuid) AS ok`, [sid, userId] as any);
  return rows[0]?.ok === true;
}

export async function revokeSession(sid: string, userId: string): Promise<boolean> {
  const sql = retrying(getSqlClient());
  const rows = await sql.unsafe<{ ok: boolean }[]>(`SELECT zex_session_revoke($1::uuid, $2::uuid) AS ok`, [sid, userId] as any);
  return rows[0]?.ok === true;
}

export async function revokeOtherSessions(userId: string, keepSid: string | null): Promise<number> {
  const sql = retrying(getSqlClient());
  const rows = await sql.unsafe<{ n: number }[]>(`SELECT zex_session_revoke_all($1::uuid, $2::uuid) AS n`, [userId, keepSid] as any);
  return Number(rows[0]?.n ?? 0);
}

export interface SessionInfo { id: string; created_at: string; last_seen_at: string; user_agent: string | null; ip: string | null }

export async function listSessions(userId: string): Promise<SessionInfo[]> {
  const sql = retrying(getSqlClient());
  return sql.unsafe<SessionInfo[]>(`SELECT * FROM zex_session_list($1::uuid)`, [userId] as any);
}

export type OneTimeKind = 'verify' | 'reset';

export async function issueOneTimeToken(userId: string, kind: OneTimeKind, tokenHash: string, ttlSeconds: number): Promise<void> {
  const sql = retrying(getSqlClient());
  await sql.unsafe(`SELECT zex_token_issue($1::uuid, $2::text, $3::text, $4::int)`, [userId, kind, tokenHash, ttlSeconds] as any);
}

/** Returns the user id if the token was valid and unused (and burns it), otherwise null. */
export async function consumeOneTimeToken(tokenHash: string, kind: OneTimeKind): Promise<string | null> {
  const sql = retrying(getSqlClient());
  const rows = await sql.unsafe<{ id: string | null }[]>(`SELECT zex_token_consume($1::text, $2::text) AS id`, [tokenHash, kind] as any);
  return rows[0]?.id ?? null;
}

/** Like consume, but leaves the token usable (so a weak password does not burn a reset link). */
export async function peekOneTimeToken(tokenHash: string, kind: OneTimeKind): Promise<string | null> {
  const sql = retrying(getSqlClient());
  const rows = await sql.unsafe<{ id: string | null }[]>(`SELECT zex_token_peek($1::text, $2::text) AS id`, [tokenHash, kind] as any);
  return rows[0]?.id ?? null;
}

export async function setUserPassword(userId: string, passwordHash: string): Promise<void> {
  const sql = retrying(getSqlClient());
  await sql.unsafe(`SELECT zex_set_password($1::uuid, $2::text)`, [userId, passwordHash] as any);
}

export async function markEmailVerified(userId: string): Promise<void> {
  const sql = retrying(getSqlClient());
  await sql.unsafe(`SELECT zex_mark_email_verified($1::uuid)`, [userId] as any);
}

export interface UserAccount { id: string; email: string; name: string; email_verified: boolean; password_hash: string }

export async function getUserAccount(userId: string): Promise<UserAccount | undefined> {
  const sql = retrying(getSqlClient());
  const rows = await sql.unsafe<UserAccount[]>(`SELECT * FROM zex_user_account($1::uuid)`, [userId] as any);
  return rows[0];
}
