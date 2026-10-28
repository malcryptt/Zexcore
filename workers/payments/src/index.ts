/**
 * ZexCore payments Worker (Cloudflare Workers, free plan, no server needed).
 *
 *   POST /api/checkout          signed-in workspace owner/admin -> Paystack checkout URL (server-priced)
 *   POST /api/paystack-webhook  Paystack -> verifies signature + amount, then upgrades the workspace plan
 *   GET  /api/health
 *
 * Why this exists: Firestore security rules forbid browsers from touching plan fields, so something trusted has to.
 * This Worker is that something. It holds the Paystack secret and a service account, decides prices itself, and never
 * believes amounts, tiers or plans sent by a browser or found in webhook metadata.
 */

export interface Env {
  PAYSTACK_SECRET_KEY: string;
  FIREBASE_SERVICE_ACCOUNT: string;
  FIREBASE_PROJECT_ID: string;
  APP_URL: string;
  ALLOWED_ORIGINS: string;
  NGN_PER_USD?: string;
}
export interface Deps { fetch: typeof fetch; now: () => Date }

// ───────────── pricing (mirrors apps/api/src/billing/plans.ts) ─────────────
export type Tier = 'starter' | 'growth' | 'agency' | 'enterprise' | 'dedicated';
export type Cycle = 'monthly' | 'annual';
export type Currency = 'NGN' | 'USD';
export const PLANS: Record<Tier, { monthlyUsd: number; annualUsd: number }> = {
  starter: { monthlyUsd: 19, annualUsd: 190 },
  growth: { monthlyUsd: 49, annualUsd: 490 },
  agency: { monthlyUsd: 149, annualUsd: 1490 },
  enterprise: { monthlyUsd: 499, annualUsd: 4990 },
  dedicated: { monthlyUsd: 1500, annualUsd: 15000 },
};
export const isTier = (v: unknown): v is Tier => typeof v === 'string' && Object.prototype.hasOwnProperty.call(PLANS, v);
export function amountMinor(tier: Tier, cycle: Cycle, currency: Currency, ngnPerUsd = 1500): number {
  const usd = cycle === 'annual' ? PLANS[tier].annualUsd : PLANS[tier].monthlyUsd;
  return Math.round((currency === 'NGN' ? usd * ngnPerUsd : usd) * 100);
}
const rate = (env: Env) => { const n = Number(env.NGN_PER_USD); return Number.isFinite(n) && n > 0 ? n : 1500; };

// ───────────── small crypto helpers (WebCrypto only) ─────────────
const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = ''; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
export async function paystackSignature(rawBody: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(rawBody)));
}

async function importPkcs8(pem: string): Promise<CryptoKey> {
  const der = Uint8Array.from(atob(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
}
async function signJwt(claims: Record<string, unknown>, key: CryptoKey, kid?: string): Promise<string> {
  const head = b64url(enc.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT', ...(kid ? { kid } : {}) })));
  const body = b64url(enc.encode(JSON.stringify(claims)));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}

// ───────────── Google access token for the service account ─────────────
let tokenCache: { token: string; exp: number } | null = null;
export function resetTokenCache() { tokenCache = null; }
async function accessToken(env: Env, d: Deps): Promise<string> {
  const nowS = Math.floor(d.now().getTime() / 1000);
  if (tokenCache && tokenCache.exp - 60 > nowS) return tokenCache.token;
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) as { client_email: string; private_key: string; token_uri?: string };
  const assertion = await signJwt(
    { iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: sa.token_uri ?? 'https://oauth2.googleapis.com/token', iat: nowS, exp: nowS + 3600 },
    await importPkcs8(sa.private_key),
  );
  const r = await d.fetch(sa.token_uri ?? 'https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  if (!r.ok) throw new Error(`google token ${r.status}`);
  const j = (await r.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: j.access_token, exp: nowS + j.expires_in };
  return j.access_token;
}

// ───────────── Firestore REST ─────────────
type FsValue = Record<string, unknown>;
export function toFs(v: unknown): FsValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFs) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v as object).map(([k, x]) => [k, toFs(x)])) } };
}
export function fromFs(v: any): unknown {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return new Date(v.timestampValue);
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(fromFs);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields ?? {}).map(([k, x]) => [k, fromFs(x)]));
  return null;
}
const fsBase = (env: Env) => `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const fsName = (env: Env, path: string) => `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`;
interface FsDoc { data: Record<string, any>; updateTime: string }

async function fsGet(env: Env, d: Deps, path: string): Promise<FsDoc | null> {
  const r = await d.fetch(`${fsBase(env)}/${path}`, { headers: { authorization: `Bearer ${await accessToken(env, d)}` } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`firestore get ${r.status}`);
  const j = (await r.json()) as { fields?: Record<string, unknown>; updateTime: string };
  return { data: Object.fromEntries(Object.entries(j.fields ?? {}).map(([k, v]) => [k, fromFs(v)])), updateTime: j.updateTime };
}
interface FsWrite { path: string; fields: Record<string, unknown>; mask?: string[]; precondition?: { exists: boolean } | { updateTime: string } }
async function fsCommit(env: Env, d: Deps, writes: FsWrite[]): Promise<void> {
  const r = await d.fetch(`${fsBase(env)}:commit`, {
    method: 'POST', headers: { authorization: `Bearer ${await accessToken(env, d)}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      writes: writes.map((w) => ({
        update: { name: fsName(env, w.path), fields: Object.fromEntries(Object.entries(w.fields).map(([k, v]) => [k, toFs(v)])) },
        ...(w.mask ? { updateMask: { fieldPaths: w.mask } } : {}),
        ...(w.precondition ? { currentDocument: w.precondition } : {}),
      })),
    }),
  });
  if (!r.ok) throw new Error(`firestore commit ${r.status}`);
}

