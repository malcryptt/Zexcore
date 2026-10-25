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
