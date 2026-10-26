const CUR: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' };

export function money(minor: number, currency = 'NGN'): string {
  const major = minor / 100;
  const frac = Number.isInteger(major) ? 0 : 2;
  return `${CUR[currency] ?? currency + ' '}${major.toLocaleString('en-NG', { minimumFractionDigits: frac, maximumFractionDigits: 2 })}`;
}

/** Business-local calendar helpers use a fixed UTC offset (minutes) so rendering never depends on the viewer's device zone. */
export function shift(iso: string | number | Date, offsetMin: number): Date {
  return new Date(new Date(iso).getTime() + offsetMin * 60_000);
}
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export { DAY, DAY_LONG, MON, MON_LONG };

export function timeOf(iso: string, off: number): string {
  const d = shift(iso, off);
  const h = d.getUTCHours();
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
export function ymd(iso: string, off: number): string {
  return shift(iso, off).toISOString().slice(0, 10);
}
export function dayLabel(iso: string, off: number, nowIso = new Date().toISOString()): string {
  const d = ymd(iso, off), t = ymd(nowIso, off);
  const tomorrow = ymd(new Date(new Date(nowIso).getTime() + 86_400_000).toISOString(), off);
  if (d === t) return 'Today';
  if (d === tomorrow) return 'Tomorrow';
  const x = shift(iso, off);
  return `${DAY[x.getUTCDay()]} ${x.getUTCDate()} ${MON[x.getUTCMonth()]}`;
}
export function whenLabel(iso: string, off: number): string {
  return `${dayLabel(iso, off)}, ${timeOf(iso, off)}`;
}
export function longDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${DAY_LONG[dt.getUTCDay()]} ${d} ${MON_LONG[m - 1]} ${y}`;
}
export function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`;
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
}
export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('') || '?';
}
export function minutesToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number) as [number, number];
  return h * 60 + m;
}
export function slugify(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}
