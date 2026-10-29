// End-to-end: the real dashboard data layer (apps/dashboard/src/lib/fb) against the real security rules, in the emulators.
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'demo-zexcore');
vi.stubEnv('VITE_FIREBASE_API_KEY', 'demo-key');
vi.stubEnv('VITE_FIREBASE_APP_ID', '1:1:web:demo');

type Mod<T> = T extends Promise<infer U> ? U : never;
let auth: Mod<ReturnType<typeof loadAuth>>, cat: Mod<ReturnType<typeof loadCat>>, bk: Mod<ReturnType<typeof loadBk>>;
let pub: Mod<ReturnType<typeof loadPub>>, crm: Mod<ReturnType<typeof loadCrm>>, core: Mod<ReturnType<typeof loadCore>>, bill: Mod<ReturnType<typeof loadBill>>;
const loadAuth = () => import('../../apps/dashboard/src/lib/fb/auth');
const loadCat = () => import('../../apps/dashboard/src/lib/fb/catalog');
const loadBk = () => import('../../apps/dashboard/src/lib/fb/bookings');
const loadPub = () => import('../../apps/dashboard/src/lib/fb/public');
const loadCrm = () => import('../../apps/dashboard/src/lib/fb/crm');
const loadCore = () => import('../../apps/dashboard/src/lib/fb/core');
const loadBill = () => import('../../apps/dashboard/src/lib/fb/billing');

const email = `sade${Date.now()}@example.com`;
const PASSWORD = 'correct horse battery';
let slug = '';

/** Next open weekday (not Sunday) at least two days out, as YYYY-MM-DD in Lagos time. */
function openDate(plusDays = 2): string {
  for (let i = plusDays; i < plusDays + 8; i++) {
    const d = new Date(Date.now() + i * 86_400_000 + 3_600_000);
    if (d.getUTCDay() !== 0) return d.toISOString().slice(0, 10);
  }
  throw new Error('no open day');
}
const code = async (p: Promise<unknown>): Promise<string | number | undefined> => { try { await p; return undefined; } catch (e: any) { return e.code ?? e.status; } };

beforeAll(async () => {
  const fbm = await import('../../apps/dashboard/src/lib/fb/firebase');
  fbm.useEmulators();
  [auth, cat, bk, pub, crm, core, bill] = await Promise.all([loadAuth(), loadCat(), loadBk(), loadPub(), loadCrm(), loadCore(), loadBill()]);
});

