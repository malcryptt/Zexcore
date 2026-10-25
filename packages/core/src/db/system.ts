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
  const sql = getSqlClient();
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
  const sql = getSqlClient();
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
  const sql = getSqlClient();
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
  const sql = getSqlClient();
  const rows = await sql.unsafe<{ out_outcome: DepositSettlementResult['outcome']; out_tenant: string | null }[]>(
    `SELECT * FROM zex_settle_deposit($1::text, $2::text, $3::bigint, $4::text)`,
    [args.reference, args.gateway, String(Math.round(args.paidMinor)), args.currency] as any,
  );
  const r = rows[0]!;
  return { outcome: r.out_outcome, tenantId: r.out_tenant };
}

export interface UserWorkspace { id: string; slug: string; name: string; role: string }

export async function listUserWorkspaces(userId: string): Promise<UserWorkspace[]> {
  const sql = getSqlClient();
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
  const sql = getSqlClient();
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
