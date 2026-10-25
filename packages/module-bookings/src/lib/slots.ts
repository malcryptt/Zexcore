export interface SlotSettings {
  open_minutes: number;
  close_minutes: number;
  slot_minutes: number;
  days_open: number[];
  utc_offset_minutes: number;
  lead_minutes: number;
  max_days_ahead: number;
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** UTC epoch ms of local midnight for a YYYY-MM-DD date in the business's fixed UTC offset. */
export function localMidnightUtc(date: string, offsetMinutes: number): number | null {
  const m = DATE_RE.exec(date);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  const check = new Date(t);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
  return t - offsetMinutes * 60_000;
}

export function localDateOf(instantMs: number, offsetMinutes: number): string {
  return new Date(instantMs + offsetMinutes * 60_000).toISOString().slice(0, 10);
}

export function weekdayOf(date: string): number {
  const m = DATE_RE.exec(date)!;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay();
}

/** All bookable start instants (ms) for a local date and service duration, honouring lead time and horizon. */
export function generateSlotStarts(date: string, durationMin: number, s: SlotSettings, nowMs = Date.now()): number[] {
  const base = localMidnightUtc(date, s.utc_offset_minutes);
  if (base === null) return [];
  if (!s.days_open.includes(weekdayOf(date))) return [];
  const earliest = nowMs + s.lead_minutes * 60_000;
  const latest = nowMs + s.max_days_ahead * 86_400_000;
  const out: number[] = [];
  for (let t = s.open_minutes; t + durationMin <= s.close_minutes; t += s.slot_minutes) {
    const start = base + t * 60_000;
    if (start >= earliest && start <= latest) out.push(start);
  }
  return out;
}

/** True when the instant is exactly one of the generated slot starts for its local date. */
export function isValidSlotStart(startMs: number, durationMin: number, s: SlotSettings, nowMs = Date.now()): boolean {
  const date = localDateOf(startMs, s.utc_offset_minutes);
  return generateSlotStarts(date, durationMin, s, nowMs).includes(startMs);
}

export function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s().-]/g, '');
  let p = cleaned;
  if (/^0\d{10}$/.test(p)) p = `+234${p.slice(1)}`; // Nigerian national format
  else if (/^234\d{10}$/.test(p)) p = `+${p}`;
  if (!/^\+\d{8,15}$/.test(p)) return null;
  return p;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Sat 24 Oct, 09:00" in the business's fixed UTC offset. */
export function formatLocal(instantMs: number, offsetMinutes: number): string {
  const d = new Date(instantMs + offsetMinutes * 60_000);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}, ${hh}:${mm}`;
}
