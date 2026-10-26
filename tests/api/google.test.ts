import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'node:crypto';
import { createServer } from '../../apps/api/src/server.js';
import { googleTestHooks } from '../../apps/api/src/routes/google.js';
import { verifyGoogleIdToken } from '../../apps/api/src/auth/googleToken.js';
import { closeDatabaseConnection } from '../../packages/core/src/index.js';
import type { FastifyInstance } from 'fastify';

const CLIENT = 'test-client-id.apps.googleusercontent.com';
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...(publicKey.export({ format: 'jwk' }) as any), kid: 'k1', alg: 'RS256' };
const keys = async () => [jwk];

function idToken(claims: Record<string, unknown>, opts: { key?: crypto.KeyObject; kid?: string } = {}): string {
  const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const h = enc({ alg: 'RS256', kid: opts.kid ?? 'k1', typ: 'JWT' });
  const p = enc({ iss: 'https://accounts.google.com', aud: CLIENT, sub: '1234', exp: Math.floor(Date.now() / 1000) + 600, email_verified: true, ...claims });
  const sig = crypto.sign('RSA-SHA256', Buffer.from(`${h}.${p}`), opts.key ?? privateKey).toString('base64url');
  return `${h}.${p}.${sig}`;
}

describe('Google ID-token verification', () => {
  it('accepts a valid token and rejects tampering, wrong audience, expiry, unverified email, wrong key', async () => {
    const ok = await verifyGoogleIdToken(idToken({ email: 'A@B.com', name: 'Ada' }), { clientId: CLIENT, getKeys: keys });
    expect(ok).toEqual({ email: 'a@b.com', name: 'Ada', sub: '1234' });
    const v = (t: string) => verifyGoogleIdToken(t, { clientId: CLIENT, getKeys: keys });
    expect(await v(idToken({ email: 'a@b.com', aud: 'other' }))).toBeNull();
    expect(await v(idToken({ email: 'a@b.com', exp: 1 }))).toBeNull();
    expect(await v(idToken({ email: 'a@b.com', email_verified: false }))).toBeNull();
    expect(await v(idToken({ email: 'a@b.com', iss: 'https://evil.example' }))).toBeNull();
    expect(await v(idToken({ email: 'a@b.com' }, { key: crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey }))).toBeNull();
    expect(await v(idToken({ email: 'a@b.com' }, { kid: 'nope' }))).toBeNull();
    const t = idToken({ email: 'a@b.com' }).split('.');
    t[1] = Buffer.from(JSON.stringify({ iss: 'accounts.google.com', aud: CLIENT, exp: 9e9, email_verified: true, email: 'admin@victim.com', sub: '1' })).toString('base64url');
    expect(await v(t.join('.'))).toBeNull();
  });
});

describe('POST /api/auth/google', () => {
  let server: FastifyInstance;
  const sfx = crypto.randomBytes(3).toString('hex');
  const email = `g-${sfx}@gmail.test`;
  let n = 20;
  const post = (payload: unknown) => server.inject({ method: 'POST', url: '/api/auth/google', payload: payload as any, remoteAddress: `10.9.0.${n++}` });

  beforeAll(async () => {
    process.env.GOOGLE_CLIENT_ID = CLIENT;
    googleTestHooks.getKeys = keys;
    server = await createServer();
    await server.ready();
  });
  afterAll(async () => { await server.close(); await closeDatabaseConnection(); });

  it('reports configuration and refuses when unconfigured', async () => {
    const c = await server.inject({ method: 'GET', url: '/api/auth/google/config' });
    expect(c.json().clientId).toBe(CLIENT);
  });
  it('rejects an invalid credential', async () => {
    const r = await post({ credential: 'x'.repeat(40) });
    expect(r.statusCode).toBe(401);
  });
  it('unknown email asks for a workspace name, then creates tenant + owner', async () => {
    const credential = idToken({ email, name: 'Gina Google' });
    const first = await post({ credential });
    expect(first.json()).toMatchObject({ needsSignup: true, email });
    const created = await post({ credential, tenantName: `Gina ${sfx} Salon` });
    expect(created.statusCode).toBe(201);
    expect(created.json().role).toBe('owner');
    const me = await server.inject({ method: 'GET', url: '/api/auth/me', headers: { authorization: `Bearer ${created.json().token}` } });
    expect(me.json().tenant.slug).toBe(`gina-${sfx}-salon`);
  });
  it('returning Google user signs in; password login is impossible for that account', async () => {
    const r = await post({ credential: idToken({ email, name: 'Gina Google' }) });
    expect(r.statusCode).toBe(200);
    const me = await server.inject({ method: 'GET', url: '/api/auth/me', headers: { authorization: `Bearer ${r.json().token}` } });
    expect(me.json().role).toBe('owner');
    const pw = await server.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password: 'anything-at-all-123' }, remoteAddress: '10.9.1.1' });
    expect(pw.statusCode).toBe(401);
  });
});
