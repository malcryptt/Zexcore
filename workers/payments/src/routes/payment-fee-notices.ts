import type { Ctx } from '../env';
import { fsCommit, fsQuery } from '../fs';
import { queueFormal } from '../outbox';
import { ownerContact } from '../automation';
import { HttpError, json, readJson } from '../util';
import { requirePlatformAdmin } from './admin';
import { PAYMENT_FEE_POLICY_VERSION, PLATFORM_FEE_BPS } from '../plan';

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
    const existing = await (await import('../fs')).fsGet(c.env, c.d, markerPath);
    if (existing) { skipped++; continue; }
    try {
      const owner = await ownerContact(c, ws.id);
      if (!owner.email || !/^[^\\s@<>]+@[^\\s@<>]+\\.[^\\s@<>]+$/.test(owner.email)) { skipped++; continue; }
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
          button: { text: 'Review payment fees', url: `${c.env.APP_URL.replace(/\\/$/, '')}/app/settings#payment-fee-policy` },
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
