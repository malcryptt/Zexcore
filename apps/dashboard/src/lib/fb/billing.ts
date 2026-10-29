import { getDocs, query, orderBy, limit as qLimit, where, documentId, type QueryDocumentSnapshot } from 'firebase/firestore';
import { fb, paymentsUrl } from './firebase';
import { ApiError, iso, loadCtx, monthPrefix, requireAdmin, wsCol } from './core';
import { LABELS, LIMITS, NGN_PER_USD, PRICES, toLimits, type EnforcedKey } from './plan';

export function plans(): unknown {
  return {
    currencyRates: { NGN_PER_USD }, paystackPublicKey: paymentsUrl() ? 'hosted-checkout' : null,
    plans: (Object.keys(PRICES) as (keyof typeof PRICES)[]).map((tier) => ({ tier, monthlyUsd: PRICES[tier].monthlyUsd, annualUsd: PRICES[tier].annualUsd, limits: toLimits(tier) })),
    freeLimits: toLimits('free'), limitLabels: LABELS,
  };
}

export async function usage(): Promise<unknown> {
  const c = await loadCtx(true);
  const count = async (name: string): Promise<number> => (await getDocs(wsCol(c, name))).size;
  const ym = monthPrefix();
  const [services, staff, contacts, pages, bookings] = await Promise.all([
    count('services'), count('staff'), count('contacts'), count('pages'),
    getDocs(query(wsCol(c, 'bookings'), where(documentId(), '>=', `${ym}_`), where(documentId(), '<', `${ym}\``))).then((s) => s.size),
  ]);
  const used: Record<EnforcedKey, number> = { bookingsPerMonth: bookings, staff, services, cmsPages: pages, crmContacts: contacts };
  const lim = LIMITS[c.tier];
  const out = Object.fromEntries((Object.keys(used) as EnforcedKey[]).map((k) => [k, { used: used[k], limit: lim[k] }]));
  return { tier: c.plan, effectiveTier: c.tier, usage: out, labels: LABELS };
}

export async function checkout(b: Record<string, unknown>): Promise<unknown> {
  const c = await loadCtx(true); requireAdmin(c);
  if (!c.emailVerified) throw new ApiError(403, 'Confirm your email address before upgrading. Check your inbox for the link.', 'email_unverified');
  const base = paymentsUrl();
  if (!base) throw new ApiError(503, 'Online payments are not switched on yet.', 'unavailable');
  const token = await fb().auth.currentUser?.getIdToken();
  let res: Response;
  try {
    res = await fetch(`${base}/api/checkout`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ workspaceId: c.wid, tier: b.tier, cycle: b.cycle ?? 'monthly', currency: b.currency ?? 'NGN' }) });
  } catch { throw new ApiError(0, 'Cannot reach the payment service. Check your connection and try again.', 'network'); }
  const j = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
  if (!res.ok) throw new ApiError(res.status, j.error ?? 'Could not start checkout.', j.code);
  return j;
}

const pay = (d: QueryDocumentSnapshot) => {
  const x = d.data();
  return {
    reference: d.id, tier: x.tier, cycle: x.cycle, currency: x.currency, amount_minor: x.amountMinor ?? 0, paid_minor: x.paidMinor ?? null, status: x.status ?? 'pending',
    gateway: 'paystack', created_at: iso(x.createdAt) ?? new Date().toISOString(), paid_at: iso(x.paidAt),
  };
};
export async function payments(): Promise<{ payments: unknown[] }> {
  const c = await loadCtx(); requireAdmin(c);
  const s = await getDocs(query(wsCol(c, 'payments'), orderBy('createdAt', 'desc'), qLimit(50)));
  return { payments: s.docs.map(pay) };
}

export async function auditLog(): Promise<{ entries: unknown[] }> {
  const c = await loadCtx(); requireAdmin(c);
  const s = await getDocs(query(wsCol(c, 'audit'), orderBy('at', 'desc'), qLimit(100)));
  return { entries: s.docs.map((d, i) => ({ seq: s.size - i, action: d.data().action, entity: d.data().entity, entity_id: d.data().entityId ?? null, principal_type: 'user', created_at: iso(d.data().at) ?? new Date().toISOString(), hash: '' })) };
}
