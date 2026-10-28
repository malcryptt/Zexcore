import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { activate, parseReference, validSignature, type Deps } from '../../apps/payments-worker/src/index.js';
import { expectedAmountMinor, nextExpiry } from '../../apps/payments-worker/src/plans.js';
import { ConflictError, signJwt, type FsDoc } from '../../apps/payments-worker/src/firestore.js';

const WID = 'AbCdEfGhIjKlMnOpQrSt';
const REF = `zx_${WID}_k3j2h1g0f9`;
const NOW = new Date('2026-11-02T10:00:00Z');
const GROWTH_NGN = 49 * 1500 * 100;

/** In-memory stand-in for the Firestore REST client: same get/commit surface, with real precondition semantics. */
function fakeFs(docs: Record<string, FsDoc>) {
  let tick = 1;
  Object.values(docs).forEach((d) => (d.updateTime ||= `t${tick++}`));
  const commits: any[][] = [];
  const fs = {
    docs,
    commits,
    docName: (p: string) => `projects/p/databases/(default)/documents/${p}`,
    get: async (p: string): Promise<FsDoc | null> => docs[p] ?? null,
    commit: async (writes: any[]) => {
      for (const w of writes) {
        const path = w.update.name.split('/documents/')[1];
        if (w.currentDocument?.updateTime && docs[path]?.updateTime !== w.currentDocument.updateTime) throw new ConflictError('FAILED_PRECONDITION');
      }
      for (const w of writes) {
        const path = w.update.name.split('/documents/')[1];
        docs[path] = { name: w.update.name, fields: { ...docs[path]?.fields, ...w.update.fields }, updateTime: `t${tick++}` };
      }
      commits.push(writes);
    },
  };
  return fs;
}
const order = (o: Record<string, string> = {}): FsDoc => ({
  name: 'x',
  fields: Object.fromEntries(Object.entries({ status: 'pending', tier: 'growth', cycle: 'monthly', currency: 'NGN', ...o }).map(([k, v]) => [k, { stringValue: v }])),
});
const world = (orderOver: Record<string, string> = {}, ws: FsDoc = { name: 'w', fields: { plan: { stringValue: 'free' } } }) =>
  fakeFs({ [`workspaces/${WID}/orders/${REF}`]: order(orderOver), [`workspaces/${WID}`]: ws });
const deps = (fs: ReturnType<typeof fakeFs>, tx: { status: string; amount: number; currency: string } | null): Deps =>
  ({ fs: fs as any, verify: async () => tx, now: () => NOW, ngnPerUsd: 1500 });
const plan = (fs: ReturnType<typeof fakeFs>) => fs.docs[`workspaces/${WID}`]!.fields!.plan!.stringValue;

describe('Paystack signature', () => {
  const body = JSON.stringify({ event: 'charge.success', data: { reference: REF } });
  const sign = (b: string, k: string) => crypto.createHmac('sha512', k).update(b).digest('hex');
  it('accepts the genuine signature only', async () => {
    expect(await validSignature(body, sign(body, 'sk_test_abc'), 'sk_test_abc')).toBe(true);
    expect(await validSignature(body + ' ', sign(body, 'sk_test_abc'), 'sk_test_abc')).toBe(false);
    expect(await validSignature(body, sign(body, 'other'), 'sk_test_abc')).toBe(false);
    expect(await validSignature(body, null, 'sk_test_abc')).toBe(false);
    expect(await validSignature(body, 'abc', 'sk_test_abc')).toBe(false);
    expect(await validSignature(body, sign(body, ''), '')).toBe(false);
  });
});

describe('references', () => {
  it('only accepts our own reference shape', () => {
    expect(parseReference(REF)).toEqual({ wid: WID });
    for (const bad of ['', 'zx_short_abc12345', `zx_${WID}`, `zx_${WID}_UPPERCASE1`, `../${REF}`, `zx_${WID}_ab/../cd12345`, 42, null]) {
      expect(parseReference(bad)).toBeNull();
    }
  });
});

