/**
 * Scheduled call requests.
 *
 * A business that switches "Call requests" on lets customers ask for a video call when a booking or an order is large
 * (the price is at or above the business's threshold) or the service is marked "always offer a call". The customer picks a
 * time they would like, the business confirms it (or proposes another), and both sides get an email 30 minutes before.
 *
 *   POST /api/public/call-request   the customer, right after booking / ordering: { slug, kind: 'booking'|'order', refId, preferredAt?, note? }
 *   POST /api/calls/respond         a team member: { workspaceId, callId, action: 'confirm'|'decline'|'cancel'|'complete', scheduledAt? }
 *   scheduledCallReminders()        the 5-minute job: emails everyone whose call starts within 30 minutes, once.
 *
 * The request lives in `workspaces/{wid}/calls/{id}` with an id made from the booking or order (`c_b_...`, `c_o_...`), so asking
 * twice changes nothing. Only this Worker writes it. Joining uses the same room, allowance and link as an online booking
 * (see meetings.ts), so a call counts toward the monthly video-call allowance only when someone actually joins.
 */
import { DOERS, requireMember } from '../auth';
import type { Ctx, Deps, Env } from '../env';
import { FsConflict, fsCommit, fsGet, fsQuery } from '../fs';
import { ownerContact } from '../automation';
import { queueFormal } from '../outbox';
import { HttpError, firstName, json, localWhen, readJson } from '../util';
import { callLinkFor } from './meetings';

const BOOKING_RE = /^\d{6}_\d{1,6}$/;
const ORDER_RE = /^[A-Za-z0-9]{6,32}$/;
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const MIN = 60_000;
const FRESH_MS = 2 * 60 * MIN;           // a call can only be asked for within 2 hours of booking/ordering
const MAX_AHEAD_MS = 90 * 86_400_000;
const REMIND_BEFORE_MS = 30 * MIN;
const MAX_WORKSPACES = 100, MAX_CALLS = 200;
const ms = (v: unknown): number => (v instanceof Date ? v.getTime() : 0);
const base = (env: Env): string => env.APP_URL.replace(/\/$/, '');
const offsetOf = (st: Record<string, unknown> | undefined): number => Number(st?.utcOffsetMinutes ?? 60);
const bizName = (ws: Record<string, any>): string => String((ws.settings as Record<string, unknown> | undefined)?.publicName ?? ws.name ?? 'the business');

/** Whether this business offers a call for something priced at `priceMinor` (USD cents). */
export function callOffered(settings: Record<string, unknown> | undefined, priceMinor: number, alwaysOffer = false): boolean {
  if (settings?.callRequests !== true) return false;
  if (alwaysOffer) return true;
  const t = Number(settings.callThresholdMinor);
  return Number.isFinite(t) && t > 0 && priceMinor >= t;
}

