import { requireMember } from '../auth';
import type { Ctx } from '../env';
import { fsCommit, fsGet } from '../fs';
import { HttpError, json, readJson } from '../util';
import { PAYMENT_FEE_POLICY_VERSION } from '../plan';

/** Owner-only acknowledgement of the published ZexCore payment fee terms. */
export async function paymentFeePolicy(c: Ctx): Promise<Response> {
  const wid = c.url.searchParams.get('workspaceId');
  await requireMember(c, wid, ['owner', 'admin']);
  const ws = await fsGet(c.env, c.d, `workspaces/${wid}`);
  const consent = ws?.data.paymentFeeConsent ?? null;
  return json({ version: PAYMENT_FEE_POLICY_VERSION, accepted: consent?.version === PAYMENT_FEE_POLICY_VERSION, consent }, 200, { ...c.headers, 'cache-control': 'no-store' });
}

export async function acceptPaymentFeePolicy(c: Ctx): Promise<Response> {
  const b = await readJson(c.req, 1024);
  const { wid, caller } = await requireMember(c, b.workspaceId, ['owner']);
  if (b.version !== PAYMENT_FEE_POLICY_VERSION) throw new HttpError(409, 'These payment terms have changed. Reload Settings and review the current version.', 'policy_version');
  if (!caller.emailVerified) throw new HttpError(403, 'Verify your account email before accepting payment terms.', 'unverified');
  const ws = await fsGet(c.env, c.d, `workspaces/${wid}`);
  if (!ws) throw new HttpError(404, 'Workspace not found.');
  const consent = { version: PAYMENT_FEE_POLICY_VERSION, acceptedAt: c.d.now(), acceptedBy: caller.uid, acceptedEmail: caller.email, feeSchedule: { free: 200, starter: 150, growth: 100, agency: 50, enterprise: 50, dedicated: 50 }, chargingRule: 'ZexCore fee is deducted from the business settlement; customer checkout amount is unchanged. Paystack processing fees are separate and borne by the business.' };
  await fsCommit(c.env, c.d, [{ path: `workspaces/${wid}`, fields: { paymentFeeConsent: consent }, mask: ['paymentFeeConsent'], precondition: { updateTime: ws.updateTime } }]);
  return json({ ok: true, accepted: true, consent }, 200, c.headers);
}
