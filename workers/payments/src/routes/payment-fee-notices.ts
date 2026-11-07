import type { Ctx } from '../env';
import { fsCommit, fsGet, fsQuery } from '../fs';
import { queueFormal } from '../outbox';
import { ownerContact } from '../automation';
import { HttpError, json, readJson } from '../util';
import { requirePlatformAdmin } from './admin';
import { PAYMENT_FEE_POLICY_VERSION, PLATFORM_FEE_BPS } from '../plan';
import type { Deps, Env } from '../env';

const EFFECTIVE_AT = '2026-11-08T00:00:00.000Z';
const schedule = Object.fromEntries(Object.entries(PLATFORM_FEE_BPS).map(([plan, bps]) => [plan, bps]));

/**
 * Platform-admin controlled, resumable notice campaign. Each workspace gets a durable
 * marker and an idempotent outbox key, so retries never send duplicate owner notices.
 * POST body: { cursor?: workspaceId, limit?: 1..25 }.
 */
export async function sendPaymentFeeNoticeBatch(c: Ctx): Promise<Response> {
  await requirePlatformAdmin(c);
  const b = await readJson(c.req, 1024);
  const limit = Math.max(1, Math.min(25, Math.floor(Number(b.limit) || 25)));
  const cursor = typeof b.cursor === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(b.cursor) ? b.cursor : undefined;
  const rows = await fsQuery(c.env, c.d, { collection: 'workspaces', limit: limit + 1, ...(cursor ? { startAfterId: cursor } : {}) });
  const batch = rows.slice(0, limit);
  let queued = 0, skipped = 0, failed = 0;
  for (const ws of batch) {
    if (ws.data.status === 'closing' || ws.data.status === 'deleted') { skipped++; continue; }
    const markerPath = `workspaces/${ws.id}/paymentFeeNotices/${PAYMENT_FEE_POLICY_VERSION}`;
    const existing = await fsGet(c.env, c.d, markerPath);
    if (existing) { skipped++; continue; }
    try {
      const owner = await ownerContact(c, ws.id);
      if (!owner.email || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(owner.email)) { skipped++; continue; }
      const result = await queueFormal(c.env, c.d, `payment-fee-notice:${ws.id}:${PAYMENT_FEE_POLICY_VERSION}`, owner.email,
        'Important update: ZexCore online payment fees now apply', {
          heading: 'Update to online payment fees',
          greeting: `Hello ${owner.name},`,
          paragraphs: [
            'ZexCore online payment fees are effective immediately, 8 November 2026. The fee applies to successful online booking deposits and shop orders.',
            'The ZexCore fee is deducted from your business settlement, not added to the amount your customer pays. Paystack processing fees are separate and are also borne by your business.',
            'Review the fee schedule and accept the current terms in Settings → Online payment fees. Online checkout requires the workspace owner to accept the policy.',
          ],
          details: [
            ['Free', '2%'], ['Starter', '1.5%'], ['Growth', '1%'],
            ['Agency, Enterprise and Dedicated', '0.5%'],
            ['Effective date', '8 November 2026 (immediate)'],
          ],
          button: { text: 'Review payment fees', url: `${c.env.APP_URL.replace(/\/+$/, '')}/app/settings#payment-fee-policy` },
          note: 'If you do not accept these terms, you may continue arranging payment directly with customers instead of using ZexCore online checkout.',
        }, ws.id);
      await fsCommit(c.env, c.d, [{ path: markerPath, precondition: { exists: false }, fields: {
        version: PAYMENT_FEE_POLICY_VERSION, to: owner.email, queuedAt: c.d.now(), deliveryStatus: result,
      } }]);
      queued++;
    } catch (e) {
      failed++;
      console.error('payment fee notice failed', ws.id, e instanceof Error ? e.message : e);
    }
  }
  const nextCursor = rows.length > limit ? batch.at(-1)?.id ?? null : null;
  return json({ ok: true, processed: batch.length, queued, skipped, failed, nextCursor, complete: nextCursor === null, effectiveAt: EFFECTIVE_AT, version: PAYMENT_FEE_POLICY_VERSION }, 200, c.headers);
}


/** Hourly, resumable delivery to every active workspace with a configured payout account. */
export async function scheduledPaymentFeeNotices(env: Env, d: Deps): Promise<{ processed: number; queued: number; skipped: number; complete: boolean }> {
  const state = await fsGet(env, d, 'system/paymentFeeNoticeCampaign');
  if (state?.data.version === PAYMENT_FEE_POLICY_VERSION && state.data.complete === true) return { processed: 0, queued: 0, skipped: 0, complete: true };
  const cursor = typeof state?.data.cursor === 'string' ? String(state.data.cursor) : undefined;
  const rows = await fsQuery(env, d, { collection: 'workspaces', limit: 26, ...(cursor ? { startAfterId: cursor } : {}) });
  const batch = rows.slice(0, 25);
  let queued = 0, skipped = 0;
  const ctx = { env, d, req: new Request(env.APP_URL), url: new URL(env.APP_URL), headers: {} } as Ctx;
  for (const ws of batch) {
    if (ws.data.status === 'closing' || ws.data.status === 'deleted') { skipped++; continue; }
    const markerPath = `workspaces/${ws.id}/paymentFeeNotices/${PAYMENT_FEE_POLICY_VERSION}`;
    if (await fsGet(env, d, markerPath)) { skipped++; continue; }
    const payout = await fsGet(env, d, `workspaces/${ws.id}/payout/main`);
    if (!payout?.data.subaccountCode) { skipped++; continue; }
    const owner = await ownerContact(ctx, ws.id);
    if (!owner.email || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(owner.email)) { skipped++; continue; }
    const result = await queueFormal(env, d, `payment-fee-notice:${ws.id}:${PAYMENT_FEE_POLICY_VERSION}`, owner.email,
      'Important update: ZexCore online payment fees now apply', {
        heading: 'Update to online payment fees', greeting: `Hello ${owner.name},`,
        paragraphs: [
          'ZexCore online payment fees are effective immediately, 8 November 2026. The fee applies to successful online booking deposits and shop orders.',
          'The ZexCore fee is deducted from your business settlement, not added to the amount your customer pays. Paystack processing fees are separate and are also borne by your business.',
          'Review the fee schedule and accept the current terms in Settings → Online payment fees. Online checkout requires the workspace owner to accept the policy.',
        ],
        details: [['Free', '2%'], ['Starter', '1.5%'], ['Growth', '1%'], ['Agency, Enterprise and Dedicated', '0.5%'], ['Effective date', '8 November 2026 (immediate)']],
        button: { text: 'Review payment fees', url: `${env.APP_URL.replace(/\/+$/, '')}/app/settings#payment-fee-policy` },
        note: 'If you do not accept these terms, you may continue arranging payment directly with customers instead of using ZexCore online checkout.',
      }, ws.id);
    await fsCommit(env, d, [{ path: markerPath, precondition: { exists: false }, fields: { version: PAYMENT_FEE_POLICY_VERSION, to: owner.email, queuedAt: d.now(), deliveryStatus: result } }]);
    queued++;
  }
  const complete = rows.length <= 25;
  await fsCommit(env, d, [{ path: 'system/paymentFeeNoticeCampaign', fields: { version: PAYMENT_FEE_POLICY_VERSION, cursor: batch.at(-1)?.id ?? cursor ?? null, complete, updatedAt: d.now() } }]);
  return { processed: batch.length, queued, skipped, complete };
}