/** POST /api/public/call-request */
export async function publicCallRequest(c: Ctx): Promise<Response> {
  const b = await readJson(c.req, 2048);
  const slug = String(b.slug ?? ''), kind = String(b.kind ?? ''), refId = String(b.refId ?? '');
  if (!/^[a-z0-9-]{3,40}$/.test(slug) || (kind !== 'booking' && kind !== 'order')) throw new HttpError(400, 'Invalid request');
  if (kind === 'booking' ? !BOOKING_RE.test(refId) : !ORDER_RE.test(refId)) throw new HttpError(400, 'Invalid request');
  const s = await fsGet(c.env, c.d, `slugs/${slug}`);
  const wid = String(s?.data.wid ?? '');
  if (!wid) throw new HttpError(404, 'Not found');
  const ws = await fsGet(c.env, c.d, `workspaces/${wid}`);
  if (!ws || ws.data.status === 'closing' || ws.data.status === 'deleted') throw new HttpError(404, 'Not found');
  const st = (ws.data.settings ?? {}) as Record<string, unknown>;
  if (st.callRequests !== true) throw new HttpError(409, 'This business is not taking call requests.');

  const ref = await fsGet(c.env, c.d, `workspaces/${wid}/${kind === 'booking' ? 'bookings' : 'orders'}/${refId}`);
  const now = c.d.now().getTime();
  if (!ref || (kind === 'booking' && ref.data.source !== 'public') || now - ms(ref.data.createdAt) > FRESH_MS) throw new HttpError(404, 'Not found');
  let priceMinor = 0, always = false, what = '';
  if (kind === 'booking') {
    const svc = await fsGet(c.env, c.d, `workspaces/${wid}/services/${String(ref.data.serviceId)}`);
    priceMinor = Number(svc?.data.priceMinor ?? 0); always = svc?.data.offerCall === true; what = String(svc?.data.name ?? 'your booking');
  } else {
    priceMinor = Number(ref.data.totalMinor ?? 0); what = `order ${String(ref.data.ref ?? '')}`.trim();
  }
  if (!callOffered(st, priceMinor, always)) throw new HttpError(409, 'A call is not offered for this.');

  let preferredAt: Date | null = null;
  if (b.preferredAt) {
    const t = new Date(String(b.preferredAt)).getTime();
    if (!Number.isFinite(t) || t < now || t > now + MAX_AHEAD_MS) throw new HttpError(400, 'Choose a time in the future, within the next 90 days.');
    preferredAt = new Date(t);
  }
  const note = String(b.note ?? '').replace(/\s+/g, ' ').trim().slice(0, 300);
  const id = `c_${kind === 'booking' ? 'b' : 'o'}_${refId}`;
  const email = String(ref.data.customerEmail ?? '').trim().toLowerCase();
  const name = String(ref.data.customerName ?? '').trim();
  try {
    await fsCommit(c.env, c.d, [{ path: `workspaces/${wid}/calls/${id}`, precondition: { exists: false },
      fields: { kind, refId, what, customerName: name, customerEmail: EMAIL_RE.test(email) ? email : null, customerPhone: String(ref.data.customerPhone ?? ''), preferredAt, note: note || null,
        status: 'requested', scheduledAt: null, durationMin: 30, remindedFor: null, createdAt: c.d.now(), updatedAt: c.d.now() } }]);
  } catch (e) { if (e instanceof FsConflict) return json({ ok: true, duplicate: true }, 200, c.headers); throw e; }

  const off = offsetOf(st), biz = bizName(ws.data);
  const owner = await ownerContact(c, wid);
  if (owner.email && st.notifyOwnerEmail !== false) {
    await queueFormal(c.env, c.d, `callreq:${wid}:${id}`, owner.email, `Call request from ${name || 'a customer'}`, {
      heading: 'A customer would like a call', greeting: `Hello ${owner.name},`,
      paragraphs: [`${name || 'A customer'} asked for a video call about ${what}. Open Calls to confirm a time or suggest another.`, ...(note ? [`They wrote: "${note}"`] : [])],
      details: [['Customer', name || 'Not given'], ['Phone', String(ref.data.customerPhone ?? '') || 'Not given'], ['Preferred time', preferredAt ? localWhen(preferredAt.toISOString(), off) : 'No preference'], ['About', what]],
      button: { text: 'Open calls', url: `${base(c.env)}/app/calls` } }, wid).catch((e) => console.error('call request owner email', e instanceof Error ? e.message : e));
  }
  if (EMAIL_RE.test(email)) {
    await queueFormal(c.env, c.d, `callack:${wid}:${id}`, email, `We received your call request`, {
      heading: 'Your call request was received', greeting: `Hello ${firstName(name, email)},`,
      paragraphs: [`${biz} has your request for a video call. They will confirm a time by email. Nothing else is needed from you.`],
      details: [['Business', biz], ['About', what], ['Your preferred time', preferredAt ? localWhen(preferredAt.toISOString(), off) : 'No preference']],
      note: 'This acknowledges your request. The call is only set once the business confirms a time.' }, wid).catch((e) => console.error('call request ack', e instanceof Error ? e.message : e));
  }
  return json({ ok: true, id }, 201, c.headers);
}

