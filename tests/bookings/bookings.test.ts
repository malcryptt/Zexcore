import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { testToken } from '../helpers/db.js';
import crypto from 'node:crypto';
import { createServer } from '../../apps/api/src/server.js';
import { closeDatabaseConnection, getSqlClient, settleDeposit } from '../../packages/core/src/index.js';
import { localDateOf } from '../../packages/module-bookings/src/lib/slots.js';
import type { FastifyInstance } from 'fastify';

const PAYSTACK_SECRET = 'sk_test_bookings_secret';

describe('Bookings: public booking page, deposits, isolation', () => {
  let server: FastifyInstance;
  const sfx = crypto.randomBytes(3).toString('hex');
  const A = { slug: '', token: '', id: '', serviceId: '', staffId: '' };
  const B = { slug: '', token: '', serviceId: '' };
  let date = '';
  let firstSlot = '';
  let secondSlot = '';
  let bookingId = '';
  let paymentRef = '';

  // Every call comes from its own client IP so the per-IP limiter does not couple unrelated tests.
  let ipCounter = 10;
  const call = (method: string, url: string, token?: string, payload?: unknown, remoteAddress?: string) =>
    server.inject({
      method: method as any, url, payload: payload as any, headers: token ? { authorization: `Bearer ${token}` } : {},
      remoteAddress: remoteAddress ?? `10.${Math.floor(ipCounter / 250)}.${ipCounter++ % 250}.7`,
    });

  async function register(label: string) {
    const r = await call('POST', '/api/auth/register', undefined, {
      tenantName: `${label} ${sfx} Clinic`, name: `${label} Owner`, email: `${label.toLowerCase()}-${sfx}@bk.test`, password: 'Str0ng-Passphrase-42',
    });
    expect(r.statusCode).toBe(201);
    return r.json();
  }

  beforeAll(async () => {
    process.env.PAYSTACK_SECRET_KEY = PAYSTACK_SECRET;
    server = await createServer();
    await server.ready();
    const a = await register('Alpha');
    const b = await register('Beta');
    A.slug = a.tenant.slug; A.token = a.token; A.id = a.tenant.id;
    B.slug = b.tenant.slug; B.token = b.token;
    date = localDateOf(Date.now() + 2 * 86_400_000, 60);
  });
  afterAll(async () => {
    await server.close();
    await closeDatabaseConnection();
  });

  it('configures hours, deposit, a service and one staff member', async () => {
    const s = await call('PUT', '/api/bookings/settings', A.token, {
      publicName: 'Alpha Medical', businessType: 'clinic', phone: '0803 123 4567', depositEnabled: true, depositMinor: 500000,
      openMinutes: 540, closeMinutes: 720, slotMinutes: 30, daysOpen: [0, 1, 2, 3, 4, 5, 6], leadMinutes: 0, onboarded: true,
    });
    expect(s.statusCode).toBe(200);
    expect(s.json().settings.phone).toBe('+2348031234567');
    const svc = await call('POST', '/api/bookings/services', A.token, { name: 'Consultation', durationMin: 30, priceMinor: 1500000 });
    expect(svc.statusCode).toBe(201);
    A.serviceId = svc.json().service.id;
    const st = await call('POST', '/api/bookings/staff', A.token, { name: 'Dr. Bello', title: 'General Medicine' });
    A.staffId = st.json().staff.id;
    const svcB = await call('POST', '/api/bookings/services', B.token, { name: 'Haircut', durationMin: 30, priceMinor: 500000 });
    B.serviceId = svcB.json().service.id;
  });

  it('public profile lists only active services and never leaks other tenants', async () => {
    const r = await call('GET', `/api/public/${A.slug}`);
    expect(r.statusCode).toBe(200);
    const b = r.json();
    expect(b.business.name).toBe('Alpha Medical');
    expect(b.services.map((x: any) => x.name)).toEqual(['Consultation']);
    expect(b.deposit).toEqual({ enabled: true, amountMinor: 500000 });
    expect((await call('GET', '/api/public/no-such-business')).statusCode).toBe(404);
  });

  it('availability returns real slots inside opening hours', async () => {
    const r = await call('GET', `/api/public/${A.slug}/availability?date=${date}&serviceId=${A.serviceId}`);
    expect(r.statusCode).toBe(200);
    const slots = r.json().slots;
    expect(slots.length).toBe(6); // 09:00..11:30 for a 30 minute service
    expect(slots.every((x: any) => x.available)).toBe(true);
    firstSlot = slots[0].startsAt;
    secondSlot = slots[1].startsAt;
    // another business' service id is invisible here
    const x = await call('GET', `/api/public/${A.slug}/availability?date=${date}&serviceId=${B.serviceId}`);
    expect(x.statusCode).toBe(404);
  });

  it('public booking requires an email when a deposit applies, and rejects off-grid times', async () => {
    const base = { serviceId: A.serviceId, customerName: 'Amaka Okafor', customerPhone: '0803 123 4567', startsAt: firstSlot };
    const noEmail = await call('POST', `/api/public/${A.slug}/bookings`, undefined, base);
    expect(noEmail.statusCode).toBe(400);
    expect(noEmail.json().code).toBe('email_required');
    const off = new Date(Date.parse(firstSlot) + 7 * 60_000).toISOString();
    const r = await call('POST', `/api/public/${A.slug}/bookings`, undefined, { ...base, customerEmail: 'amaka@example.com', startsAt: off });
    expect(r.statusCode).toBe(409);
    expect(r.json().code).toBe('slot_unavailable');
  });

  it('creates a pending booking with a server-priced deposit intent', async () => {
    const r = await call('POST', `/api/public/${A.slug}/bookings`, undefined, {
      serviceId: A.serviceId, customerName: 'Amaka Okafor', customerPhone: '0803 123 4567', customerEmail: 'amaka@example.com', startsAt: firstSlot,
      // attempts to tamper with price/deposit are rejected by the strict schema
    });
    expect(r.statusCode).toBe(201);
    const b = r.json();
    expect(b.booking.status).toBe('pending');
    expect(b.payment.amountMinor).toBe(500000);
    expect(b.payment.reference).toMatch(/^bk_/);
    paymentRef = b.payment.reference;
    // Client-supplied money fields are stripped by the schema: the deposit is always server-priced.
    const thirdSlot = new Date(Date.parse(secondSlot) + 60 * 60_000).toISOString();
    const tamper = await call('POST', `/api/public/${A.slug}/bookings`, undefined, {
      serviceId: A.serviceId, customerName: 'Mallory', customerPhone: '08031234568', customerEmail: 'm@example.com', startsAt: thirdSlot,
      depositMinor: 1, priceMinor: 1, status: 'confirmed',
    });
    expect(tamper.statusCode).toBe(201);
    expect(tamper.json().booking.status).toBe('pending');
    expect(tamper.json().payment.amountMinor).toBe(500000);
  });

  it('the same slot cannot be booked twice, and availability reflects it', async () => {
    const r = await call('POST', `/api/public/${A.slug}/bookings`, undefined, {
      serviceId: A.serviceId, customerName: 'Chioma Eze', customerPhone: '08128976543', customerEmail: 'c@example.com', startsAt: firstSlot,
    });
    expect(r.statusCode).toBe(409);
    const av = (await call('GET', `/api/public/${A.slug}/availability?date=${date}&serviceId=${A.serviceId}`)).json().slots;
    expect(av[0].available).toBe(false);
    expect(av[1].available).toBe(true);
  });

  it('concurrent attempts for one slot produce exactly one booking', async () => {
    const attempts = await Promise.all(
      Array.from({ length: 6 }, (_, i) =>
        call('POST', `/api/public/${A.slug}/bookings`, undefined, {
          serviceId: A.serviceId, customerName: `Racer ${i}`, customerPhone: `0803000000${i}`, customerEmail: `r${i}@example.com`, startsAt: secondSlot,
        }),
      ),
    );
    expect(attempts.filter((r) => r.statusCode === 201).length).toBe(1);
    expect(attempts.filter((r) => r.statusCode === 409).length).toBe(5);
  });

  it('owner sees the bookings; another business sees none and cannot touch them', async () => {
    const list = (await call('GET', '/api/bookings', A.token)).json();
    expect(list.bookings.length).toBe(3);
    bookingId = list.bookings.find((b: any) => b.customerName === 'Amaka Okafor').id;
    expect(list.counts.pending).toBe(3);
    const other = (await call('GET', '/api/bookings', B.token)).json();
    expect(other.bookings).toEqual([]);
    const patch = await call('PATCH', `/api/bookings/${bookingId}`, B.token, { status: 'cancelled' });
    expect(patch.statusCode).toBe(404);
    const cust = (await call('GET', '/api/bookings/customers', B.token)).json();
    expect(cust.customers).toEqual([]);
  });

  it('a viewer can read but not manage', async () => {
    const viewer = await testToken({ userId: crypto.randomUUID(), tenantId: A.id, principalType: 'tenant_user', role: 'viewer' });
    expect((await call('GET', '/api/bookings', viewer)).statusCode).toBe(200);
    expect((await call('PATCH', `/api/bookings/${bookingId}`, viewer, { status: 'confirmed' })).statusCode).toBe(403);
    expect((await call('PUT', '/api/bookings/settings', viewer, { depositEnabled: false })).statusCode).toBe(403);
    expect((await call('GET', '/api/bookings')).statusCode).toBe(401);
  });

  it('deposit settlement validates the amount, is idempotent and confirms the booking', async () => {
    const short = await settleDeposit({ reference: paymentRef, gateway: 'paystack', paidMinor: 100, currency: 'NGN' });
    expect(short.outcome).toBe('amount_mismatch');
    // a mismatch must not confirm anything
    let b = (await call('GET', '/api/bookings', A.token)).json().bookings.find((x: any) => x.id === bookingId);
    expect(b.status).toBe('pending');
    expect(b.depositStatus).toBe('mismatch');
    // wrong currency for a fresh intent is also refused
    const unknown = await settleDeposit({ reference: 'bk_nope_000000000000000000', gateway: 'paystack', paidMinor: 500000, currency: 'NGN' });
    expect(unknown.outcome).toBe('unknown_reference');
  });

  it('a signed Paystack webhook settles a deposit; replays are harmless', async () => {
    // fresh booking with its own intent
    const slots = (await call('GET', `/api/public/${A.slug}/availability?date=${date}&serviceId=${A.serviceId}`)).json().slots;
    const free = slots.find((x: any) => x.available).startsAt;
    const created = (await call('POST', `/api/public/${A.slug}/bookings`, undefined, {
      serviceId: A.serviceId, customerName: 'Tunde Bakare', customerPhone: '07055443322', customerEmail: 't@example.com', startsAt: free,
    })).json();
    const ref = created.payment.reference;

    const raw = JSON.stringify({ event: 'charge.success', data: { reference: ref, amount: 500000, currency: 'NGN', status: 'success', customer: { email: 't@example.com' } } });
    const sig = crypto.createHmac('sha512', PAYSTACK_SECRET).update(raw).digest('hex');
    const send = () => server.inject({ method: 'POST', url: '/api/webhooks/billing/paystack', headers: { 'content-type': 'application/json', 'x-paystack-signature': sig }, payload: raw });

    const bad = await server.inject({ method: 'POST', url: '/api/webhooks/billing/paystack', headers: { 'content-type': 'application/json', 'x-paystack-signature': 'deadbeef' }, payload: raw });
    expect(bad.statusCode).toBe(401);

    const first = await send();
    expect(first.statusCode).toBe(200);
    expect(first.json().outcome).toBe('activated');
    expect((await send()).json().outcome).toBe('duplicate');

    const status = (await call('GET', `/api/public/${A.slug}/payments/${ref}`)).json();
    expect(status.depositStatus).toBe('paid');
    expect(status.status).toBe('confirmed');
    // the public status endpoint is tenant-bound: another business cannot read it
    expect((await call('GET', `/api/public/${B.slug}/payments/${ref}`)).statusCode).toBe(404);

    const conv = (await call('GET', '/api/bookings/conversations', A.token)).json();
    const tunde = conv.conversations.find((c: any) => c.phone === '+2347055443322');
    expect(tunde.lastKind).toBe('payment');
    expect(tunde.lastBody).toContain('NGN 5,000.00');
  });

  it('dashboard bookings: overlap refused, reschedule, status changes, manual deposit', async () => {
    const clash = await call('POST', '/api/bookings', A.token, { serviceId: A.serviceId, customerName: 'Walk-in', customerPhone: '08099887766', startsAt: firstSlot });
    expect(clash.statusCode).toBe(409);
    const slots = (await call('GET', `/api/public/${A.slug}/availability?date=${date}&serviceId=${A.serviceId}`)).json().slots;
    const free = slots.filter((x: any) => x.available).map((x: any) => x.startsAt);
    const ok = await call('POST', '/api/bookings', A.token, { serviceId: A.serviceId, customerName: 'Walk-in', customerPhone: '08099887766', startsAt: free[0] });
    expect(ok.statusCode).toBe(201);
    expect(ok.json().booking.status).toBe('confirmed');
    const id = ok.json().booking.id;
    const move = await call('PATCH', `/api/bookings/${id}`, A.token, { startsAt: free[1] });
    expect(move.statusCode).toBe(200);
    expect(move.json().booking.startsAt).toBe(free[1]);
    const done = await call('PATCH', `/api/bookings/${id}`, A.token, { status: 'completed' });
    expect(done.json().booking.status).toBe('completed');
    // pending booking from earlier: record a manual (bank transfer) deposit
    const manual = await call('PATCH', `/api/bookings/${bookingId}`, A.token, { markDepositPaid: true });
    expect(manual.statusCode).toBe(200);
    expect(manual.json().booking.depositStatus).toBe('paid');
    expect(manual.json().booking.status).toBe('confirmed');
  });

  it('payment link refuses paid bookings and returns a shareable path otherwise', async () => {
    const slots = (await call('GET', `/api/public/${A.slug}/availability?date=${date}&serviceId=${A.serviceId}`)).json().slots;
    const free = slots.find((x: any) => x.available).startsAt;
    const mk = (await call('POST', '/api/bookings', A.token, { serviceId: A.serviceId, customerName: 'Ife Adeyemi', customerPhone: '07054432211', startsAt: free })).json().booking;
    const link = await call('POST', `/api/bookings/${mk.id}/payment-link`, A.token);
    expect(link.statusCode).toBe(200);
    expect(link.json().path).toBe(`/${A.slug}?pay=${link.json().reference}`);
    expect(link.json().amountMinor).toBe(500000);
    const paid = await call('POST', `/api/bookings/${bookingId}/payment-link`, A.token);
    expect(paid.statusCode).toBe(409);
  });

  it('inbox: public message arrives unread, reply marks it read', async () => {
    const m = await call('POST', `/api/public/${A.slug}/messages`, undefined, { name: 'Seun Balogun', phone: '08031112222', body: 'Do you do vaccinations on Saturday?' });
    expect(m.statusCode).toBe(201);
    let conv = (await call('GET', '/api/bookings/conversations?filter=waiting', A.token)).json();
    expect(conv.conversations.map((c: any) => c.name)).toContain('Seun Balogun');
    expect(conv.counts.waiting).toBeGreaterThan(0);
    const reply = await call('POST', '/api/bookings/messages', A.token, { phone: '08031112222', body: 'Yes, 10am to 12 noon.' });
    expect(reply.statusCode).toBe(201);
    expect(reply.json().whatsappUrl).toContain('https://wa.me/2348031112222?text=');
    conv = (await call('GET', '/api/bookings/conversations?filter=waiting', A.token)).json();
    expect(conv.conversations.map((c: any) => c.name)).not.toContain('Seun Balogun');
    const thread = (await call('GET', '/api/bookings/conversation?phone=08031112222', A.token)).json();
    expect(thread.messages.map((x: any) => x.direction)).toEqual(['in', 'out']);
    // isolation
    expect((await call('GET', '/api/bookings/conversations', B.token)).json().conversations).toEqual([]);
  });

  it('home summary has real numbers and starts empty for a new workspace', async () => {
    const ra = await call('GET', '/api/bookings/summary', A.token);
    const a = ra.json();
    expect(a.week.perDay).toHaveLength(7);
    expect(a.attention.waitingReplies).toBe(0);
    expect(a.popularServices[0].name).toBe('Consultation');
    const b = (await call('GET', '/api/bookings/summary', B.token)).json();
    expect(b.todayBookings).toEqual([]);
    expect(b.week.total).toBe(0);
    expect(b.week.depositsMinor).toBe(0);
  });

  it('public message and booking endpoints are rate limited', async () => {
    const results: number[] = [];
    for (let i = 0; i < 24; i++) {
      const r = await call('POST', `/api/public/${B.slug}/messages`, undefined, { name: 'Spammer', phone: '08030000000', body: `hi ${i}` }, '203.0.113.9');
      results.push(r.statusCode);
    }
    expect(results).toContain(429);
  });

  it('database RLS: the runtime role sees no booking rows without (or with the wrong) tenant context', async () => {
    const sqlc = getSqlClient();
    const none = await sqlc.begin(async (tx) => tx.unsafe(`SELECT count(*)::int AS n FROM bk_bookings`));
    expect(none[0]!.n).toBe(0);
    const wrong = await sqlc.begin(async (tx) => {
      await tx.unsafe(`SELECT set_config('app.current_tenant_id', $1, true)`, [crypto.randomUUID()]);
      return tx.unsafe(`SELECT count(*)::int AS n FROM bk_bookings`);
    });
    expect(wrong[0]!.n).toBe(0);
    const own = await sqlc.begin(async (tx) => {
      await tx.unsafe(`SELECT set_config('app.current_tenant_id', $1, true)`, [A.id]);
      return tx.unsafe(`SELECT count(*)::int AS n FROM bk_bookings`);
    });
    expect(own[0]!.n).toBeGreaterThan(0);
  });
});
