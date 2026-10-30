import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { handle, paystackSignature, amountMinor, toFs, fromFs, resetTokenCache, resetJwksCache, type Env } from '../../workers/payments/src/index.js';

const PROJECT = 'zexcore-5d6c0';
const SECRET = 'sk_test_worker_secret';
const WID = 'ws1';
const NOW = new Date('2026-11-02T10:00:00Z');

let saPem = ''; let idKey: CryptoKeyPair; let idJwk: any;
let env: Env;

const b64 = (b: ArrayBuffer | Uint8Array) => Buffer.from(b instanceof Uint8Array ? b : new Uint8Array(b)).toString('base64url');
async function pkcs8Pem(key: CryptoKey) {
  const der = Buffer.from(await crypto.subtle.exportKey('pkcs8', key)).toString('base64').match(/.{1,64}/g)!.join('\n');
  return `-----BEGIN PRIVATE KEY-----\n${der}\n-----END PRIVATE KEY-----\n`;
}
async function idToken(over: Record<string, unknown> = {}, key = idKey.privateKey) {
  const head = b64(Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'k1', typ: 'JWT' })));
  const claims = { aud: PROJECT, iss: `https://securetoken.google.com/${PROJECT}`, sub: 'owner1', email: 'sade@example.com', email_verified: true,
    exp: Math.floor(NOW.getTime() / 1000) + 3000, iat: Math.floor(NOW.getTime() / 1000), ...over };
  const body = b64(Buffer.from(JSON.stringify(claims)));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, Buffer.from(`${head}.${body}`));
  return `${head}.${body}.${b64(sig)}`;
}

// ── in-memory Firestore + Google + Paystack ──
type Doc = { fields: Record<string, any>; v: number };
let store: Map<string, Doc>; let commits: any[]; let paystackInit: any[]; let paystackVerify: Record<string, any>;
const fsPath = (u: string) => decodeURIComponent(u.split('/documents/')[1]!.split('?')[0]!);
function mockFetch(): typeof fetch {
  return (async (input: any, init: any = {}) => {
    const url = String(input);
    if (url.startsWith('https://oauth2.googleapis.com/token')) return Response.json({ access_token: 'at', expires_in: 3600 });
    if (url.includes('/service_accounts/v1/jwk/securetoken')) return Response.json({ keys: [{ ...idJwk, kid: 'k1', alg: 'RS256', use: 'sig' }] });
    if (url.endsWith(':commit')) {
      const writes = JSON.parse(init.body).writes as any[];
      for (const w of writes) {   // validate every precondition first = atomic
        const p = fsPath(w.update.name); const cur = store.get(p);
        if (w.currentDocument?.exists === false && cur) return new Response('{}', { status: 409 });
        if (w.currentDocument?.exists === true && !cur) return new Response('{}', { status: 404 });
        if (w.currentDocument?.updateTime && String(cur?.v) !== w.currentDocument.updateTime) return new Response('{}', { status: 409 });
      }
      for (const w of writes) {
        const p = fsPath(w.update.name); const cur = store.get(p);
        const next = w.updateMask ? { ...(cur?.fields ?? {}), ...Object.fromEntries(w.updateMask.fieldPaths.map((k: string) => [k, w.update.fields[k]])) } : w.update.fields;
        store.set(p, { fields: next, v: (cur?.v ?? 0) + 1 });
      }
      commits.push(writes);
      return Response.json({});
    }
    if (url.includes('firestore.googleapis.com')) {
      const d = store.get(fsPath(url));
      return d ? Response.json({ name: `projects/${PROJECT}/databases/(default)/documents/${fsPath(url)}`, fields: d.fields, updateTime: String(d.v) }) : new Response('{}', { status: 404 });
    }
    if (url.endsWith('/transaction/initialize')) { paystackInit.push(JSON.parse(init.body)); return Response.json({ status: true, data: { authorization_url: 'https://checkout.paystack.com/abc' } }); }
    if (url.includes('/transaction/verify/')) { const ref = decodeURIComponent(url.split('/verify/')[1]!); return Response.json(paystackVerify[ref] ?? { status: false }); }
    throw new Error(`unexpected fetch ${url}`);
  }) as typeof fetch;
}
const seedDoc = (path: string, data: Record<string, unknown>) => store.set(path, { fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toFs(v)])), v: 1 });
const call = (path: string, init: RequestInit & { headers?: Record<string, string> } = {}) =>
  handle(new Request(`https://pay.example.workers.dev${path}`, { method: 'POST', ...init }), env, { fetch: mockFetch(), now: () => NOW });
