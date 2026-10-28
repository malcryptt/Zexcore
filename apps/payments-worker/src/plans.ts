/** Authoritative prices (USD). Must match apps/api/src/billing/plans.ts and the dashboard's display prices. */
export type Tier = 'starter' | 'growth' | 'agency' | 'enterprise' | 'dedicated';
export type Cycle = 'monthly' | 'annual';
export type Currency = 'NGN' | 'USD';

export const PRICES: Record<Tier, { monthlyUsd: number; annualUsd: number }> = {
  starter: { monthlyUsd: 19, annualUsd: 190 },
  growth: { monthlyUsd: 49, annualUsd: 490 },
  agency: { monthlyUsd: 149, annualUsd: 1490 },
  enterprise: { monthlyUsd: 499, annualUsd: 4990 },
  dedicated: { monthlyUsd: 1500, annualUsd: 15000 },
};

export const isTier = (v: unknown): v is Tier => typeof v === 'string' && Object.prototype.hasOwnProperty.call(PRICES, v);
export const isCycle = (v: unknown): v is Cycle => v === 'monthly' || v === 'annual';
export const isCurrency = (v: unknown): v is Currency => v === 'NGN' || v === 'USD';

/** Expected charge in minor units (kobo / cents). */
export function expectedAmountMinor(tier: Tier, cycle: Cycle, currency: Currency, ngnPerUsd: number): number {
  const usd = cycle === 'annual' ? PRICES[tier].annualUsd : PRICES[tier].monthlyUsd;
  return Math.round((currency === 'NGN' ? usd * ngnPerUsd : usd) * 100);
}

export const PERIOD_DAYS: Record<Cycle, number> = { monthly: 30, annual: 365 };

/** Extends an active plan instead of overwriting it, so paying early never loses days. */
export function nextExpiry(now: Date, currentExpiry: Date | null, cycle: Cycle): Date {
  const base = currentExpiry && currentExpiry > now ? currentExpiry : now;
  return new Date(base.getTime() + PERIOD_DAYS[cycle] * 86_400_000);
}
