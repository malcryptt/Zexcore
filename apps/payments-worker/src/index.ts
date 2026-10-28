import { Firestore, accessToken, str, ts, ConflictError, type ServiceAccount } from './firestore';
import { expectedAmountMinor, isCurrency, isCycle, isTier, nextExpiry } from './plans';

export interface Env {
  PAYSTACK_SECRET_KEY: string;
  FIREBASE_SERVICE_ACCOUNT: string;
  FIREBASE_PROJECT_ID: string;
  NGN_PER_USD?: string;
}

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Paystack signs the raw body with HMAC-SHA512 using the secret key. Constant-time compare. */
export async function validSignature(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !secret) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  const expected = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody)));
  if (expected.length !== signature.length) return false;
  let diff = 0; for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

/** Order references are `zx_<workspaceId>_<random>`; workspace ids are 20-char Firebase ids. */
export function parseReference(ref: unknown): { wid: string } | null {
  if (typeof ref !== 'string') return null;
  const m = /^zx_([A-Za-z0-9]{20})_[a-z0-9]{8,24}$/.exec(ref);
  return m ? { wid: m[1]! } : null;
}

export type Outcome = { status: 'activated' | 'duplicate' | 'ignored' | 'rejected'; reason?: string };

export interface Deps { fs: Firestore; verify: (reference: string) => Promise<{ status: string; amount: number; currency: string } | null>; now: () => Date; ngnPerUsd: number }

/**
 * Activates the plan for a verified payment. The order document (created by the dashboard, pending) names the tier,
 * but the AMOUNT is checked against our own price list and against Paystack's own record of the transaction,
 * never against anything the browser sent. Idempotent: a paid order is never applied twice.
 */
export async function activate(reference: string, d: Deps): Promise<Outcome> {
  const parsed = parseReference(reference);
  if (!parsed) return { status: 'ignored', reason: 'not a ZexCore reference' };
  const orderPath = `workspaces/${parsed.wid}/orders/${reference}`;
  const order = await d.fs.get(orderPath);
  if (!order) return { status: 'rejected', reason: 'unknown order' };
  if (str(order, 'status') === 'paid') return { status: 'duplicate' };
  if (str(order, 'status') !== 'pending') return { status: 'rejected', reason: 'order not pending' };

  const tier = str(order, 'tier'), cycle = str(order, 'cycle'), currency = str(order, 'currency');
  if (!isTier(tier) || !isCycle(cycle) || !isCurrency(currency)) return { status: 'rejected', reason: 'bad order' };

  const tx = await d.verify(reference);
  if (!tx || tx.status !== 'success') return { status: 'rejected', reason: 'payment not successful' };
  if (tx.currency !== currency) return { status: 'rejected', reason: 'currency mismatch' };
  const expected = expectedAmountMinor(tier, cycle, currency, d.ngnPerUsd);
  if (tx.amount !== expected) return { status: 'rejected', reason: `amount mismatch (paid ${tx.amount}, expected ${expected})` };

  const ws = await d.fs.get(`workspaces/${parsed.wid}`);
  if (!ws) return { status: 'rejected', reason: 'workspace missing' };
  const now = d.now();
  const expiry = nextExpiry(now, ts(ws, 'planExpiresAt'), cycle);
  try {
    await d.fs.commit([
      { update: { name: d.fs.docName(orderPath), fields: { status: { stringValue: 'paid' }, paidAt: { timestampValue: now.toISOString() }, amountMinor: { integerValue: String(tx.amount) } } },
        updateMask: { fieldPaths: ['status', 'paidAt', 'amountMinor'] }, currentDocument: { updateTime: order.updateTime } },
      { update: { name: d.fs.docName(`workspaces/${parsed.wid}`), fields: { plan: { stringValue: tier }, planExpiresAt: { timestampValue: expiry.toISOString() } } },
        updateMask: { fieldPaths: ['plan', 'planExpiresAt'] }, currentDocument: { updateTime: ws.updateTime } },
    ]);
  } catch (e) {
    if (e instanceof ConflictError) return { status: 'duplicate', reason: 'concurrent delivery' };
    throw e;
  }
  return { status: 'activated' };
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/health') return Response.json({ ok: true });
    if (req.method !== 'POST' || url.pathname !== '/paystack/webhook') return new Response('Not found', { status: 404 });

    const raw = await req.text();
    if (!(await validSignature(raw, req.headers.get('x-paystack-signature'), env.PAYSTACK_SECRET_KEY))) {
      return new Response('Invalid signature', { status: 401 });
    }
    let evt: { event?: string; data?: { reference?: string } };
    try { evt = JSON.parse(raw); } catch { return new Response('Bad request', { status: 400 }); }
    if (evt.event !== 'charge.success' || !evt.data?.reference) return Response.json({ ok: true, ignored: true });

    const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount;
    const fs = new Firestore(env.FIREBASE_PROJECT_ID, () => accessToken(sa));
    const outcome = await activate(evt.data.reference, {
      fs, now: () => new Date(), ngnPerUsd: Number(env.NGN_PER_USD) > 0 ? Number(env.NGN_PER_USD) : 1500,
      // Never trust the webhook body for the amount: ask Paystack directly.
      verify: async (reference) => {
        const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` } });
        if (!r.ok) return null;
        const j = (await r.json()) as { status?: boolean; data?: { status: string; amount: number; currency: string } };
        return j.status && j.data ? j.data : null;
      },
    });
    console.log(JSON.stringify({ reference: evt.data.reference, ...outcome }));
    // 200 for every handled outcome so Paystack stops retrying; real errors throw (500) and are retried.
    return Response.json({ ok: true, outcome: outcome.status });
  },
};