const checkoutBody = (o: object = {}) => JSON.stringify({ workspaceId: WID, tier: 'growth', cycle: 'monthly', currency: 'NGN', ...o });
const authed = async (over?: Record<string, unknown>) => ({ authorization: `Bearer ${await idToken(over)}`, 'content-type': 'application/json', origin: 'https://zexcore.com.ng' });

beforeAll(async () => {
  const sa = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  saPem = await pkcs8Pem(sa.privateKey);
  idKey = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']) as CryptoKeyPair;
  idJwk = await crypto.subtle.exportKey('jwk', idKey.publicKey);
});
beforeEach(() => {
  resetTokenCache(); resetJwksCache();
  store = new Map(); commits = []; paystackInit = []; paystackVerify = {};
  env = { PAYSTACK_SECRET_KEY: SECRET, FIREBASE_PROJECT_ID: PROJECT, APP_URL: 'https://zexcore.com.ng', ALLOWED_ORIGINS: 'https://zexcore.com.ng,https://zexcore-5d6c0.web.app', NGN_PER_USD: '1500',
    FIREBASE_SERVICE_ACCOUNT: JSON.stringify({ client_email: 'w@x.iam.gserviceaccount.com', private_key: saPem }) };
  seedDoc(`workspaces/${WID}`, { name: 'Sade Salon', plan: 'free', ownerUid: 'owner1', slug: 'sade-salon' });
  seedDoc(`workspaces/${WID}/members/owner1`, { role: 'owner' });
  seedDoc(`workspaces/${WID}/members/staff1`, { role: 'staff' });
});

describe('pricing', () => {
  it('computes prices on the server in minor units', () => {
    expect(amountMinor('growth', 'monthly', 'NGN', 1500)).toBe(7_350_000);
    expect(amountMinor('starter', 'annual', 'USD')).toBe(19_000);
  });
  it('round-trips Firestore values', () => {
    const v = { a: 'x', n: 5, d: new Date('2026-01-01T00:00:00Z'), arr: [1, 'b'], nested: { ok: true } };
    expect(fromFs(toFs(v))).toEqual(v);
  });
});

