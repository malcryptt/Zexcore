/**
 * Video meetings for online appointments.
 *
 * A service marked "online" gets a meeting. If the business saved its own link (Meet, Zoom...) that link is used and
 * nothing here is counted. Otherwise a private Daily room is created the first time someone joins, lasts 30 minutes and
 * holds up to 4 people, and is counted against the workspace's monthly allowance (CALLS_PER_MONTH).
 *
 * Only this Worker talks to Daily, so the API key never reaches a browser, and only this Worker can create rooms,
 * which is what makes the allowance enforceable. Rooms are private: every join needs a token the Worker issues.
 *
 * Customers have no account, so the link in their email carries a key that only this Worker can compute
 * (an HMAC of the workspace and booking). It cannot be guessed and nothing needs storing for it.
 */
import { DOERS, requireMember } from '../auth';
import type { Ctx, Deps, Env } from '../env';
import { FsConflict, fsCommit, fsGet } from '../fs';
import { CALLS_PER_MONTH, effectivePlan } from '../plan';
import { HttpError, WID_RE, hmacSha256Hex, json, randomHex, readJson, timingSafeEqual } from '../util';

const BOOKING_RE = /^\d{6}_\d{1,6}$/;
/** A scheduled call request (see routes/calls.ts) is joined exactly like a booking, under an id starting `c_`. */
export const CALL_RE = /^c_[bo]_[A-Za-z0-9_-]{1,60}$/;
const MEETING_RE = (id: string): boolean => BOOKING_RE.test(id) || CALL_RE.test(id);
const DAILY = 'https://api.daily.co/v1';
const ROOM_MINUTES = 30;
const MAX_PEOPLE = 4;
const MAX_ROOMS_PER_BOOKING = 3;
const MIN = 60_000;

export const dailyConfigured = (env: Env): boolean => Boolean((env.DAILY_API_KEY ?? '').trim());
const monthKey = (d: Date): string => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
const ownLink = (settings: Record<string, unknown> | undefined): string => {
  const u = typeof settings?.meetingUrl === 'string' ? settings.meetingUrl.trim() : '';
  return /^https:\/\/[^\s]{4,300}$/.test(u) ? u : '';
};

/** The key that goes in a customer's link. Only this Worker can make it. */
export async function joinKey(env: Env, wid: string, bookingId: string): Promise<string> {
  return (await hmacSha256Hex(env.DAILY_API_KEY ?? '', `meet:${wid}:${bookingId}`)).slice(0, 24);
}

/** Where a customer should go to join, or null when the service is not online or no way to host it is set up. */
export async function callLinkFor(env: Env, wid: string, callId: string, settings: Record<string, unknown> | undefined): Promise<string | null> {
  const own = ownLink(settings);
  if (own) return own;
  if (!dailyConfigured(env)) return null;
  return `${env.APP_URL.replace(/\/$/, '')}/meet/${wid}/${callId}/${await joinKey(env, wid, callId)}`;
}

export async function meetingLinkFor(env: Env, wid: string, bookingId: string, service: Record<string, any> | undefined, settings: Record<string, unknown> | undefined): Promise<string | null> {
  if (service?.online !== true) return null;
  const own = ownLink(settings);
  if (own) return own;
  if (!dailyConfigured(env)) return null;
  return `${env.APP_URL.replace(/\/$/, '')}/meet/${wid}/${bookingId}/${await joinKey(env, wid, bookingId)}`;
}