// ───────────── Firebase ID token verification ─────────────
let jwksCache: { keys: any[]; exp: number } | null = null;
export function resetJwksCache() { jwksCache = null; }
export interface Caller { uid: string; email: string | null; emailVerified: boolean }
export async function verifyFirebaseIdToken(env: Env, d: Deps, token: string): Promise<Caller | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  let head: any, claims: any;
  try { head = JSON.parse(new TextDecoder().decode(fromB64url(parts[0]!))); claims = JSON.parse(new TextDecoder().decode(fromB64url(parts[1]!))); } catch { return null; }
  if (head.alg !== 'RS256' || !head.kid) return null;
  const nowS = Math.floor(d.now().getTime() / 1000);
  if (!jwksCache || jwksCache.exp < nowS) {
    const r = await d.fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
    if (!r.ok) return null;
    jwksCache = { keys: ((await r.json()) as { keys: any[] }).keys, exp: nowS + 3600 };
  }
  const jwk = jwksCache.keys.find((k) => k.kid === head.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, fromB64url(parts[2]!), enc.encode(`${parts[0]}.${parts[1]}`));
  if (!ok) return null;
  if (claims.aud !== env.FIREBASE_PROJECT_ID || claims.iss !== `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`) return null;
  if (typeof claims.exp !== 'number' || claims.exp < nowS || typeof claims.sub !== 'string' || !claims.sub) return null;
  return { uid: claims.sub, email: claims.email ?? null, emailVerified: claims.email_verified === true };
}

