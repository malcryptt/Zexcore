/**
 * ZexCore Worker (Cloudflare Workers, free plan, no server to run).
 *
 * Firestore security rules forbid browsers from touching plan fields, ledgers and secrets, so something trusted has to.
 * This Worker is that something. It holds the Paystack secret and a service account and never believes amounts,
 * tiers, plans or identities sent by a browser or found in webhook metadata.
 */
import { realDeps, type Ctx, type Deps, type Env } from './env';
import { HttpError, cors, json } from './util';
import { checkout, webhook } from './routes/billing';
import { audit, verifyAudit } from './routes/audit';
import { ingest } from './routes/iot';
import { banks, depositLink, depositStatus, payoutSetup, publicDeposit } from './routes/deposits';
import { aiDraft, memberEvent, publicBooked } from './routes/events';

export type { Env, Deps } from './env';
export { amountMinor, isTier, PLANS } from './routes/billing';
export { paystackSignature } from './util';
export { toFs, fromFs } from './fs';
export { resetTokenCache } from './google';
export { resetJwksCache } from './auth';

import { getLiveNgnRate } from './rates';

type Handler = (c: Ctx) => Promise<Response>;
const ROUTES: Record<string, Handler> = {
  'GET /api/health': async (c) => json({ status: 'ok' }, 200, c.headers),
  'GET /api/rates': async (c) => {
    const rate = await getLiveNgnRate(c.env, c.d);
    return json({ base: 'USD', target: 'NGN', rate, updatedAt: c.d.now().toISOString() }, 200, c.headers);
  },
  'POST /api/checkout': (c) => checkout(c.req, c.env, c.d, c.headers),
  'POST /api/paystack-webhook': (c) => webhook(c.req, c.env, c.d),
  'POST /api/audit': audit,
  'GET /api/audit/verify': verifyAudit,
  'POST /api/iot/ingest': ingest,
  'GET /api/banks': banks,
  'POST /api/payout/setup': payoutSetup,
  'POST /api/public/deposit': publicDeposit,
  'POST /api/deposit/link': depositLink,
  'GET /api/public/deposit-status': depositStatus,
  'POST /api/events': memberEvent,
  'POST /api/public/booked': publicBooked,
  'POST /api/rules/ai-draft': aiDraft,
};

export async function handle(req: Request, env: Env, d: Deps = realDeps()): Promise<Response> {
  const url = new URL(req.url);
  const headers = cors(env, req);
  try {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    const h = ROUTES[`${req.method} ${url.pathname}`];
    if (!h) return json({ error: 'Not found' }, 404, headers);
    return await h({ req, env, d, url, headers });
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message, ...(e.code ? { code: e.code } : {}) }, e.status, headers);
    console.error('worker error', e instanceof Error ? e.message : e);
    return json({ error: 'Something went wrong. Please try again.' }, 500, headers);
  }
}

export default { fetch: (req: Request, env: Env) => handle(req, env) };
