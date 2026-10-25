import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'node:crypto';

const PAYSTACK_SECRET = 'sk_test_activation_secret';
process.env.PAYSTACK_SECRET_KEY = PAYSTACK_SECRET;
process.env.FLUTTERWAVE_SECRET_HASH = 'flw_hash_activation';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_activation';
process.env.NGN_PER_USD = '1500';

const { createServer } = await import('../../apps/api/src/server.js');
const core = await import('../../packages/core/src/index.js');
const { createTenant, adminProvision } = await import('../helpers/db.js');
import type { FastifyInstance } from 'fastify';

describe('Billing: server-priced checkout -> verified webhook -> plan activation', () => {
  let server: FastifyInstance;
  let tenantId: string;
  let slug: string;
  let adminAuth: Record<string, string>;
  let viewerAuth: Record<string, string>;

  const paystackEvent = (reference: string, amountKobo: number, extra: Record<string, unknown> = {}) => {
    const body = JSON.stringify({
      event: 'charge.success',
      data: { reference, amount: amountKobo, currency: 'NGN', status: 'success', customer: { email: 'x@y.z' }, ...extra },
    });
    const sig = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');
    return server.inject({
      method: 'POST',
      url: '/api/webhooks/billing/paystack',
      headers: { 'content-type': 'application/json', 'x-paystack-signature': sig },
      body,
    });
  };
  const tierNow = async () => (await core.resolveTenant({ id: tenantId }))!.tier;
  const checkout = (tier: string, cycle = 'monthly', currency = 'NGN') =>
    server.inject({ method: 'POST', url: '/api/billing/checkout', headers: { 'x-tenant-id': tenantId, ...adminAuth }, payload: { tier, cycle, currency } });

  beforeAll(async () => {
    server = await createServer();
    await server.ready();
    slug = `bill-${crypto.randomBytes(4).toString('hex')}`;
    tenantId = await createTenant(slug, 'Billing Test', 'free');
    adminAuth = { authorization: `Bearer ${core.signAuthToken({ userId: crypto.randomUUID(), tenantId, role: 'owner', principalType: 'tenant_user' })}` };
    viewerAuth = { authorization: `Bearer ${core.signAuthToken({ userId: crypto.randomUUID(), tenantId, role: 'viewer', principalType: 'tenant_user' })}` };
  });
  afterAll(async () => {
    await server.close();
    await core.closeDatabaseConnection();
  });

  it('prices on the server and refuses unknown plans / non-admins', async () => {
    const r = await checkout('growth', 'monthly', 'NGN');
    expect(r.statusCode).toBe(201);
    expect(r.json().amountMinor).toBe(49 * 1500 * 100);
    expect((await checkout('free-forever')).statusCode).toBe(400);
    expect((await checkout('growth', 'weekly')).statusCode).toBe(400);
    const v = await server.inject({ method: 'POST', url: '/api/billing/checkout', headers: { 'x-tenant-id': tenantId, ...viewerAuth }, payload: { tier: 'growth' } });
    expect(v.statusCode).toBe(403);
    const anon = await server.inject({ method: 'POST', url: '/api/billing/checkout', headers: { 'x-tenant-id': tenantId }, payload: { tier: 'growth' } });
    expect(anon.statusCode).toBe(401);
  });

  it('forged webhook cannot upgrade anyone; gateway metadata is ignored', async () => {
    const before = await tierNow();
    const r = await server.inject({
      method: 'POST',
      url: '/api/webhooks/billing/paystack',
      headers: { 'content-type': 'application/json', 'x-paystack-signature': 'forged' },
      body: JSON.stringify({ event: 'charge.success', data: { reference: 'x', amount: 1, status: 'success', metadata: { tenantSlug: slug, planTier: 'dedicated' } } }),
    });
    expect(r.statusCode).toBe(401);
    // correctly signed but unknown reference + malicious metadata
    const r2 = await paystackEvent('zx_not_ours', 99999999, { metadata: { tenantSlug: slug, planTier: 'dedicated' } });
    expect(r2.statusCode).toBe(200);
    expect(r2.json().outcome).toBe('unknown_reference');
    expect(await tierNow()).toBe(before);
  });

  it('underpayment is flagged and does not activate', async () => {
    const { reference, amountMinor } = (await checkout('growth')).json();
    const r = await paystackEvent(reference, amountMinor - 1);
    expect(r.json().outcome).toBe('amount_mismatch');
    expect(await tierNow()).toBe('free');
  });

  it('correct payment activates once; replays are idempotent; plan is audited', async () => {
    const { reference, amountMinor } = (await checkout('growth')).json();
    const r = await paystackEvent(reference, amountMinor);
    expect(r.json().outcome).toBe('activated');
    expect(await tierNow()).toBe('growth');

    const again = await paystackEvent(reference, amountMinor);
    expect(again.json().outcome).toBe('duplicate');

    const chain = await core.verifyAuditChain(tenantId);
    expect(chain.valid).toBe(true);
    expect(chain.total).toBeGreaterThanOrEqual(3); // checkouts + activation + mismatch
    const rows = await adminProvision(tenantId, (tx) => tx.unsafe(`SELECT action FROM audit_log WHERE tenant_id=$1 ORDER BY seq`, [tenantId] as any));
    expect(rows.map((x: any) => x.action)).toContain('billing.plan_activated');
  });

  it('a failed charge does not activate', async () => {
    const { reference, amountMinor } = (await checkout('agency')).json();
    const body = JSON.stringify({ event: 'charge.failed', data: { reference, amount: amountMinor, currency: 'NGN', status: 'failed' } });
    const sig = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');
    const r = await server.inject({ method: 'POST', url: '/api/webhooks/billing/paystack', headers: { 'content-type': 'application/json', 'x-paystack-signature': sig }, body });
    expect(r.json().outcome).toBe('ignored');
    expect(await tierNow()).toBe('growth');
  });
});

