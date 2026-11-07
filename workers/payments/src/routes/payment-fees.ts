import { requireMember } from '../auth';
import type { Ctx } from '../env';
import { fsCommit, fsGet, fsQuery } from '../fs';
import { HttpError, json, readJson } from '../util';
import { PAYMENT_FEE_POLICY_VERSION, hasAcceptedPaymentFeePolicy } from '../plan';

/** Owner-only acknowledgement of the published ZexCore payment fee terms. */
export async function paymentFeePolicy(c: Ctx): Promise<Response> {
  const wid = c.url.searchParams.get('workspaceId');
  await requireMember(c, wid, ['owner', 'admin']);
  const ws = await fsGet(c.env, c.d, `workspaces/${wid}`);
  const consent = ws?.data.paymentFeeConsent ?? null;
  const history = await fsQuery(c.env, c.d, { parent: `workspaces/${wid}`, collection: 'paymentFeePolicies', orderBy: [{ field: 'effectiveAt', desc: true }], limit: 20 });
  return json({ version: PAYMENT_FEE_POLICY_VERSION, accepted: hasAcceptedPaymentFeePolicy(ws?.data), consent, history: history.map((x) => ({ version: x.data.version, effectiveAt: x.data.effectiveAt, acceptedAt: x.data.acceptedAt ?? null, acceptedBy: x.data.acceptedEmail ?? null, feeSchedule: x.data.feeSchedule })) }, 200, { ...c.headers, 'cache-control': 'no-store' });
}

export async function acceptPaymentFeePolicy(c: Ctx): Promise<Response> {
  const b = await readJson(c.req, 1024);
  const { wid, caller } = await requireMember(c, b.workspaceId, ['owner']);
  if (b.version !== PAYMENT_FEE_POLICY_VERSION) throw new HttpError(409, 'These payment terms have changed. Reload Settings and review the current version.', 'policy_version');
  if (!caller.emailVerified) throw new HttpError(403, 'Verify your account email before accepting payment terms.', 'unverified');
  const ws = await fsGet(c.env, c.d, `workspaces/${wid}`);
  if (!ws) throw new HttpError(404, 'Workspace not found.');
  const acceptedAt = c.d.now();
  const consent = { version: PAYMENT_FEE_POLICY_VERSION, acceptedAt, acceptedBy: caller.uid, acceptedEmail: caller.email, feeSchedule: { free: 200, starter: 150, growth: 100, agency: 50, enterprise: 50, dedicated: 50 }, chargingRule: 'ZexCore fee is deducted from the business settlement; customer checkout amount is unchanged. Paystack processing fees are separate and borne by the business.' };
  await fsCommit(c.env, c.d, [
    { path: `workspaces/${wid}`, fields: { paymentFeeConsent: consent }, mask: ['paymentFeeConsent'], precondition: { updateTime: ws.updateTime } },
    { path: `workspaces/${wid}/paymentFeePolicies/${PAYMENT_FEE_POLICY_VERSION}`, fields: { version: PAYMENT_FEE_POLICY_VERSION, effectiveAt: new Date('2026-11-08T00:00:00.000Z'), feeSchedule: consent.feeSchedule, chargingRule: consent.chargingRule, acceptedAt, acceptedBy: caller.uid, acceptedEmail: caller.email }, precondition: { exists: false } },
  ]);
  return json({ ok: true, accepted: true, consent }, 200, c.headers);
}