describe('dashboard on Firebase, end to end', () => {
  it('signs a business up and creates its workspace, owner row, slug and first calendar', async () => {
    await auth.register({ tenantName: 'Sade Salon', name: 'Sade Ade', email, password: PASSWORD });
    const me: any = await auth.me();
    slug = me.tenant.slug;
    expect(slug).toBe('sade-salon');
    expect(me.role).toBe('owner');
    expect(me.tenant.tier).toBe('free');
    const staff = await cat.listStaff(await core.loadCtx());
    expect(staff).toHaveLength(1);
    expect(staff[0]!.auto).toBe(true);
  });

  it('refuses a second business with a taken slug name by picking a different address', async () => {
    const before = slug;
    await auth.logout();
    await auth.register({ tenantName: 'Sade Salon', name: 'Other Owner', email: `other${Date.now()}@example.com`, password: PASSWORD });
    const me: any = await auth.me();
    expect(me.tenant.slug).not.toBe(before);
    await auth.logout();
    await auth.login(email, PASSWORD);
  });

  it('rejects a wrong password with a plain message', async () => {
    await auth.logout();
    await expect(auth.login(email, 'wrong-password-123')).rejects.toMatchObject({ message: 'Incorrect email or password.' });
    await auth.login(email, PASSWORD);
  });

  it('saves settings and enforces the free plan limit of 3 services', async () => {
    await cat.putSettings({ onboarded: true, publicName: 'Sade Salon', phone: '08031234567', daysOpen: [1, 2, 3, 4, 5, 6] });
    for (const n of ['Braids', 'Wash', 'Trim']) await cat.createService({ name: n, durationMin: 60, priceMinor: 1_500_000 });
    await expect(cat.createService({ name: 'Fourth', durationMin: 30, priceMinor: 0 })).rejects.toMatchObject({ status: 402, code: 'plan_limit' });
    await expect(cat.createService({ name: 'Bad length', durationMin: 25, priceMinor: 0 })).rejects.toMatchObject({ status: 400 });
    await expect(cat.putSettings({ depositEnabled: true })).rejects.toMatchObject({ code: 'unavailable' });
  });

  it('hands the starter calendar to the first real team member on the free plan', async () => {
    await cat.createStaff({ name: 'Ngozi', title: 'Stylist' });
    const staff = await cat.listStaff(await core.loadCtx());
    expect(staff.map((s) => s.name)).toEqual(['Ngozi']);
    await expect(cat.createStaff({ name: 'Second person' })).rejects.toMatchObject({ code: 'plan_limit' });
  });

  it('shows the public booking page to a signed-out visitor', async () => {
    await auth.logout();
    const p: any = await pub.profile(slug);
    expect(p.business.name).toBe('Sade Salon');
    expect(p.services).toHaveLength(3);
    expect(p.staff).toHaveLength(1);
  });

  let slot = '';
  let serviceId = '';
  it('lists open times, books one as a signed-out visitor, and then shows it as taken', async () => {
    const p: any = await pub.profile(slug);
    serviceId = p.services[0].id;
    const date = openDate();
    const before = await pub.slots(slug, new URLSearchParams({ date, serviceId }));
    expect(before.slots.length).toBeGreaterThan(4);
    expect(before.slots.every((s) => s.available)).toBe(true);
    slot = before.slots[2]!.startsAt;
    const r: any = await pub.book(slug, { serviceId, staffId: null, customerName: 'Chidi Okeke', customerPhone: '0803 123 4567', customerEmail: null, startsAt: slot });
    expect(r.booking.ref).toMatch(/^ZX-\d{6}-\d+$/);
    expect(r.booking.status).toBe('pending');
    const after = await pub.slots(slug, new URLSearchParams({ date, serviceId }));
    expect(after.slots.find((s) => s.startsAt === slot)!.available).toBe(false);
    expect(after.slots.filter((s) => !s.available).length).toBe(2); // a 60-minute service on 30-minute slots blocks two start times
  });

  it('refuses to double-book the same time', async () => {
    await expect(pub.book(slug, { serviceId, staffId: null, customerName: 'Another Person', customerPhone: '08039999999', startsAt: slot })).rejects.toMatchObject({ status: 409 });
  });

  it('refuses a booking that overlaps one cell', async () => {
    const overlapping = new Date(new Date(slot).getTime() + 30 * 60_000).toISOString();
    await expect(pub.book(slug, { serviceId, staffId: null, customerName: 'Another Person', customerPhone: '08039999999', startsAt: overlapping })).rejects.toMatchObject({ status: 409 });
  });

  it('refuses a booking with a bad phone number or in the past', async () => {
    const free = new Date(new Date(slot).getTime() + 4 * 3_600_000).toISOString();
    await expect(pub.book(slug, { serviceId, customerName: 'Chidi Okeke', customerPhone: '123', startsAt: free })).rejects.toMatchObject({ status: 400 });
    await expect(pub.book(slug, { serviceId, customerName: 'Chidi Okeke', customerPhone: '08031234567', startsAt: new Date(Date.now() - 3_600_000).toISOString() })).rejects.toMatchObject({ status: 409 });
  });

  it('lets the owner see, confirm, move and cancel bookings', async () => {
    await auth.login(email, PASSWORD);
    const list = await bk.listBookings(new URLSearchParams());
    expect(list.bookings).toHaveLength(1);
    const b = list.bookings[0]!;
    expect(b.customerName).toBe('Chidi Okeke');
    expect(b.customerPhone).toBe('+2348031234567');
    expect(b.staffName).toBe('Ngozi');
    expect(list.counts.pending).toBe(1);

    await bk.patchBooking(b.id, { status: 'confirmed' });
    expect((await bk.listBookings(new URLSearchParams())).bookings[0]!.status).toBe('confirmed');

    // move it two hours later, which keeps no cell in common with the old time
    const later = new Date(new Date(b.startsAt).getTime() + 2 * 3_600_000).toISOString();
    const moved = await bk.patchBooking(b.id, { startsAt: later });
    const afterMove = (await bk.listBookings(new URLSearchParams())).bookings;
    expect(afterMove).toHaveLength(1);
    expect(afterMove[0]!.id).toBe(moved.id);
    expect(afterMove[0]!.startsAt).toBe(later);

    // the old time is free again; the new one is taken
    await auth.logout();
    const date = openDate();
    const s = await pub.slots(slug, new URLSearchParams({ date, serviceId }));
    expect(s.slots.find((x) => x.startsAt === slot)!.available).toBe(true);
    expect(s.slots.find((x) => x.startsAt === later)!.available).toBe(false);

    await auth.login(email, PASSWORD);
    await bk.patchBooking(moved.id, { status: 'cancelled' });
    await auth.logout();
    const s2 = await pub.slots(slug, new URLSearchParams({ date, serviceId }));
    expect(s2.slots.every((x) => x.available)).toBe(true);
    await auth.login(email, PASSWORD);
  });

  it('creates a booking from the dashboard and lists customers and the home summary', async () => {
    const date = openDate(3);
    const { slots } = await pub.slots(slug, new URLSearchParams({ date, serviceId }));
    const r = await bk.staffCreate({ serviceId, staffId: null, customerName: 'Ada Eze', customerPhone: '08051112222', startsAt: slots[1]!.startsAt, notes: 'First visit' });
    expect(r.booking.status).toBe('confirmed');
    expect(r.booking.notes).toBe('First visit');
    const c = await bk.customers(new URLSearchParams());
    expect(c.customers.map((x: any) => x.name)).toContain('Ada Eze');
    const s: any = await bk.summary();
    expect(s.setup).toMatchObject({ onboarded: true, services: 3, staff: 1 });
    expect(s.week.perDay).toHaveLength(7);
  });

  it('stops the 31st booking of the month on the free plan', async () => {
    // 1 already exists this month; fill the rest of the allowance, then expect the limit message
    const ctx = await core.loadCtx();
    let made = 0;
    for (let d = 4; d < 40 && made < 40; d++) {
      const date = openDate(d);
      const { slots } = await pub.slots(slug, new URLSearchParams({ date, serviceId }));
      for (const sl of slots.filter((x) => x.available).filter((_, i) => i % 2 === 0)) {
        const err = await code(bk.staffCreate({ serviceId, customerName: `Client ${made}`, customerPhone: `0805000${String(made).padStart(4, '0')}`, startsAt: sl.startsAt }));
        if (err) { expect(err).toBe('plan_limit'); expect(ctx.tier).toBe('free'); return; }
        made++;
      }
    }
    throw new Error('the monthly limit never applied');
  }, 120_000);

  it('manages CRM contacts, stages, leads and website pages', async () => {
    await crm.createStage({ name: 'New', position: 1, isDefault: true });
    await crm.createStage({ name: 'Proposal', position: 2 });
    const stages: any = await crm.listStages();
    expect(stages.stages.map((s: any) => s.name)).toEqual(['New', 'Proposal']);
    const { id: contactId } = await crm.createContact({ type: 'person', firstName: 'Tunde', lastName: 'Bello', email: 'tunde@example.com' });
    await expect(crm.createContact({ type: 'person' })).rejects.toMatchObject({ status: 400 });
    const { id: leadId } = await crm.createLead({ title: 'Wedding party', contactId, stageId: stages.stages[0].id, value: 5_000_000 });
    await crm.moveLead(leadId, { stageId: stages.stages[1].id });
    let leads: any = await crm.listLeads(new URLSearchParams('closed=false'));
    expect(leads.leads[0]).toMatchObject({ title: 'Wedding party', stage_id: stages.stages[1].id, first_name: 'Tunde' });
    await crm.closeLead(leadId, { reason: 'won' });
    leads = await crm.listLeads(new URLSearchParams('closed=false'));
    expect(leads.leads).toHaveLength(0);

    const { id: pageId } = await crm.createPage({ title: 'About us', slug: 'about-us', content: { body: 'Hello' } });
    await expect(crm.createPage({ title: 'Dup', slug: 'about-us' })).rejects.toMatchObject({ status: 409 });
    await crm.publishPage(pageId);
    const pages: any = await crm.listPages();
    expect(pages.pages[0]).toMatchObject({ slug: 'about-us', status: 'published' });
  });

  it('reports plan usage, plans and the audit trail; payments are read-only', async () => {
    const u: any = await bill.usage();
    expect(u.effectiveTier).toBe('free');
    expect(u.usage.services).toEqual({ used: 3, limit: 3 });
    expect((bill.plans() as any).plans.map((p: any) => p.tier)).toContain('growth');
    const a = await bill.auditLog();
    expect(a.entries.length).toBeGreaterThan(5);
    expect((await bill.payments()).payments).toEqual([]);
  });

  it('cannot change its own plan from the browser', async () => {
    const { updateDoc } = await import('firebase/firestore');
    const ctx = await core.loadCtx();
    expect(await code(updateDoc(core.wsDoc(ctx), { plan: 'enterprise' }))).toBe('permission-denied');
  });
});