describe('plan activation', () => {
  it('activates a verified, correctly priced payment and sets the expiry', async () => {
    const fs = world();
    expect((await activate(REF, deps(fs, { status: 'success', amount: GROWTH_NGN, currency: 'NGN' }))).status).toBe('activated');
    expect(plan(fs)).toBe('growth');
    expect(fs.docs[`workspaces/${WID}`]!.fields!.planExpiresAt!.timestampValue).toBe('2026-12-02T10:00:00.000Z');
    expect(fs.docs[`workspaces/${WID}/orders/${REF}`]!.fields!.status!.stringValue).toBe('paid');
  });
  it('is idempotent: a replayed webhook changes nothing', async () => {
    const fs = world();
    const d = deps(fs, { status: 'success', amount: GROWTH_NGN, currency: 'NGN' });
    expect((await activate(REF, d)).status).toBe('activated');
    expect((await activate(REF, d)).status).toBe('duplicate');
    expect(fs.commits).toHaveLength(1);
  });
  it('refuses underpayment, wrong currency, failed or unverifiable payments', async () => {
    for (const tx of [
      { status: 'success', amount: GROWTH_NGN - 1, currency: 'NGN' },
      { status: 'success', amount: 4900, currency: 'USD' },
      { status: 'failed', amount: GROWTH_NGN, currency: 'NGN' },
      null,
    ]) {
      const fs = world();
      expect((await activate(REF, deps(fs, tx))).status).toBe('rejected');
      expect(fs.commits).toHaveLength(0);
      expect(plan(fs)).toBe('free');
    }
  });
  it('prices the plan itself: a cheap payment cannot buy a dearer tier named in the order', async () => {
    const fs = world({ tier: 'enterprise' });
    expect((await activate(REF, deps(fs, { status: 'success', amount: GROWTH_NGN, currency: 'NGN' }))).status).toBe('rejected');
    expect(plan(fs)).toBe('free');
  });
  it('ignores orders that do not exist, are not pending, or are malformed', async () => {
    const tx = { status: 'success', amount: GROWTH_NGN, currency: 'NGN' };
    expect((await activate(`zx_${WID}_nope12345`, deps(world(), tx))).status).toBe('rejected');
    expect((await activate(REF, deps(world({ status: 'cancelled' }), tx))).status).toBe('rejected');
    expect((await activate(REF, deps(world({ tier: 'platinum' }), tx))).status).toBe('rejected');
    expect((await activate('not-ours', deps(world(), tx))).status).toBe('ignored');
  });
  it('a concurrent delivery loses the race instead of double-applying', async () => {
    const fs = world();
    const orderPath = `workspaces/${WID}/orders/${REF}`;
    const realGet = fs.get;
    let first = true;
    fs.get = async (p: string) => {
      const doc = await realGet(p);
      if (first && p === orderPath) { first = false; fs.docs[p] = { ...fs.docs[p]!, updateTime: 'moved-on' }; }
      return doc;
    };
    expect((await activate(REF, deps(fs, { status: 'success', amount: GROWTH_NGN, currency: 'NGN' }))).status).toBe('duplicate');
    expect(plan(fs)).toBe('free');
  });
  it('paying while still subscribed extends from the current expiry', () => {
    expect(nextExpiry(NOW, new Date('2026-11-20T00:00:00Z'), 'monthly').toISOString()).toBe('2026-12-20T00:00:00.000Z');
    expect(nextExpiry(NOW, new Date('2026-10-01T00:00:00Z'), 'annual').toISOString()).toBe('2027-11-02T10:00:00.000Z');
  });
  it('matches the API price list', () => {
    expect(expectedAmountMinor('growth', 'monthly', 'USD', 1500)).toBe(4900);
    expect(expectedAmountMinor('starter', 'annual', 'NGN', 1500)).toBe(19000 * 1500);
  });
});

describe('service-account auth', () => {
  it('signs an RS256 JWT with the right claims', async () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
    const jwt = await signJwt({ client_email: 'w@p.iam.gserviceaccount.com', private_key: pem }, 1_800_000_000);
    const [h, c, s] = jwt.split('.');
    expect(JSON.parse(Buffer.from(h!, 'base64url').toString())).toEqual({ alg: 'RS256', typ: 'JWT' });
    expect(JSON.parse(Buffer.from(c!, 'base64url').toString())).toMatchObject({
      iss: 'w@p.iam.gserviceaccount.com', scope: 'https://www.googleapis.com/auth/datastore', exp: 1_800_003_300,
    });
    expect(crypto.verify('RSA-SHA256', Buffer.from(`${h}.${c}`), publicKey, Buffer.from(s!, 'base64url'))).toBe(true);
  });
});