describe('Login binds users to tenants they belong to', () => {
  let server: FastifyInstance;
  let slugA: string;
  let slugB: string;
  const email = `member-${crypto.randomBytes(3).toString('hex')}@a.test`;
  const pw = 'correct-horse-battery-staple';

  beforeAll(async () => {
    server = await createServer();
    await server.ready();
    const sfx = crypto.randomBytes(3).toString('hex');
    slugA = `login-a-${sfx}`;
    slugB = `login-b-${sfx}`;
    const A = await createTenant(slugA);
    await createTenant(slugB);
    const hash = await core.hashPassword(pw);
    const u = await core.getAdminSqlClient().unsafe<{ id: string }[]>(`INSERT INTO users (email,password_hash,name) VALUES ($1,$2,'M') RETURNING id`, [email, hash] as any);
    await core.withTenantDb(A, (tx) =>
      tx.execute(core.sql`INSERT INTO memberships (tenant_id,user_id,role) VALUES (${A}::uuid, ${u[0]!.id}::uuid, 'member')`),
    );
  });
  afterAll(async () => {
    await server.close();
    await core.closeDatabaseConnection();
  });

  const login = (tenantSlug: string, password = pw, e = email) =>
    server.inject({ method: 'POST', url: '/api/auth/login', payload: { email: e, password, tenantSlug } });

  it('issues a role-bearing token for own tenant, case-insensitive email', async () => {
    const r = await login(slugA, pw, email.toUpperCase());
    expect(r.statusCode).toBe(200);
    const claims = core.verifyAuthToken(r.json().token);
    expect(claims.role).toBe('member');
    expect(claims.principalType).toBe('tenant_user');
  });

  it('refuses another tenant, wrong password and unknown user identically', async () => {
    const results = await Promise.all([login(slugB), login(slugA, 'wrong-password'), login(slugA, pw, 'nobody@a.test')]);
    for (const r of results) {
      expect(r.statusCode).toBe(401);
      expect(r.json()).toEqual({ error: 'Invalid email or password' });
    }
  });
});