async function daily(env: Env, d: Deps, path: string, body: unknown): Promise<Record<string, any>> {
  const r = await d.fetch(`${DAILY}${path}`, { method: 'POST', headers: { authorization: `Bearer ${env.DAILY_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = (await r.json().catch(() => ({}))) as Record<string, any>;
  if (!r.ok) { console.error('daily error', path, r.status, String(j.error ?? j.info ?? '').slice(0, 200)); throw new HttpError(502, 'The video service did not respond. Please try again in a moment.'); }
  return j;
}

/** Reads the month's counter and adds one, refusing at the limit. Safe if two people join at once (the write is guarded by the doc's update time). */
async function takeCall(env: Env, d: Deps, wid: string, limit: number): Promise<number> {
  const path = `meetingUsage/${wid}_${monthKey(d.now())}`;
  for (let i = 0; i < 5; i++) {
    const cur = await fsGet(env, d, path);
    const used = Number(cur?.data.count ?? 0);
    if (used >= limit) throw new HttpError(402, `This business has used all ${limit} video calls for this month. They renew on the 1st, or the owner can upgrade the plan.`);
    try {
      await fsCommit(env, d, [{ path, fields: { wid, month: monthKey(d.now()), count: used + 1 }, precondition: cur ? { updateTime: cur.updateTime } : { exists: false } }]);
      return used + 1;
    } catch (e) { if (!(e instanceof FsConflict)) throw e; }
  }
  throw new HttpError(503, 'Busy, please try again.');
}

interface Target { mode: 'own' | 'daily'; url: string; used?: number; limit?: number; expiresAt?: number }

/** Finds or creates the room for a booking and returns a join URL for one person. */
async function enter(c: Ctx, wid: string, bookingId: string, who: { name: string; owner: boolean }): Promise<Target> {
  const { env, d } = c;
  const isCall = CALL_RE.test(bookingId);
  const [bk, ws] = await Promise.all([fsGet(env, d, `workspaces/${wid}/${isCall ? 'calls' : 'bookings'}/${bookingId}`), fsGet(env, d, `workspaces/${wid}`)]);
  if (!bk || !ws) throw new HttpError(404, isCall ? 'Call not found' : 'Booking not found');
  if (isCall) {
    if (bk.data.status !== 'scheduled') throw new HttpError(409, bk.data.status === 'cancelled' || bk.data.status === 'declined' ? 'This call was cancelled.' : 'This call has not been scheduled yet.');
  } else {
    const svc = await fsGet(env, d, `workspaces/${wid}/services/${String(bk.data.serviceId)}`);
    if (svc?.data.online !== true) throw new HttpError(400, 'This booking is not an online meeting.');
    if (bk.data.status === 'cancelled') throw new HttpError(409, 'This booking was cancelled.');
  }
  const own = ownLink(ws.data.settings as Record<string, unknown> | undefined);
  if (own) return { mode: 'own', url: own };
  if (!dailyConfigured(env)) throw new HttpError(503, 'Video calls are not switched on yet. Ask the business for another way to meet.');
  const at = isCall ? bk.data.scheduledAt : bk.data.startsAt;
  const starts = at instanceof Date ? at.getTime() : 0;
  const now = d.now().getTime();
  // Either side can go in whenever it suits them: from a day before (so nobody is locked out by a clock) until well after the slot.
  // The room is timed from the scheduled start, not from the first join, so joining early never uses up the 30 minutes.
  const early = 24 * 60 * MIN, late = who.owner ? 4 * 60 * MIN : 90 * MIN;
  if (!starts || now < starts - early) throw new HttpError(409, 'This meeting opens up to a day before the appointment.');
  if (now > starts + late) throw new HttpError(410, 'This appointment has ended.');

  const { plan } = effectivePlan(ws.data, d.now());
  const limit = CALLS_PER_MONTH[plan] ?? CALLS_PER_MONTH.free!;
  const mtgPath = `meetings/${wid}_${bookingId}`;
  const existing = await fsGet(env, d, mtgPath);
  let room = existing && existing.data.expiresAt instanceof Date && existing.data.expiresAt.getTime() > now + MIN ? existing.data : null;
  let used: number | undefined;
  if (!room) {
    if (Number(existing?.data.rooms ?? 0) >= MAX_ROOMS_PER_BOOKING) throw new HttpError(429, 'This appointment has used its video sessions.');
    used = await takeCall(env, d, wid, limit);
    const exp = Math.floor(Math.max(now, starts) / 1000) + ROOM_MINUTES * 60 + 120;
    const made = await daily(env, d, '/rooms', { name: `zx-${randomHex(12)}`, privacy: 'private', properties: { exp, max_participants: MAX_PEOPLE, eject_at_room_exp: true, enable_prejoin_ui: true, enable_chat: true } });
    room = { roomName: String(made.name), roomUrl: String(made.url), expiresAt: new Date(exp * 1000), rooms: Number(existing?.data.rooms ?? 0) + 1 };
    await fsCommit(env, d, [{ path: mtgPath, fields: { wid, bookingId, ...room, createdAt: d.now() } }]);
  }
  const exp = Math.floor((room.expiresAt as Date).getTime() / 1000);
  const tok = await daily(env, d, '/meeting-tokens', { properties: { room_name: room.roomName, is_owner: who.owner, user_name: who.name.slice(0, 60), exp, eject_at_token_exp: true } });
  return { mode: 'daily', url: `${room.roomUrl}?t=${String(tok.token)}`, used, limit, expiresAt: exp * 1000 };
}

/** POST /api/meetings/join { workspaceId, bookingId } — a team member joins (or starts) the meeting for a booking. */
export async function memberJoin(c: Ctx): Promise<Response> {
  const b = await readJson(c.req);
  const { wid, caller } = await requireMember(c, b.workspaceId, DOERS);
  const id = String(b.bookingId ?? '');
  if (!MEETING_RE(id)) throw new HttpError(400, 'Invalid booking');
  const t = await enter(c, wid, id, { name: caller.email?.split('@')[0] || 'Host', owner: true });
  return json(t, 200, c.headers);
}

/** POST /api/public/meeting { workspaceId, bookingId, key } — a customer joins from the link in their email. */
export async function publicJoin(c: Ctx): Promise<Response> {
  const b = await readJson(c.req, 1024);
  const wid = String(b.workspaceId ?? ''), id = String(b.bookingId ?? ''), key = String(b.key ?? '');
  if (!WID_RE.test(wid) || !MEETING_RE(id) || !/^[0-9a-f]{24}$/.test(key) || !dailyConfigured(c.env)) throw new HttpError(404, 'Not found');
  if (!timingSafeEqual(key, await joinKey(c.env, wid, id))) throw new HttpError(404, 'Not found');
  const bk = await fsGet(c.env, c.d, `workspaces/${wid}/${CALL_RE.test(id) ? 'calls' : 'bookings'}/${id}`);
  const name = String(bk?.data.customerName ?? 'Guest');
  return json(await enter(c, wid, id, { name, owner: false }), 200, c.headers);
}

/** POST /api/meetings/usage { workspaceId } — calls used this month, for the Billing page. */
export async function usage(c: Ctx): Promise<Response> {
  const b = await readJson(c.req);
  const { wid } = await requireMember(c, b.workspaceId);
  const ws = await fsGet(c.env, c.d, `workspaces/${wid}`);
  const { plan } = effectivePlan(ws?.data, c.d.now());
  const cur = await fsGet(c.env, c.d, `meetingUsage/${wid}_${monthKey(c.d.now())}`);
  return json({ used: Number(cur?.data.count ?? 0), limit: CALLS_PER_MONTH[plan] ?? CALLS_PER_MONTH.free, ready: dailyConfigured(c.env) || Boolean(ownLink(ws?.data.settings as Record<string, unknown> | undefined)), own: Boolean(ownLink(ws?.data.settings as Record<string, unknown> | undefined)) }, 200, c.headers);
}
