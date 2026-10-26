/**
 * Authoritative server-side price list. The browser never decides what a plan costs.
 * Prices are USD per month / per year; NGN is derived with NGN_PER_USD (default 1500).
 * Keep in sync with apps/dashboard/src/lib/billing.ts (display only).
 */
export type PlanTier = 'starter' | 'growth' | 'agency' | 'enterprise' | 'dedicated';
export type BillingCycle = 'monthly' | 'annual';
export type Currency = 'USD' | 'NGN';

export const SERVER_PLANS: Record<PlanTier, { monthlyUsd: number; annualUsd: number }> = {
  starter: { monthlyUsd: 19, annualUsd: 190 },
  growth: { monthlyUsd: 49, annualUsd: 490 },
  agency: { monthlyUsd: 149, annualUsd: 1490 },
  enterprise: { monthlyUsd: 499, annualUsd: 4990 },
  dedicated: { monthlyUsd: 1500, annualUsd: 15000 },
};

export function isPlanTier(v: unknown): v is PlanTier {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(SERVER_PLANS, v);
}

export function ngnPerUsd(): number {
  const n = Number(process.env.NGN_PER_USD);
  return Number.isFinite(n) && n > 0 ? n : 1500;
}

/** Expected charge in minor units (cents / kobo). */
export function expectedAmountMinor(tier: PlanTier, cycle: BillingCycle, currency: Currency): number {
  const usd = cycle === 'annual' ? SERVER_PLANS[tier].annualUsd : SERVER_PLANS[tier].monthlyUsd;
  const major = currency === 'NGN' ? usd * ngnPerUsd() : usd;
  return Math.round(major * 100);
}