/** POST /api/calls/respond */
export async function respondToCall(c: Ctx): Promise<Response> {
  const b = await readJson(c.req);
  const { wid } = await requireMember(c, b.workspaceId, DOERS);
  const callId = String(b.callId ?? ''), action = String(b.action ?? '');
  if (!/^c_[bo]_[A-Za-z0-9_-]{1,60}$/.test(callId)) throw new HttpError(400, 'Invalid call');
  const [call, ws] = await Promise.all([fsGet(c.env, c.d, `workspaces/${wid}/calls/${callId}`), fsGet(c.env, c.d, `workspaces/${wid}`)]);
  if (!call || !ws) throw new HttpError(404, 'Call not found');
  const st = (ws.data.settings ?? {}) as Record<string, unknown>;
  const now = c.d.now().getTime(), cur = String(call.data.status);
  const email = String(call.data.customerEmail ?? '');
  const off = offsetOf(st), biz = bizName(ws.data), who = firstName(String(call.data.customerName ?? ''), email);
  const set = async (fields: Record<string, unknown>) => {
    try { await fsCommit(c.env, c.d, [{ path: `workspaces/${wid}/calls/${callId}`, fields: { ...fields, updatedAt: c.d.now() }, mask: [...Object.keys(fields), 'updatedAt'], precondition: { updateTime: call.updateTime } }]); }
    catch (e) { if (e instanceof FsConflict) throw new HttpError(409, 'This call was just changed. Refresh and try again.'); throw e; }
  };

  if (action === 'confirm') {
    if (cur === 'completed' || cur === 'declined') throw new HttpError(409, 'This call is already closed.');
    const t = new Date(String(b.scheduledAt ?? '')).getTime();
    if (!Number.isFinite(t) || t < now - 5 * MIN || t > now + MAX_AHEAD_MS) throw new HttpError(400, 'Pick a time in the future, within the next 90 days.');
    await set({ status: 'scheduled', scheduledAt: new Date(t), remindedFor: null });
    if (EMAIL_RE.test(email)) {
      const link = await callLinkFor(c.env, wid, callId, st);
      const moved = cur === 'scheduled';
      await queueFormal(c.env, c.d, `callset:${wid}:${callId}:${t}`, email, moved ? `Your call with ${biz} has moved` : `Your call with ${biz} is confirmed`, {
        heading: moved ? 'Your call time has changed' : 'Your call is confirmed', greeting: `Hello ${who},`,
        paragraphs: [`${biz} will call you by video at the time below. ${link ? 'Use the button to join. You can join any time before it starts.' : 'The business will share how to join.'} We will email you again 30 minutes before.`],
        details: [['Business', biz], ['About', String(call.data.what ?? 'Your request')], ['Time', localWhen(new Date(t).toISOString(), off)], ['Length', 'About 30 minutes']],
        ...(link ? { button: { text: 'Join the call', url: link } } : {}) }, wid);
    }
    return json({ ok: true, status: 'scheduled' }, 200, c.headers);
  }
  if (action === 'decline') {
    if (cur !== 'requested') throw new HttpError(409, 'Only a new request can be declined. Use cancel for a scheduled call.');
    await set({ status: 'declined' });
    if (EMAIL_RE.test(email)) await queueFormal(c.env, c.d, `calldecl:${wid}:${callId}`, email, `About your call request`, {
      heading: 'About your call request', greeting: `Hello ${who},`,
      paragraphs: [`${biz} is not able to hold a video call for this one. Your ${call.data.kind === 'order' ? 'order' : 'booking'} is not affected and they will contact you as usual.`],
      details: [['Business', biz], ['About', String(call.data.what ?? 'Your request')]] }, wid);
    return json({ ok: true, status: 'declined' }, 200, c.headers);
  }
  if (action === 'cancel') {
    if (cur !== 'scheduled') throw new HttpError(409, 'Only a scheduled call can be cancelled.');
    await set({ status: 'cancelled' });
    if (EMAIL_RE.test(email)) await queueFormal(c.env, c.d, `callcancel:${wid}:${callId}:${ms(call.data.scheduledAt)}`, email, `Your call with ${biz} was cancelled`, {
      heading: 'Your call was cancelled', greeting: `Hello ${who},`,
      paragraphs: [`${biz} has cancelled the call that was set for ${localWhen(ms(call.data.scheduledAt) ? new Date(ms(call.data.scheduledAt)).toISOString() : '', off)}. They will contact you to arrange another time.`],
      details: [['Business', biz], ['About', String(call.data.what ?? 'Your request')]] }, wid);
    return json({ ok: true, status: 'cancelled' }, 200, c.headers);
  }
  if (action === 'complete') {
    if (cur !== 'scheduled') throw new HttpError(409, 'Only a scheduled call can be marked done.');
    await set({ status: 'completed' });
    return json({ ok: true, status: 'completed' }, 200, c.headers);
  }
  throw new HttpError(400, 'Unknown action');
}