// ───────────── HTTP plumbing ─────────────
const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...extra } });
function cors(env: Env, req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
  return allowed.includes(origin)
    ? { 'access-control-allow-origin': origin, 'access-control-allow-headers': 'authorization, content-type', 'access-control-allow-methods': 'POST, OPTIONS', vary: 'origin' }
    : { vary: 'origin' };
}
const randomRef = (wid: string) => `zx_${wid.slice(0, 12)}_${Date.now().toString(36)}_${[...crypto.getRandomValues(new Uint8Array(6))].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

// ───────────── POST /api/checkout ─────────────
async function checkout(req: Request, env: Env, d: Deps, headers: Record<string, string>): Promise<Response> {
  const bearer = /^Bearer (.+)$/.exec(req.headers.get('authorization') ?? '')?.[1];
  const caller = bearer ? await verifyFirebaseIdToken(env, d, bearer) : null;
  if (!caller) return json({ error: 'Sign in again to continue.' }, 401, headers);
  if (!caller.emailVerified || !caller.email) return json({ error: 'Confirm your email address before upgrading.', code: 'email_unverified' }, 403, headers);

  let body: any; try { body = await req.json(); } catch { return json({ error: 'Invalid request' }, 400, headers); }
  const { workspaceId, tier, cycle = 'monthly', currency = 'NGN' } = body ?? {};
  if (typeof workspaceId !== 'string' || !ID_RE.test(workspaceId)) return json({ error: 'Invalid workspace' }, 400, headers);
  if (!isTier(tier)) return json({ error: 'Unknown plan' }, 400, headers);
  if (cycle !== 'monthly' && cycle !== 'annual') return json({ error: 'Invalid billing cycle' }, 400, headers);
  if (currency !== 'NGN' && currency !== 'USD') return json({ error: 'Unsupported currency' }, 400, headers);

  const member = await fsGet(env, d, `workspaces/${workspaceId}/members/${caller.uid}`);
  if (!member || !['owner', 'admin'].includes(String(member.data.role))) return json({ error: 'Only a workspace owner or admin can change the plan.' }, 403, headers);

  const amount = amountMinor(tier, cycle, currency, rate(env));
  const reference = randomRef(workspaceId);
  await fsCommit(env, d, [{
    path: `workspaces/${workspaceId}/payments/${reference}`,
    fields: { reference, tier, cycle, currency, amountMinor: amount, status: 'pending', createdBy: caller.uid, createdAt: d.now() },
    precondition: { exists: false },
  }]);

  const r = await d.fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST', headers: { authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ email: caller.email, amount, currency, reference, callback_url: `${env.APP_URL}/app/billing?reference=${reference}`, metadata: { workspaceId, tier, cycle } }),
  });
  const j = (await r.json().catch(() => ({}))) as { status?: boolean; data?: { authorization_url?: string } };
  if (!r.ok || !j.status || !j.data?.authorization_url) return json({ error: 'Payment provider is unavailable. Try again shortly.' }, 502, headers);
  return json({ reference, authorizationUrl: j.data.authorization_url, amountMinor: amount, currency }, 201, headers);
}

// ───────────── POST /api/paystack-webhook ─────────────
async function webhook(req: Request, env: Env, d: Deps): Promise<Response> {
  const raw = await req.text();
  const sig = req.headers.get('x-paystack-signature') ?? '';
  if (!sig || !timingSafeEqual(sig, await paystackSignature(raw, env.PAYSTACK_SECRET_KEY))) return json({ error: 'Invalid signature' }, 401);

  let event: any; try { event = JSON.parse(raw); } catch { return json({ error: 'Invalid payload' }, 400); }
  if (event?.event !== 'charge.success') return json({ ok: true, ignored: true });
  const reference = event.data?.reference;
  const metaWid = event.data?.metadata?.workspaceId;
  if (typeof reference !== 'string' || typeof metaWid !== 'string' || !ID_RE.test(metaWid)) return json({ ok: true, ignored: true });

  // Our own record of what was asked for is the only source of tier, cycle, currency and price.
  const path = `workspaces/${metaWid}/payments/${reference}`;
  const pay = await fsGet(env, d, path);
  if (!pay) return json({ ok: true, ignored: 'unknown_reference' });
  if (pay.data.status === 'paid') return json({ ok: true, duplicate: true });

  // Ask Paystack directly rather than trusting the posted body.
  const v = await d.fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` } });
  const vj = (await v.json().catch(() => ({}))) as { status?: boolean; data?: { status?: string; amount?: number; currency?: string; reference?: string } };
  if (!v.ok || !vj.status || vj.data?.status !== 'success' || vj.data.reference !== reference) return json({ ok: true, ignored: 'not_successful' });
  if (vj.data.currency !== pay.data.currency || (vj.data.amount ?? 0) < Number(pay.data.amountMinor)) {
    await fsCommit(env, d, [{ path, fields: { status: 'mismatch', paidMinor: vj.data.amount ?? 0, paidCurrency: vj.data.currency ?? null, updatedAt: d.now() }, mask: ['status', 'paidMinor', 'paidCurrency', 'updatedAt'], precondition: { updateTime: pay.updateTime } }]);
    return json({ ok: true, ignored: 'amount_mismatch' });
  }

  const tier = String(pay.data.tier); const cycle = pay.data.cycle === 'annual' ? 'annual' : 'monthly';
  if (!isTier(tier)) return json({ ok: true, ignored: 'bad_tier' });
  const ws = await fsGet(env, d, `workspaces/${metaWid}`);
  if (!ws) return json({ ok: true, ignored: 'unknown_workspace' });
  const days = cycle === 'annual' ? 365 : 31;
  const now = d.now();
  const current = ws.data.planExpiresAt instanceof Date ? ws.data.planExpiresAt : null;
  const base = ws.data.plan === tier && current && current > now ? current : now;     // renewing early keeps the remaining time
  const expires = new Date(base.getTime() + days * 86400000);

  await fsCommit(env, d, [
    { path, fields: { status: 'paid', paidMinor: vj.data.amount, paidAt: now }, mask: ['status', 'paidMinor', 'paidAt'], precondition: { updateTime: pay.updateTime } },
    { path: `workspaces/${metaWid}`, fields: { plan: tier, planCycle: cycle, planExpiresAt: expires }, mask: ['plan', 'planCycle', 'planExpiresAt'], precondition: { exists: true } },
  ]);
  return json({ ok: true, activated: tier, expiresAt: expires.toISOString() });
}

export async function handle(req: Request, env: Env, d: Deps = { fetch: (...a) => fetch(...a), now: () => new Date() }): Promise<Response> {
  const url = new URL(req.url);
  const headers = cors(env, req);
  try {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (url.pathname === '/api/health') return json({ status: 'ok' }, 200, headers);
    if (req.method === 'POST' && url.pathname === '/api/checkout') return await checkout(req, env, d, headers);
    if (req.method === 'POST' && url.pathname === '/api/paystack-webhook') return await webhook(req, env, d);
    return json({ error: 'Not found' }, 404, headers);
  } catch (e) {
    console.error('payments worker error', e instanceof Error ? e.message : e);
    return json({ error: 'Something went wrong. Please try again.' }, 500, headers);
  }
}

export default { fetch: (req: Request, env: Env) => handle(req, env) };
