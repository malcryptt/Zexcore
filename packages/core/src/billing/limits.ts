import type { FastifyReply, FastifyRequest } from 'fastify';
import { sql } from 'drizzle-orm';
import { withTenantDb } from '../db/client.js';

/**
 * What each plan includes. Enforced on the server where records are created; the browser only displays it.
 * `null` means unlimited. Tenants on an unknown tier fall back to the free limits (fail safe).
 */
export type LimitKey = 'bookingsPerMonth' | 'staff' | 'services' | 'devices' | 'rules' | 'cmsPages' | 'crmContacts';
export type Limits = Record<LimitKey, number | null>;

export const PLAN_LIMITS: Record<string, Limits> = {
  free:       { bookingsPerMonth: 30,   staff: 1,   services: 3,   devices: 1,   rules: 1,   cmsPages: 3,   crmContacts: 50 },
  starter:    { bookingsPerMonth: 200,  staff: 3,   services: 10,  devices: 5,   rules: 5,   cmsPages: 10,  crmContacts: 500 },
  growth:     { bookingsPerMonth: 1000, staff: 10,  services: 30,  devices: 25,  rules: 20,  cmsPages: 50,  crmContacts: 5000 },
  agency:     { bookingsPerMonth: 5000, staff: 50,  services: 100, devices: 100, rules: 100, cmsPages: 200, crmContacts: 50000 },
  enterprise: { bookingsPerMonth: null, staff: null, services: null, devices: null, rules: null, cmsPages: null, crmContacts: null },
  dedicated:  { bookingsPerMonth: null, staff: null, services: null, devices: null, rules: null, cmsPages: null, crmContacts: null },
};

export const LIMIT_LABELS: Record<LimitKey, { one: string; many: string }> = {
  bookingsPerMonth: { one: 'booking a month', many: 'bookings a month' },
  staff: { one: 'team member', many: 'team members' },
  services: { one: 'service', many: 'services' },
  devices: { one: 'device', many: 'devices' },
  rules: { one: 'automation', many: 'automations' },
  cmsPages: { one: 'website page', many: 'website pages' },
  crmContacts: { one: 'contact', many: 'contacts' },
};

/** Counting queries. Table names are fixed here, never taken from input. */
const COUNTS: Record<LimitKey, ReturnType<typeof sql>> = {
  bookingsPerMonth: sql`SELECT count(*)::int AS n FROM bk_bookings WHERE created_at >= date_trunc('month', now())`,
  staff: sql`SELECT count(*)::int AS n FROM bk_staff WHERE active`,
  services: sql`SELECT count(*)::int AS n FROM bk_services WHERE active`,
  devices: sql`SELECT count(*)::int AS n FROM iot_devices`,
  rules: sql`SELECT count(*)::int AS n FROM rules`,
  cmsPages: sql`SELECT count(*)::int AS n FROM cms_pages`,
  crmContacts: sql`SELECT count(*)::int AS n FROM crm_contacts`,
};
export const LIMIT_KEYS = Object.keys(COUNTS) as LimitKey[];

type Tx = { execute(q: any): Promise<any> };
const rowsOf = async <T>(tx: Tx, q: any): Promise<T[]> => (await tx.execute(q)) as unknown as T[];

const GRACE_DAYS = 3;

/** A paid plan that lapsed more than the grace period ago behaves like the free plan. */
export function effectiveTier(tier: string, planExpiresAt: Date | string | null, now = new Date()): string {
  if (tier === 'free' || !PLAN_LIMITS[tier]) return PLAN_LIMITS[tier] ? tier : 'free';
  if (!planExpiresAt) return tier;
  const exp = new Date(planExpiresAt).getTime();
  return exp + GRACE_DAYS * 86_400_000 < now.getTime() ? 'free' : tier;
}

export class PlanLimitError extends Error {
  status = 402;
  code = 'plan_limit';
  key: LimitKey;
  limit: number;
  used: number;
  tier: string;
  constructor(key: LimitKey, limit: number, used: number, tier: string) {
    const label = limit === 1 ? LIMIT_LABELS[key].one : LIMIT_LABELS[key].many;
    super(`Your ${tier[0]!.toUpperCase()}${tier.slice(1)} plan includes ${limit} ${label}. Upgrade in Plan & billing to add more.`);
    this.key = key; this.limit = limit; this.used = used; this.tier = tier;
  }
}

export async function tenantPlan(tx: Tx, tenantId: string): Promise<{ tier: string; effective: string; expiresAt: string | null }> {
  const [t] = await rowsOf<{ tier: string; plan_expires_at: string | null }>(tx, sql`SELECT tier, plan_expires_at FROM tenants WHERE id = ${tenantId}::uuid`);
  const tier = t?.tier ?? 'free';
  return { tier, effective: effectiveTier(tier, t?.plan_expires_at ?? null), expiresAt: t?.plan_expires_at ?? null };
}

export async function usageOf(tx: Tx, key: LimitKey): Promise<number> {
  const [r] = await rowsOf<{ n: number }>(tx, COUNTS[key]);
  return Number(r?.n ?? 0);
}

/** Throws PlanLimitError if creating one more `key` would exceed the tenant's plan. Call inside a tenant transaction. */
export async function assertRoom(tx: Tx, tenantId: string, key: LimitKey): Promise<void> {
  const plan = await tenantPlan(tx, tenantId);
  const limit = (PLAN_LIMITS[plan.effective] ?? PLAN_LIMITS.free!)[key];
  if (limit === null) return;
  const used = await usageOf(tx, key);
  if (used >= limit) throw new PlanLimitError(key, limit, used, plan.effective);
}

export async function usageSnapshot(tx: Tx, tenantId: string) {
  const plan = await tenantPlan(tx, tenantId);
  const limits = PLAN_LIMITS[plan.effective] ?? PLAN_LIMITS.free!;
  const usage = {} as Record<LimitKey, { used: number; limit: number | null }>;
  for (const k of LIMIT_KEYS) usage[k] = { used: await usageOf(tx, k), limit: limits[k] };
  return { tier: plan.tier, effectiveTier: plan.effective, planExpiresAt: plan.expiresAt, usage };
}

/** Fastify preHandler: refuse creation (HTTP 402) when the tenant's plan has no room. Put it after authenticate. */
export function planLimitGuard(key: LimitKey) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const tenantId = (request as any).tenant?.id as string | undefined;
    if (!tenantId) return; // tenant context errors are reported by the route itself
    try {
      await withTenantDb(tenantId, (tx) => assertRoom(tx as unknown as Tx, tenantId, key));
    } catch (err) {
      if (err instanceof PlanLimitError) {
        return void reply.status(402).send({ error: err.message, code: err.code, key: err.key, limit: err.limit, used: err.used, tier: err.tier });
      }
      throw err;
    }
  };
}
