import { html, mount, $, $$ } from '../lib/html';
import { ic } from '../lib/icons';
import { api, ApiError } from '../lib/api';
import { ymd, MON_LONG, longDate } from '../lib/format';
import { emptyState, errorState } from '../lib/ui';
import { loadSettings, type Booking } from '../lib/store';
import { bookingCard, wireBookingCards, openNewBooking } from './bookings';
import { canManage } from '../lib/session';

export async function renderCalendar(view: HTMLElement): Promise<void> {
  const s = await loadSettings();
  const off = s.utcOffsetMinutes;
  const todayStr = ymd(new Date().toISOString(), off);
  let [y, m] = todayStr.split('-').map(Number) as [number, number];
  m -= 1;
  let selected = todayStr;

  mount(view, html`
    <div class="page-head"><div><h1>Calendar</h1><p>See your month at a glance and open any day.</p></div>${canManage() ? html`<button class="btn btn-primary" data-new>${ic('plus', 'ico-sm')} New booking</button>` : ''}</div>
    <div class="card card-pad"><div class="row between" style="margin-bottom:12px">
      <button class="btn btn-secondary btn-sm btn-icon" data-prev aria-label="Previous month">${ic('chevron-left', 'ico-sm')}</button>
      <h3 id="cal-title" aria-live="polite"></h3>
      <button class="btn btn-secondary btn-sm btn-icon" data-next aria-label="Next month">${ic('chevron-right', 'ico-sm')}</button></div>
      <div id="cal"></div></div>
    <h3 id="day-title" style="margin:24px 0 12px"></h3>
    <div id="day" class="stack"></div>`);
  $('[data-new]', view)?.addEventListener('click', () => void openNewBooking(() => void load()));

  let counts: Record<string, number> = {};
  let monthBookings: Booking[] = [];

  async function load(): Promise<void> {
    const first = Date.UTC(y, m, 1) - off * 60_000;
    const last = Date.UTC(y, m + 1, 1) - off * 60_000;
    try {
      const r = await api<{ bookings: Booking[] }>(`/api/bookings?limit=200&status=pending,confirmed,completed,no_show&from=${new Date(first).toISOString()}&to=${new Date(last).toISOString()}`);
      monthBookings = r.bookings;
      counts = {};
      for (const b of monthBookings) { const d = ymd(b.startsAt, off); counts[d] = (counts[d] ?? 0) + 1; }
      drawMonth(); drawDay();
    } catch (e) { mount($('#cal', view)!, errorState(e instanceof ApiError ? e.message : 'Could not load calendar')); $('[data-retry]', view)?.addEventListener('click', () => void load()); }
  }

  function drawMonth(): void {
    $('#cal-title', view)!.textContent = `${MON_LONG[m]} ${y}`;
    const firstDow = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const cells: string[] = [];
    for (let i = 0; i < firstDow; i++) cells.push('');
    for (let d = 1; d <= days; d++) cells.push(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    mount($('#cal', view)!, html`<div class="cal-grid">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => html`<div class="cal-head">${d}</div>`)}
      ${cells.map((c) => c ? html`<button class="cal-cell ${c === todayStr ? 'today' : ''}" data-d="${c}" aria-pressed="${c === selected}" aria-label="${longDate(c)}, ${counts[c] ?? 0} bookings"><b>${Number(c.slice(8))}</b>${counts[c] ? html`<span class="cal-count">${counts[c]} ${counts[c] === 1 ? 'booking' : 'bookings'}</span>` : ''}</button>` : html`<div class="cal-cell off"></div>`)}</div>`);
    $$('[data-d]', view).forEach((b) => b.addEventListener('click', () => { selected = b.dataset.d!; drawMonth(); drawDay(); }));
  }

  function drawDay(): void {
    $('#day-title', view)!.textContent = longDate(selected);
    const list = monthBookings.filter((b) => ymd(b.startsAt, off) === selected).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const host = $('#day', view)!;
    if (!list.length) { mount(host, html`<div class="card">${emptyState({ icon: 'calendar-days', title: 'No bookings this day', text: 'Nothing scheduled. Share your booking link to fill the day.' })}</div>`); return; }
    mount(host, html`<div class="stack" style="gap:14px;grid-template-columns:repeat(auto-fill,minmax(min(100%,360px),1fr))">${list.map(bookingCard)}</div>`);
    wireBookingCards(host, list, () => void load());
  }

  $('[data-prev]', view)!.addEventListener('click', () => { m--; if (m < 0) { m = 11; y--; } void load(); });
  $('[data-next]', view)!.addEventListener('click', () => { m++; if (m > 11) { m = 0; y++; } void load(); });
  await load();

}
