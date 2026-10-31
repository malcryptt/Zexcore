import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'node:crypto';
import { createServer } from '../../apps/api/src/server.js';
import { googleTestHooks } from '../../apps/api/src/routes/google.js';
import { mailTestHooks } from '../../apps/api/src/lib/mailer.js';
import { closeDatabaseConnection, getSqlClient } from '../../packages/core/src/index.js';
import type { FastifyInstance } from 'fastify';

const CLIENT = 'sec-test-client.apps.googleusercontent.com';
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...(publicKey.export({ format: 'jwk' }) as any), kid: 'k1', alg: 'RS256' };
const googleToken = (claims: Record<string, unknown>) => {
  const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const h = enc({ alg: 'RS256', kid: 'k1', typ: 'JWT' });
  const p = enc({ iss: 'https://accounts.google.com', aud: CLIENT, sub: '77', exp: Math.floor(Date.now() / 1000) + 600, email_verified: true, ...claims });
  return `${h}.${p}.${crypto.sign('RSA-SHA256', Buffer.from(`${h}.${p}`), privateKey).toString('base64url')}`;
};

const PW = 'Correct-Horse-Battery-9';
const PW2 = 'Another-Strong-Phrase-77';

describe('Account security: verification, reset, sessions', () => {
  let server: FastifyInstance;
  let n = 1;
  const call = (method: string, url: string, o: { token?: string; payload?: unknown } = {}) =>
    server.inject({ method: method as any, url, payload: o.payload as any, headers: o.token ? { authorization: `Bearer ${o.token}` } : {}, remoteAddress: `10.20.${Math.floor(n / 250)}.${(n++ % 250) + 1}` });
  const lastMailTo = async (to: string, subject?: RegExp, timeoutMs = 5000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      const m = [...mailTestHooks.outbox].reverse().find((x) => x.to === to && (!subject || subject.test(x.subject)));
      if (m) return m;
      await new Promise((r) => setTimeout(r, 25));
    }
    return undefined;
  };
  const linkToken = (text: string) => /token=([A-Za-z0-9_-]+)/.exec(text)![1]!;
  const signup = async (sfx: string) => {
    const email = `u-${sfx}@sec.test`;
    const r = await call('POST', '/api/auth/register', { payload: { tenantName: `Sec ${sfx} Co`, name: 'Sade Okon', email, password: PW } });
    expect(r.statusCode).toBe(201);
    // The confirmation email is sent in the background; wait for it so it cannot land in a later assertion's window.
    expect(await lastMailTo(email, /confirm/i)).toBeDefined();
    return { email, token: r.json().token as string };
  };

  beforeAll(async () => {
    process.env.GOOGLE_CLIENT_ID = CLIENT;
    googleTestHooks.getKeys = async () => [jwk];
    server = await createServer();
    await server.ready();
  });
  afterAll(async () => { await server?.close(); await closeDatabaseConnection(); });

  it('sign-up emails a confirmation link; the link works once', async () => {
    const { email, token } = await signup(crypto.randomBytes(3).toString('hex'));
    const mail = await lastMailTo(email);
    expect(mail?.subject).toMatch(/confirm/i);
    const me1 = await call('GET', '/api/auth/me', { token });
    expect(me1.json().user.emailVerified).toBe(false);

    const verify = linkToken(mail!.text);
    expect((await call('POST', '/api/auth/email/verify', { payload: { token: verify } })).statusCode).toBe(200);
    expect((await call('GET', '/api/auth/me', { token })).json().user.emailVerified).toBe(true);
    expect((await call('POST', '/api/auth/email/verify', { payload: { token: verify } })).statusCode).toBe(400);
    expect((await call('POST', '/api/auth/email/verify', { payload: { token: 'a'.repeat(43) } })).statusCode).toBe(400);
    const ok = await call('POST', '/api/billing/checkout', { token, payload: { tier: 'growth', cycle: 'monthly', currency: 'NGN' } });
    expect(ok.statusCode).toBe(201);
  });

  it('resend sends a fresh link and invalidates the old one', async () => {
    const { email, token } = await signup(crypto.randomBytes(3).toString('hex'));
    const first = linkToken((await lastMailTo(email))!.text);
    mailTestHooks.outbox.length = 0;
    expect((await call('POST', '/api/auth/email/resend', { token })).statusCode).toBe(200);
    const second = linkToken((await lastMailTo(email, /confirm/i))!.text);
    expect(second).not.toBe(first);
    expect((await call('POST', '/api/auth/email/verify', { payload: { token: first } })).statusCode).toBe(400);
    expect((await call('POST', '/api/auth/email/verify', { payload: { token: second } })).statusCode).toBe(200);
    expect((await call('POST', '/api/auth/email/resend', { token })).json().alreadyVerified).toBe(true);
  });

  it('password reset: no account enumeration, weak passwords keep the link alive, success signs out everywhere', async () => {
    const { email, token: oldSession } = await signup(crypto.randomBytes(3).toString('hex'));
    mailTestHooks.outbox.length = 0;

    const unknown = await call('POST', '/api/auth/password/forgot', { payload: { email: `nobody-${Date.now()}@sec.test` } });
    const known = await call('POST', '/api/auth/password/forgot', { payload: { email: email.toUpperCase() } });
    expect(unknown.statusCode).toBe(200);
    expect(known.statusCode).toBe(200);
    expect(known.json()).toEqual(unknown.json());
    const mail = await lastMailTo(email, /reset/i);
    expect(mail?.subject).toMatch(/reset/i);
    expect(mailTestHooks.outbox.some((m) => m.to.startsWith('nobody-'))).toBe(false);

    const t = linkToken(mail!.text);
    const weak = await call('POST', '/api/auth/password/reset', { payload: { token: t, password: 'short' } });
    expect(weak.statusCode).toBe(400);
    expect(weak.json().code).toBe('weak_password');

    expect((await call('POST', '/api/auth/password/reset', { payload: { token: t, password: PW2 } })).statusCode).toBe(200);
    expect((await call('POST', '/api/auth/password/reset', { payload: { token: t, password: PW2 } })).statusCode).toBe(400);

    expect((await call('GET', '/api/auth/me', { token: oldSession })).statusCode).toBe(401);
    expect((await call('POST', '/api/auth/login', { payload: { email, password: PW } })).statusCode).toBe(401);
    const login = await call('POST', '/api/auth/login', { payload: { email, password: PW2 } });
    expect(login.statusCode).toBe(200);
    expect((await call('GET', '/api/auth/me', { token: login.json().token })).json().user.emailVerified).toBe(true);
  });

  it('logout kills the token immediately; sessions can be listed and revoked individually', async () => {
    const { email, token: a } = await signup(crypto.randomBytes(3).toString('hex'));
    const b = (await call('POST', '/api/auth/login', { payload: { email, password: PW } })).json().token as string;
    const c = (await call('POST', '/api/auth/login', { payload: { email, password: PW } })).json().token as string;

    const list = (await call('GET', '/api/auth/sessions', { token: a })).json().sessions as { id: string; current: boolean }[];
    expect(list.length).toBeGreaterThanOrEqual(3);
    expect(list.filter((s) => s.current)).toHaveLength(1);

    const other = list.find((s) => !s.current)!;
    expect((await call('DELETE', `/api/auth/sessions/${other.id}`, { token: a })).statusCode).toBe(204);
    expect((await call('DELETE', `/api/auth/sessions/${other.id}`, { token: a })).statusCode).toBe(404);
    expect((await call('DELETE', '/api/auth/sessions/not-a-uuid', { token: a })).statusCode).toBe(400);

    const rev = await call('POST', '/api/auth/sessions/revoke-others', { token: a });
    expect(rev.statusCode).toBe(200);
    expect((await call('GET', '/api/auth/me', { token: a })).statusCode).toBe(200);
    expect((await call('GET', '/api/auth/me', { token: b })).statusCode).toBe(401);
    expect((await call('GET', '/api/auth/me', { token: c })).statusCode).toBe(401);

    expect((await call('POST', '/api/auth/logout', { token: a })).statusCode).toBe(200);
    expect((await call('GET', '/api/auth/me', { token: a })).statusCode).toBe(401);
  });

  it('changing your password needs the current one, signs out other devices and hands back a fresh token', async () => {
    const { email, token } = await signup(crypto.randomBytes(3).toString('hex'));
    const other = (await call('POST', '/api/auth/login', { payload: { email, password: PW } })).json().token as string;
    expect((await call('POST', '/api/auth/password/change', { token, payload: { currentPassword: 'nope-nope-nope', newPassword: PW2 } })).json().code).toBe('wrong_password');
    const ch = await call('POST', '/api/auth/password/change', { token, payload: { currentPassword: PW, newPassword: PW2 } });
    expect(ch.statusCode).toBe(200);
    expect((await call('GET', '/api/auth/me', { token: other })).statusCode).toBe(401);
    expect((await call('GET', '/api/auth/me', { token })).statusCode).toBe(401);
    expect((await call('GET', '/api/auth/me', { token: ch.json().token })).statusCode).toBe(200);
  });

  it('a forged or session-less token is refused even with a valid signature', async () => {
    const { signAuthToken } = await import('../../packages/core/src/index.js');
    const bare = signAuthToken({ userId: crypto.randomUUID(), principalType: 'tenant_user', isPlatformAdmin: false });
    expect((await call('GET', '/api/auth/sessions', { token: bare })).statusCode).toBe(401);
    const fake = signAuthToken({ userId: crypto.randomUUID(), principalType: 'tenant_user', isPlatformAdmin: false, sid: crypto.randomUUID() });
    expect((await call('GET', '/api/auth/sessions', { token: fake })).statusCode).toBe(401);
  });

  it('Google sign-in proves ownership: a pre-registered unverified account loses its password and sessions', async () => {
    const sfx = crypto.randomBytes(3).toString('hex');
    const email = `victim-${sfx}@gmail.test`;
    const attacker = await call('POST', '/api/auth/register', { payload: { tenantName: `Pre ${sfx} Co`, name: 'Mallory', email, password: PW } });
    const attackerToken = attacker.json().token as string;
    const g = await call('POST', '/api/auth/google', { payload: { credential: googleToken({ email, name: 'Real Owner' }) } });
    expect(g.statusCode).toBe(200);
    expect(g.json().token).toBeTruthy();
    expect((await call('GET', '/api/auth/me', { token: attackerToken })).statusCode).toBe(401);
    expect((await call('POST', '/api/auth/login', { payload: { email, password: PW } })).statusCode).toBe(401);
    expect((await call('GET', '/api/auth/me', { token: g.json().token })).json().user.emailVerified).toBe(true);
  });

  it('the runtime database role cannot read sessions or tokens directly', async () => {
    const sql = getSqlClient();
    await expect(sql.unsafe('SELECT * FROM auth_sessions LIMIT 1')).rejects.toThrow(/permission denied/i);
    await expect(sql.unsafe('SELECT * FROM auth_tokens LIMIT 1')).rejects.toThrow(/permission denied/i);
  });
});
