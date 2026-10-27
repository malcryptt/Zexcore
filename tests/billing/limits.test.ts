import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'node:crypto';
import { createServer } from '../../apps/api/src/server.js';
import { closeDatabaseConnection, getAdminSqlClient, PLAN_LIMITS, effectiveTier } from '../../packages/core/src/index.js';
import type { FastifyInstance } from 'fastify';

describe('effectiveTier', () => {
  const now = new Date('2026-11-10T00:00:00Z');
  it('keeps a live paid plan, grants 3 days of grace, then falls back to free', () => {
    expect(effectiveTier('growth', '2026-11-20T00:00:00Z', now)).toBe('growth');
    expect(effectiveTier('growth', '2026-11-08T00:00:00Z', now)).toBe('growth'); // 2 days lapsed
    expect(effectiveTier('growth', '2026-11-01T00:00:00Z', now)).toBe('free');
    expect(effectiveTier('growth', null, now)).toBe('growth');
    expect(effectiveTier('free', null, now)).toBe('free');
  });
  it('treats unknown tiers as free (fail safe)', () => {
    expect(effectiveTier('platinum-made-up', null, now)).toBe('free');
  });
});

describe('Plan limits are enforced by the server', () => {
  let server: FastifyInstance;
  let token: string, tenantId: string, slug: string;
  let n = 1;
  const call = (method: string, url: string, payload?: unknown, tk: string | null = token) =>
    server.inject({ method: method as any, url, payload: payload as any, headers: tk ? { authorization: `Bearer ${tk}` } : {}, remoteAddress: `10.30.${Math.floor(n / 250)}.${(n++ % 250) + 1}` });
  const setTier = async (tier: string, expires: string | null = null) => {
    await getAdminSqlClient().unsafe(`UPDATE tenants SET tier = $1, plan_expires_at = $2 WHERE id = $3::uuid`, [tier, expires, tenantId] as any);
  };

  beforeAll(async () => {
    server = await createServer();
    await server.ready();
    const sfx = crypto.randomBytes(3).toString('hex');
    slug = `lim-${sfx}`;
    const r = await call('POST', '/api/auth/register', { tenantName: `Limits ${sfx}`, tenantSlug: slug, name: 'Lim Its', email: `lim-${sfx}@limits.test`, password: 'Correct-Horse-Battery-9' }, null);
    token = r.json().token; tenantId = r.json().tenant.id;
  });
  afterAll(async () => { await server.close(); await closeDatabaseConnection(); });

  it('free plan: services stop at the limit with a clear, upgradeable error', async () => {
    const max = PLAN_LIMITS.free!.services!;
    for (let i = 0; i < max; i++) expect((await call('POST', '/api/bookings/services', { name: `Svc ${i}`, durationMin: 30, priceMinor: 100000 })).statusCode).toBe(201);
    const over = await call('POST', '/api/bookings/services', { name: 'One too many', durationMin: 30, priceMinor: 100000 });
    expect(over.statusCode).toBe(402);
    expect(over.json()).toMatchObject({ code: 'plan_limit', key: 'services', limit: max, used: max, tier: 'free' });
    expect(over.json().error).toMatch(/Upgrade/);
  });

  it('free plan: team and devices have their own limits', async () => {
    expect((await call('POST', '/api/bookings/staff', { name: 'First' })).statusCode).toBe(201);
    expect((await call('POST', '/api/bookings/staff', { name: 'Second' })).statusCode).toBe(402);
    expect((await call('POST', '/api/iot/devices', { deviceKey: 'dev-one', name: 'One', kind: 'sensor' })).statusCode).toBe(201);
    expect((await call('POST', '/api/iot/devices', { deviceKey: 'dev-two', name: 'Two', kind: 'sensor' })).statusCode).toBe(402);
  });

  it('usage endpoint reports what is used against what is allowed', async () => {
    const u = (await call('GET', '/api/billing/usage')).json();
    expect(u.effectiveTier).toBe('free');
    expect(u.usage.services).toEqual({ used: PLAN_LIMITS.free!.services, limit: PLAN_LIMITS.free!.services });
    expect(u.usage.devices).toEqual({ used: 1, limit: 1 });
  });

  it('upgrading lifts the limit immediately; a lapsed plan falls back after the grace period', async () => {
    await setTier('growth', new Date(Date.now() + 30 * 86_400_000).toISOString());
    expect((await call('POST', '/api/bookings/services', { name: 'Fits now', durationMin: 30, priceMinor: 100000 })).statusCode).toBe(201);
    await setTier('growth', new Date(Date.now() - 10 * 86_400_000).toISOString());
    expect((await call('POST', '/api/bookings/services', { name: 'Lapsed', durationMin: 30, priceMinor: 100000 })).statusCode).toBe(402);
    await setTier('enterprise');
    expect((await call('POST', '/api/bookings/services', { name: 'Unlimited', durationMin: 30, priceMinor: 100000 })).statusCode).toBe(201);
    await setTier('free');
  });

  it('monthly booking cap: the owner sees the plan reason, customers get a neutral message', async () => {
    const saved = PLAN_LIMITS.free!.bookingsPerMonth;
    PLAN_LIMITS.free!.bookingsPerMonth = 1;
    try {
      await call('PUT', '/api/bookings/settings', { publicName: 'Limits Co', onboarded: true, businessType: 'clinic', phone: '08031234567', address: 'Lagos', depositEnabled: false, depositMinor: 0, openMinutes: 540, closeMinutes: 1020, daysOpen: [0, 1, 2, 3, 4, 5, 6], leadMinutes: 0 });
      const svc = (await call('GET', '/api/bookings/services')).json().services[0].id as string;
      const day = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString().slice(0, 10);
      const slots = (await call('GET', `/api/public/${slug}/availability?date=${day(1)}&serviceId=${svc}`, undefined, null)).json().slots.filter((s: any) => s.available).map((s: any) => s.startsAt);

      const first = await call('POST', '/api/bookings', { serviceId: svc, customerName: 'A One', customerPhone: '08031112222', startsAt: slots[0] });
      expect(first.statusCode).toBe(201);
      const second = await call('POST', '/api/bookings', { serviceId: svc, customerName: 'B Two', customerPhone: '08033334444', startsAt: slots[2] });
      expect(second.statusCode).toBe(402);
      expect(second.json().error).toMatch(/Upgrade/);

      const pub = await call('POST', `/api/public/${slug}/bookings`, { serviceId: svc, customerName: 'C Three', customerPhone: '08035556666', startsAt: slots[4] }, null);
      expect(pub.statusCode).toBe(409);
      expect(pub.json().error).not.toMatch(/plan|upgrade/i);
    } finally {
      PLAN_LIMITS.free!.bookingsPerMonth = saved;
    }
  });
});