/**
 * The 5-minute job. Finds scheduled calls that start within 30 minutes and emails the customer (join link) and the owner
 * (dashboard link), once per scheduled time. Only workspaces with call requests on are scanned.
 */
export async function scheduledCallReminders(env: Env, d: Deps): Promise<number> {
  const now = d.now().getTime();
  const wss = await fsQuery(env, d, { collection: 'workspaces', where: [{ field: 'settings.callRequests', op: 'EQUAL', value: true }], limit: MAX_WORKSPACES });
  let sent = 0;
  for (const ws of wss) {
    if (ws.data.status === 'closing' || ws.data.status === 'deleted') continue;
    const wid = ws.id, st = (ws.data.settings ?? {}) as Record<string, unknown>;
    const calls = await fsQuery(env, d, { parent: `workspaces/${wid}`, collection: 'calls', where: [{ field: 'status', op: 'EQUAL', value: 'scheduled' }], limit: MAX_CALLS });
    for (const call of calls) {
      const at = ms(call.data.scheduledAt);
      if (call.data.status !== 'scheduled' || !at || at - now > REMIND_BEFORE_MS || at < now - 10 * MIN) continue;   // not yet, or too late to be useful
      if (Number(call.data.remindedFor) === at) continue;
      try {
        await fsCommit(env, d, [{ path: `workspaces/${wid}/calls/${call.id}`, fields: { remindedFor: at }, mask: ['remindedFor'], precondition: { updateTime: call.updateTime } }]);
      } catch (e) { if (e instanceof FsConflict) continue; throw e; }
      const off = offsetOf(st), biz = bizName(ws.data), when = localWhen(new Date(at).toISOString(), off);
      const email = String(call.data.customerEmail ?? '');
      const ctx = { env, d } as unknown as Ctx;
      if (EMAIL_RE.test(email)) {
        const link = await callLinkFor(env, wid, call.id, st);
        await queueFormal(env, d, `callremind:${wid}:${call.id}:${at}`, email, `Your call with ${biz} starts soon`, {
          heading: 'Your call starts in about 30 minutes', greeting: `Hello ${firstName(String(call.data.customerName ?? ''), email)},`,
          paragraphs: [`Your video call with ${biz} is at ${when}. ${link ? 'Use the button to join. You can join any time before it starts.' : 'The business will share how to join.'}`],
          details: [['Business', biz], ['About', String(call.data.what ?? 'Your request')], ['Time', when]],
          ...(link ? { button: { text: 'Join the call', url: link } } : {}) }, wid).catch((e) => console.error('call reminder', e instanceof Error ? e.message : e));
        sent++;
      }
      const owner = await ownerContact(ctx, wid).catch(() => ({ email: '', name: 'there' }));
      if (owner.email) {
        await queueFormal(env, d, `callremindowner:${wid}:${call.id}:${at}`, owner.email, `Call with ${String(call.data.customerName ?? 'a customer')} starts soon`, {
          heading: 'A call starts in about 30 minutes', greeting: `Hello ${owner.name},`,
          paragraphs: [`You have a video call with ${String(call.data.customerName ?? 'a customer')} at ${when}. Open it from your dashboard. You can join any time before it starts.`],
          details: [['Customer', String(call.data.customerName ?? 'Not given')], ['Phone', String(call.data.customerPhone ?? '') || 'Not given'], ['About', String(call.data.what ?? 'Request')], ['Time', when]],
          button: { text: 'Open the call', url: `${base(env)}/app/meet/${call.id}` } }, wid).catch((e) => console.error('call reminder owner', e instanceof Error ? e.message : e));
        sent++;
      }
    }
  }
  return sent;
}
