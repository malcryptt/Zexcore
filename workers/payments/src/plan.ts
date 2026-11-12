/** A workspace's effective plan today, with the same 3-day grace as the rest of the platform (after it, the workspace is Free again). */
const GRACE_MS = 3 * 86_400_000;
const ORDER = ['free', 'starter', 'growth', 'agency', 'enterprise', 'dedicated'];

export function effectivePlan(ws: Record<string, any> | undefined, now: Date): { plan: string; expires: Date | null } {
  const plan = ORDER.includes(String(ws?.plan)) ? String(ws?.plan) : 'free';
  const expires = ws?.planExpiresAt instanceof Date ? (ws.planExpiresAt as Date) : null;
  const live = plan !== 'free' && (!expires || now.getTime() < expires.getTime() + GRACE_MS);
  return { plan: live ? plan : 'free', expires };
}
/** True when the plan is `min` or above. */
export const atLeast = (plan: string, min: string): boolean => ORDER.indexOf(plan) >= ORDER.indexOf(min);

/**
 * ZexCore's share of successful customer payments, in basis points.
 * Free 2%, Starter 1.5%, Growth 1%, Agency and above 0.5%.
 * Paystack processing fees remain separate and are borne by the business.
 */
export const PLATFORM_FEE_BPS: Record<string, number> = {
  free: 200,
  starter: 150,
  growth: 100,
  agency: 50,
  enterprise: 50,
  dedicated: 50,
};

/** Calculate the platform commission in the currency's minor unit (kobo for NGN). */
export function platformFeeFor(amountMinor: number, plan: string): { feeMinor: number; feeBps: number } {
  const amount = Number.isFinite(amountMinor) ? Math.max(0, Math.floor(amountMinor)) : 0;
  const feeBps = PLATFORM_FEE_BPS[plan] ?? PLATFORM_FEE_BPS.free!;
  return { feeMinor: Math.min(Math.round(amount * feeBps / 10_000), Math.floor(amount / 2)), feeBps };
}

/** Fee terms shown to workspace owners. Bump this version whenever rates or charging rules change. */
export const PAYMENT_FEE_POLICY_VERSION = '2026-11-v1';
export function hasAcceptedPaymentFeePolicy(ws: Record<string, any> | undefined): boolean {
  return ws?.paymentFeeConsent?.version === PAYMENT_FEE_POLICY_VERSION && ws.paymentFeeConsent.acceptedAt instanceof Date;
}

/** Video calls a workspace may start each month (one call = one room of up to 30 minutes). */
export const CALLS_PER_MONTH: Record<string, number> = { free: 10, starter: 30, growth: 100, agency: 300, enterprise: 1000, dedicated: 1000 };
