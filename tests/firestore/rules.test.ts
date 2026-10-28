import { describe, it, beforeAll, beforeEach, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, getDocs, collection, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';

let env: RulesTestEnvironment;
const W = 'ws1';
const SLUG = 'sade-salon';

const owner = () => env.authenticatedContext('owner1').firestore();
const other = () => env.authenticatedContext('stranger').firestore();
const anon = () => env.unauthenticatedContext().firestore();

/** What the dashboard does on sign-up: workspace + founding owner + slug claim, in one batch. */
async function createWorkspace(db: any, wid = W, slug = SLUG, extra: Record<string, unknown> = {}) {
  const b = writeBatch(db);
  b.set(doc(db, 'workspaces', wid), { name: 'Sade Salon', slug, ownerUid: 'owner1', plan: 'free', createdAt: serverTimestamp(), ...extra });
  b.set(doc(db, 'workspaces', wid, 'members', 'owner1'), { role: 'owner', name: 'Sade', email: 'sade@example.com', createdAt: serverTimestamp() });
  b.set(doc(db, 'slugs', slug), { wid, ownerUid: 'owner1', name: 'Sade Salon', timezone: 'Africa/Lagos', currency: 'NGN', bookingEnabled: true });
  await b.commit();
}
/** Bypasses rules to stage state, like the payment Worker (service account) would. */
async function seed(fn: (db: any) => Promise<void>) { await env.withSecurityRulesDisabled(async (c) => fn(c.firestore())); }
const setPlan = (plan: string, planExpiresAt?: Date) =>
  seed(async (db) => { await setDoc(doc(db, 'workspaces', W), { plan, ...(planExpiresAt ? { planExpiresAt: Timestamp.fromDate(planExpiresAt) } : {}) }, { merge: true }); });

const svc = (extra = {}) => ({ name: 'Braids', durationMin: 60, priceMinor: 1500000, active: true, ...extra });

beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-zexcore', firestore: { rules: readFileSync('firestore.rules', 'utf8') } });
});
afterAll(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

describe('workspace creation and plan fields', () => {
  it('lets a signed-in user create a free workspace with its owner row and slug', async () => {
    await assertSucceeds(createWorkspace(owner()));
  });
  it('refuses a workspace that starts on a paid plan', async () => {
    await assertFails(createWorkspace(owner(), W, SLUG, { plan: 'enterprise' }));
  });
  it('refuses a workspace that pre-sets an expiry or someone else as owner', async () => {
    await assertFails(createWorkspace(owner(), W, SLUG, { planExpiresAt: Timestamp.fromDate(new Date('2099-01-01')) }));
    await assertFails(createWorkspace(owner(), W, SLUG, { ownerUid: 'stranger' }));
  });
  it('refuses reserved and already-taken slugs', async () => {
    await assertFails(createWorkspace(owner(), W, 'admin'));
    await assertSucceeds(createWorkspace(owner()));
    await assertFails(createWorkspace(env.authenticatedContext('owner1').firestore(), 'ws2', SLUG));
  });
  it('refuses unauthenticated creation', async () => {
    await assertFails(createWorkspace(anon()));
  });
  it('lets the owner rename but never change plan, owner or slug', async () => {
    await createWorkspace(owner());
    await assertSucceeds(updateDoc(doc(owner(), 'workspaces', W), { name: 'Sade Beauty' }));
    await assertFails(updateDoc(doc(owner(), 'workspaces', W), { plan: 'agency' }));
    await assertFails(updateDoc(doc(owner(), 'workspaces', W), { planExpiresAt: Timestamp.fromDate(new Date('2099-01-01')) }));
    await assertFails(updateDoc(doc(owner(), 'workspaces', W), { ownerUid: 'stranger' }));
    await assertFails(deleteDoc(doc(owner(), 'workspaces', W)));
  });
  it('does not let someone join an existing workspace as a member', async () => {
    await createWorkspace(owner());
    await assertFails(setDoc(doc(other(), 'workspaces', W, 'members', 'stranger'), { role: 'owner' }));
    await assertFails(setDoc(doc(other(), 'workspaces', W, 'members', 'stranger'), { role: 'staff' }));
  });
});

describe('tenant isolation', () => {
  beforeEach(async () => {
    await createWorkspace(owner());
    await seed(async (db) => {
      await setDoc(doc(db, 'workspaces', W, 'contacts', 'c_0'), { name: 'Ada', phone: '+2348031234567' });
      await setDoc(doc(db, 'workspaces', W, 'bookings', '202001_0'), { customerName: 'Ada' });
    });
  });
  it('lets only members read private data', async () => {
    await assertSucceeds(getDoc(doc(owner(), 'workspaces', W, 'contacts', 'c_0')));
    await assertFails(getDoc(doc(other(), 'workspaces', W, 'contacts', 'c_0')));
    await assertFails(getDoc(doc(anon(), 'workspaces', W, 'contacts', 'c_0')));
    await assertFails(getDoc(doc(other(), 'workspaces', W)));
    await assertFails(getDocs(collection(other(), 'workspaces', W, 'bookings')));
    await assertFails(getDocs(collection(anon(), 'workspaces')));
  });
  it('blocks outsiders from writing', async () => {
    await assertFails(setDoc(doc(other(), 'workspaces', W, 'contacts', 'c_1'), { name: 'x' }));
    await assertFails(updateDoc(doc(other(), 'workspaces', W, 'contacts', 'c_0'), { name: 'hacked' }));
    await assertFails(deleteDoc(doc(other(), 'workspaces', W, 'bookings', '202001_0')));
  });
  it('keeps the audit log append-only and admin-readable', async () => {
    await assertSucceeds(setDoc(doc(owner(), 'workspaces', W, 'audit', 'a1'), { actor: 'owner1', action: 'x', at: serverTimestamp() }));
    await assertFails(setDoc(doc(owner(), 'workspaces', W, 'audit', 'a2'), { actor: 'someone-else', action: 'x', at: serverTimestamp() }));
    await assertFails(updateDoc(doc(owner(), 'workspaces', W, 'audit', 'a1'), { action: 'edited' }));
    await assertFails(deleteDoc(doc(owner(), 'workspaces', W, 'audit', 'a1')));
    await assertFails(getDoc(doc(other(), 'workspaces', W, 'audit', 'a1')));
  });
});

describe('plan limits (enforced by numbered slots)', () => {
  beforeEach(async () => { await createWorkspace(owner()); });
  const put = (db: any, kind: string, n: number, body: object) => setDoc(doc(db, 'workspaces', W, kind === 's' ? 'services' : kind === 'p' ? 'staff' : kind === 'c' ? 'contacts' : 'pages', `${kind}_${n}`), body);

  it('free plan: 3 services, the 4th is refused', async () => {
    for (const n of [0, 1, 2]) await assertSucceeds(put(owner(), 's', n, svc()));
    await assertFails(put(owner(), 's', 3, svc()));
  });
  it('free plan: 1 staff, 50 contacts, 3 pages', async () => {
    await assertSucceeds(put(owner(), 'p', 0, { name: 'Sade' }));
    await assertFails(put(owner(), 'p', 1, { name: 'Tolu' }));
    await assertSucceeds(put(owner(), 'c', 49, { name: 'x' }));
    await assertFails(put(owner(), 'c', 50, { name: 'x' }));
    await assertSucceeds(put(owner(), 'g', 2, { title: 'Home', published: false }));
    await assertFails(put(owner(), 'g', 3, { title: 'Four', published: false }));
  });
  it('a paid plan raises the limit; it drops back to free three days after expiry', async () => {
    await setPlan('growth', new Date(Date.now() + 86400000));
    await assertSucceeds(put(owner(), 's', 29, svc()));
    await assertFails(put(owner(), 's', 30, svc()));
    await setPlan('growth', new Date(Date.now() - 2 * 86400000)); // inside the grace window
    await assertSucceeds(put(owner(), 's', 29, svc({ name: 'Locs' })));
    await setPlan('growth', new Date(Date.now() - 4 * 86400000)); // past grace
    await assertFails(put(owner(), 's', 10, svc()));
    await assertSucceeds(put(owner(), 's', 1, svc()));
  });
  it('rejects malformed slot ids so limits cannot be dodged', async () => {
    await assertFails(setDoc(doc(owner(), 'workspaces', W, 'services', 'extra-service'), svc()));
    await assertFails(setDoc(doc(owner(), 'workspaces', W, 'services', 's_99999'), svc()));
    await assertFails(setDoc(doc(owner(), 'workspaces', W, 'services', 'p_0'), svc()));
  });
  it('only admins manage services; the public may read them', async () => {
    await assertSucceeds(put(owner(), 's', 0, svc()));
    await assertSucceeds(getDoc(doc(anon(), 'workspaces', W, 'services', 's_0')));
    await assertFails(put(other(), 's', 1, svc()));
    await assertFails(put(anon(), 's', 1, svc()));
  });
});

describe('public booking', () => {
  const CELL = 900000;
  const start = () => { const d = new Date(Date.now() + 3 * 86400000); d.setUTCMinutes(0, 0, 0); return d; };
  const month = () => { const d = new Date(); return `${d.getUTCFullYear() * 100 + d.getUTCMonth() + 1}`; };
  const cellsFor = (s: Date, n: number) => Array.from({ length: n }, (_, i) => s.getTime() / CELL + i);

  beforeEach(async () => {
    await createWorkspace(owner());
    await seed(async (db) => {
      await setDoc(doc(db, 'workspaces', W, 'services', 's_0'), svc());
      await setDoc(doc(db, 'workspaces', W, 'staff', 'p_0'), { name: 'Sade' });
    });
  });

  /** What the public page does: one atomic batch = the booking plus a lock for every 15-minute cell. */
  async function book(db: any, n = 0, over: Record<string, unknown> = {}, lockCells?: number[], staffId = 'p_0') {
    const s = (over.startsAtDate as Date) ?? start();
    const cells = (over.cells as number[]) ?? cellsFor(s, 4);
    const id = `${month()}_${n}`;
    const b = writeBatch(db);
    b.set(doc(db, 'workspaces', W, 'bookings', id), {
      serviceId: 's_0', staffId, customerName: 'Chidi Okeke', customerPhone: '+2348031234567', customerEmail: 'c@example.com',
      startsAt: Timestamp.fromDate(s), endsAt: Timestamp.fromMillis(s.getTime() + 3600000), cells,
      status: 'pending', source: 'public', createdAt: serverTimestamp(), ...Object.fromEntries(Object.entries(over).filter(([k]) => k !== 'startsAtDate')),
    });
    for (const c of lockCells ?? cells) b.set(doc(db, 'workspaces', W, 'locks', `${staffId}_${c}`), { bookingId: id, createdAt: serverTimestamp() });
    await b.commit();
  }

  it('lets an anonymous visitor book a free slot', async () => { await assertSucceeds(book(anon())); });
  it('refuses a second booking of the same time (no double booking)', async () => {
    await assertSucceeds(book(anon(), 0));
    await assertFails(book(anon(), 1));
  });
  it('refuses an overlapping booking that shares just one cell', async () => {
    const s = start();
    await assertSucceeds(book(anon(), 0, { startsAtDate: s }));
    const later = new Date(s.getTime() + 45 * 60000);
    await assertFails(book(anon(), 1, { startsAtDate: later, cells: cellsFor(later, 4) }));
  });
  it('allows back-to-back bookings', async () => {
    const s = start();
    await assertSucceeds(book(anon(), 0, { startsAtDate: s }));
    const next = new Date(s.getTime() + 3600000);
    await assertSucceeds(book(anon(), 1, { startsAtDate: next, cells: cellsFor(next, 4) }));
  });
  it('refuses a booking that skips some of its cells', async () => {
    const c = cellsFor(start(), 4);
    await assertFails(book(anon(), 0, {}, [c[0]!, c[1]!]));
  });
  it('refuses forged status, source, past dates, bad phones and unknown services', async () => {
    await assertFails(book(anon(), 0, { status: 'confirmed' }));
    await assertFails(book(anon(), 0, { source: 'dashboard' }));
    const past = new Date(Date.now() - 86400000); past.setUTCMinutes(0, 0, 0);
    await assertFails(book(anon(), 0, { startsAtDate: past, cells: cellsFor(past, 4) }));
    await assertFails(book(anon(), 0, { customerPhone: '08031234567' }));
    await assertFails(book(anon(), 0, { serviceId: 's_9' }));
    await assertFails(book(anon(), 0, { paymentStatus: 'paid' }));
  });
  it('refuses a wrong duration or mismatched cells', async () => {
    const s = start();
    await assertFails(book(anon(), 0, { endsAt: Timestamp.fromMillis(s.getTime() + 600000) }));
    await assertFails(book(anon(), 0, { cells: cellsFor(s, 3) }));
  });
  it('cannot read or edit bookings, and cannot plant locks on someone else’s booking', async () => {
    await assertSucceeds(book(anon(), 0));
    await assertFails(getDoc(doc(anon(), 'workspaces', W, 'bookings', `${month()}_0`)));
    await assertFails(getDocs(collection(anon(), 'workspaces', W, 'bookings')));
    await assertFails(updateDoc(doc(anon(), 'workspaces', W, 'bookings', `${month()}_0`), { status: 'cancelled' }));
    await assertFails(setDoc(doc(anon(), 'workspaces', W, 'locks', 'p_0_1'), { bookingId: `${month()}_0`, createdAt: serverTimestamp() }));
  });
  it('stops at the plan’s monthly booking limit', async () => {
    await assertSucceeds(book(anon(), 29, { startsAtDate: new Date(start().getTime() + 86400000 * 5) , cells: cellsFor(new Date(start().getTime() + 86400000 * 5), 4) }));
    await assertFails(book(anon(), 30, { startsAtDate: new Date(start().getTime() + 86400000 * 6), cells: cellsFor(new Date(start().getTime() + 86400000 * 6), 4) }));
  });
  it('rejects a booking id for another month', async () => {
    const b = writeBatch(anon());
    const s = start();
    b.set(doc(anon(), 'workspaces', W, 'bookings', '200001_0'), { serviceId: 's_0', staffId: 'p_0', customerName: 'Chidi Okeke', customerPhone: '+2348031234567',
      startsAt: Timestamp.fromDate(s), endsAt: Timestamp.fromMillis(s.getTime() + 3600000), cells: cellsFor(s, 4), status: 'pending', source: 'public', createdAt: serverTimestamp() });
    await assertFails(b.commit());
  });
  it('lets staff cancel a booking and free its cells', async () => {
    const s = start(); const c = cellsFor(s, 4);
    await assertSucceeds(book(anon(), 0, { startsAtDate: s }));
    const b = writeBatch(owner());
    b.update(doc(owner(), 'workspaces', W, 'bookings', `${month()}_0`), { status: 'cancelled' });
    for (const x of c) b.delete(doc(owner(), 'workspaces', W, 'locks', `p_0_${x}`));
    await assertSucceeds(b.commit());
    await assertSucceeds(book(anon(), 1, { startsAtDate: s }));
  });
});
