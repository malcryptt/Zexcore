import { addDoc, getDocs, orderBy, limit as qLimit, query, serverTimestamp, setDoc, type DocumentData } from 'firebase/firestore';
import { ApiError, iso, loadCtx, wsCol, wsDoc } from './core';
import { listBookings, type BookingDto } from './bookings';
import { normalizePhone } from './slots';

/**
 * The inbox. WhatsApp has no inbound API for a normal business number, so ZexCore keeps the record itself:
 * every public booking request is an inbound event, every reply the team sends is logged, and "Send" opens WhatsApp
 * with the text ready. Conversations are grouped by phone number.
 */
interface Ev { id: string; direction: 'in' | 'out'; kind: 'text' | 'system'; body: string; at: number }
interface Group { phone: string; name: string; events: Ev[]; bookings: BookingDto[] }

const when = (iso: string): string => new Date(iso).toLocaleString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Africa/Lagos' });

async function load(): Promise<{ groups: Map<string, Group>; readAt: Map<string, number> }> {
  const c = await loadCtx();
  const [{ bookings }, msgs, state] = await Promise.all([
    listBookings(new URLSearchParams({ limit: '500' })),
    getDocs(query(wsCol(c, 'messages'), orderBy('createdAt', 'desc'), qLimit(500))),
    getDocs(wsCol(c, 'convState')),
  ]);
  const groups = new Map<string, Group>();
  const g = (phone: string, name: string): Group => { let x = groups.get(phone); if (!x) { x = { phone, name, events: [], bookings: [] }; groups.set(phone, x); } return x; };
  for (const b of bookings) {
    const x = g(b.customerPhone, b.customerName); x.bookings.push(b);
    const at = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.startsAt).getTime();
    x.events.push({ id: `b_${b.id}`, direction: b.source === 'public' ? 'in' : 'out', kind: 'system', at,
      body: b.source === 'public' ? `${b.customerName} requested ${b.serviceName} for ${when(b.startsAt)}.` : `Booked ${b.serviceName} for ${when(b.startsAt)}.` });
  }
  for (const d of msgs.docs) {
    const m = d.data() as DocumentData;
    const x = g(m.phone, m.name || m.phone); if (m.name && x.name === m.phone) x.name = m.name;
    x.events.push({ id: d.id, direction: m.direction === 'in' ? 'in' : 'out', kind: 'text', body: String(m.body ?? ''), at: new Date(iso(m.createdAt) ?? Date.now()).getTime() });
  }
  for (const x of groups.values()) x.events.sort((a, b) => a.at - b.at);
  return { groups, readAt: new Map(state.docs.map((d) => [d.id, new Date(iso(d.data().readAt) ?? 0).getTime()])) };
}

const next = (g: Group): BookingDto | undefined =>
  g.bookings.filter((b) => (b.status === 'pending' || b.status === 'confirmed') && new Date(b.startsAt).getTime() >= Date.now()).sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];

export async function conversations(params: URLSearchParams): Promise<unknown> {
  const { groups, readAt } = await load();
  const rows = [...groups.values()].map((g) => {
    const last = g.events[g.events.length - 1]!; const seen = readAt.get(g.phone) ?? 0; const n = next(g);
    return {
      phone: g.phone, name: g.name, lastBody: last.body, lastKind: last.kind, lastDirection: last.direction, lastAt: new Date(last.at).toISOString(),
      unread: g.events.filter((e) => e.direction === 'in' && e.at > seen).length,
      nextSlot: n?.startsAt ?? null, nextStatus: n?.status ?? null, nextRef: n?.ref ?? null, waiting: last.direction === 'in',
    };
  }).sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  const counts = { all: rows.length, waiting: rows.filter((r) => r.waiting).length, booked: rows.filter((r) => r.nextSlot).length };
  const f = params.get('filter');
  const list = f === 'waiting' ? rows.filter((r) => r.waiting) : f === 'booked' ? rows.filter((r) => r.nextSlot) : rows;
  return { conversations: list.map(({ waiting: _w, ...r }) => r), counts };
}

export async function conversation(params: URLSearchParams): Promise<unknown> {
  const phone = normalizePhone(params.get('phone') ?? '');
  if (!phone) throw new ApiError(400, 'Enter a valid phone number.');
  const g = (await load()).groups.get(phone);
  return {
    phone,
    messages: (g?.events ?? []).map((e) => ({ id: e.id, direction: e.direction, kind: e.kind, body: e.body, createdAt: new Date(e.at).toISOString() })),
    bookings: (g?.bookings ?? []).map((b) => ({ ref: b.ref, serviceName: b.serviceName, startsAt: b.startsAt, status: b.status, depositStatus: b.depositStatus, depositMinor: b.depositMinor, currency: b.currency, customerName: b.customerName })),
  };
}

export async function markRead(b: Record<string, unknown>): Promise<{ ok: true }> {
  const c = await loadCtx();
  const phone = normalizePhone(String(b.phone ?? ''));
  if (phone) await setDoc(wsDoc(c, 'convState', phone), { readAt: serverTimestamp() }).catch(() => undefined);
  return { ok: true };
}

export async function send(b: Record<string, unknown>): Promise<{ ok: true; whatsappUrl: string }> {
  const c = await loadCtx();
  const phone = normalizePhone(String(b.phone ?? ''));
  if (!phone) throw new ApiError(400, 'Enter a valid phone number, for example 08012345678.');
  const body = String(b.body ?? '').trim();
  if (!body) throw new ApiError(400, 'Write a message first.');
  if (body.length > 2000) throw new ApiError(400, 'That message is too long (2,000 characters at most).');
  const name = String(b.name ?? '').trim().slice(0, 160);
  await addDoc(wsCol(c, 'messages'), { phone, name, direction: 'out', kind: 'text', body, createdAt: serverTimestamp(), by: c.uid });
  await setDoc(wsDoc(c, 'convState', phone), { readAt: serverTimestamp() }).catch(() => undefined);
  return { ok: true, whatsappUrl: `https://wa.me/${phone.slice(1)}?text=${encodeURIComponent(body)}` };
}
