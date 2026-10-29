// Slot maths for the business-local calendar. Pure functions; mirrors packages/module-bookings/src/lib/slots.ts.
export interface SlotSettings {
  openMinutes: number; closeMinutes: number; slotMinutes: number; daysOpen: number[];
  utcOffsetMinutes: number; leadMinutes: number; maxDaysAhead: number;
}
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function localMidnightUtc(date: string, offsetMinutes: number): number | null {
  const m = DATE_RE.exec(date);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  const c = new Date(t);
  if (c.getUTCFullYear() !== y || c.getUTCMonth() !== mo - 1 || c.getUTCDate() !== d) return null;
  return t - offsetMinutes * 60_000;
}
export const localDateOf = (ms: number, off: number): string => new Date(ms + off * 60_000).toISOString().slice(0, 10);
export const weekdayOf = (date: string): number => new Date(`${date}T00:00:00Z`).getUTCDay();

export function generateSlotStarts(date: string, durationMin: number, s: SlotSettings, nowMs = Date.now()): number[] {
  const base = localMidnightUtc(date, s.utcOffsetMinutes);
  if (base === null || !s.daysOpen.includes(weekdayOf(date))) return [];
  const earliest = nowMs + s.leadMinutes * 60_000;
  const latest = nowMs + s.maxDaysAhead * 86_400_000;
  const out: number[] = [];
  for (let t = s.openMinutes; t + durationMin <= s.closeMinutes; t += s.slotMinutes) {
    const start = base + t * 60_000;
    if (start >= earliest && start <= latest) out.push(start);
  }
  return out;
}

export function normalizePhone(raw: string): string | null {
  let p = raw.replace(/[\s().-]/g, '');
  if (/^0\d{10}$/.test(p)) p = `+234${p.slice(1)}`;
  else if (/^234\d{10}$/.test(p)) p = `+${p}`;
  return /^\+\d{8,15}$/.test(p) ? p : null;
}

/** Firestore double-booking guard works on 15-minute cells since the epoch. */
export const CELL_MS = 900_000;
export const cellsFor = (startMs: number, durationMin: number): number[] =>
  Array.from({ length: durationMin / 15 }, (_, i) => startMs / CELL_MS + i);