describe('POST /api/checkout', () => {
  it('rejects missing, forged, expired and wrong-project tokens', async () => {
    expect((await call('/api/checkout', { body: checkoutBody() })).status).toBe(401);
    const other = (await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign'])) as CryptoKeyPair;
    for (const t of [await idToken({}, other.privateKey), await idToken({ exp: 10 }), await idToken({ aud: 'other-project' }), 'not.a.jwt']) {
      expect((await call('/api/checkout', { body: checkoutBody(), headers: { authorization: `Bearer ${t}` } })).status).toBe(401);
    }
    expect(paystackInit).toHaveLength(0);
  });
  it('requires a verified email', async () => {
    const r = await call('/api/checkout', { body: checkoutBody(), headers: await authed({ email_verified: false }) });
    expect(r.status).toBe(403); expect((await r.json()).code).toBe('email_unverified');
  });
  it('only lets owners and admins of that workspace upgrade it', async () => {
    expect((await call('/api/checkout', { body: checkoutBody(), headers: await authed({ sub: 'staff1' }) })).status).toBe(403);
    expect((await call('/api/checkout', { body: checkoutBody(), headers: await authed({ sub: 'stranger' }) })).status).toBe(403);
    expect(paystackInit).toHaveLength(0);
  });
  it('prices the order itself and ignores any amount the browser sends', async () => {
    const r = await call('/api/checkout', { body: checkoutBody({ amount: 1, amountMinor: 1, price: 0 }), headers: await authed() });
    expect(r.status).toBe(201);
    const j = await r.json();
    expect(j.authorizationUrl).toBe('https://checkout.paystack.com/abc');
    expect(paystackInit[0].amount).toBe(7_350_000);
    expect(paystackInit[0].currency).toBe('NGN');
    const pay = [...store.entries()].find(([k]) => k.startsWith(`workspaces/${WID}/payments/`))!;
    expect(fromFs(pay[1].fields.status)).toBe('pending');
    expect(fromFs(pay[1].fields.amountMinor)).toBe(7_350_000);
  });
  it('validates plan, cycle, currency and workspace id', async () => {
    for (const bad of [{ tier: 'free' }, { tier: 'platinum' }, { cycle: 'weekly' }, { currency: 'GBP' }, { workspaceId: '../x' }]) {
      expect((await call('/api/checkout', { body: checkoutBody(bad), headers: await authed() })).status).toBe(400);
    }
  });
  it('answers CORS only for allowed origins', async () => {
    const ok = await call('/api/checkout', { method: 'OPTIONS', headers: { origin: 'https://zexcore.com.ng' } });
    expect(ok.headers.get('access-control-allow-origin')).toBe('https://zexcore.com.ng');
    const evil = await call('/api/checkout', { method: 'OPTIONS', headers: { origin: 'https://evil.example' } });
    expect(evil.headers.get('access-control-allow-origin')).toBeNull();
  });
});

describe('POST /api/paystack-webhook', () => {
  const REF = 'zx_ws1_test_ref';
  const event = (over: Record<string, unknown> = {}) => JSON.stringify({ event: 'charge.success', data: { reference: REF, metadata: { workspaceId: WID, tier: 'enterprise' }, ...over } });
  const send = async (body: string, sig?: string) => call('/api/paystack-webhook', { body, headers: { 'x-paystack-signature': sig ?? (await paystackSignature(body, SECRET)) } });
  const pending = (over: Record<string, unknown> = {}) => seedDoc(`workspaces/${WID}/payments/${REF}`, { reference: REF, tier: 'growth', cycle: 'monthly', currency: 'NGN', amountMinor: 7_350_000, status: 'pending', ...over });
  const ok = (amount = 7_350_000, currency = 'NGN') => { paystackVerify[REF] = { status: true, data: { status: 'success', amount, currency, reference: REF } }; };
  const plan = () => fromFs(store.get(`workspaces/${WID}`)!.fields.plan);

  it('rejects bad or missing signatures and changes nothing', async () => {
    pending(); ok();
    expect((await send(event(), 'deadbeef')).status).toBe(401);
    expect((await call('/api/paystack-webhook', { body: event() })).status).toBe(401);
    expect(plan()).toBe('free');
  });
  it('activates the plan Paystack confirmed, using OUR record not the posted metadata', async () => {
    pending(); ok();
    const r = await send(event());                                  // metadata claims "enterprise"; our record says growth
    expect(r.status).toBe(200); expect((await r.json()).activated).toBe('growth');
    expect(plan()).toBe('growth');
    const exp = fromFs(store.get(`workspaces/${WID}`)!.fields.planExpiresAt) as Date;
    expect(exp.toISOString()).toBe(new Date(NOW.getTime() + 31 * 86400000).toISOString());
    expect(fromFs(store.get(`workspaces/${WID}/payments/${REF}`)!.fields.status)).toBe('paid');
  });
  it('is idempotent: a replayed webhook does not extend the plan again', async () => {
    pending(); ok();
    await send(event()); const first = commits.length;
    const r = await send(event());
    expect((await r.json()).duplicate).toBe(true);
    expect(commits.length).toBe(first);
  });
  it('refuses underpayment and wrong currency', async () => {
    pending(); ok(100);
    expect((await (await send(event())).json()).ignored).toBe('amount_mismatch');
    expect(plan()).toBe('free');
    pending(); ok(7_350_000, 'USD');
    await send(event());
    expect(plan()).toBe('free');
  });
  it('ignores references we never issued and payments Paystack does not confirm', async () => {
    ok(); expect((await (await send(event())).json()).ignored).toBe('unknown_reference');
    pending(); paystackVerify[REF] = { status: true, data: { status: 'failed', amount: 7_350_000, currency: 'NGN', reference: REF } };
    expect((await (await send(event())).json()).ignored).toBe('not_successful');
    expect(plan()).toBe('free');
  });
  it('ignores other events', async () => {
    pending(); ok();
    expect((await (await send(JSON.stringify({ event: 'charge.failed', data: { reference: REF } }))).json()).ignored).toBe(true);
    expect(plan()).toBe('free');
  });
  it('renewing early keeps the time already paid for', async () => {
    seedDoc(`workspaces/${WID}`, { plan: 'growth', ownerUid: 'owner1', planExpiresAt: new Date(NOW.getTime() + 10 * 86400000) });
    pending(); ok();
    await send(event());
    const exp = fromFs(store.get(`workspaces/${WID}`)!.fields.planExpiresAt) as Date;
    expect(exp.getTime()).toBe(NOW.getTime() + 41 * 86400000);
  });
});
