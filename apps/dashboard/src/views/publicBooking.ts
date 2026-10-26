import { html, mount, $, $$, type Raw } from '../lib/html';
import { ic } from '../lib/icons';
import { api, ApiError } from '../lib/api';
import { money, timeOf, DAY, MON, initials, ymd, whenLabel } from '../lib/format';
import { busy, toast } from '../lib/ui';
import { brand } from '../layouts';

interface Profile {
  business: { slug: string; name: string; type: string; phone: string | null; address: string | null };
  currency: string; deposit: { enabled: boolean; amountMinor: number };
  hours: { openMinutes: number; closeMinutes: number; daysOpen: number[]; utcOffsetMinutes: number; maxDaysAhead: number };
  paystackPublicKey: string | null;
  services: { id: string; name: string; description: string | null; durationMin: number; priceMinor: number }[];
  staff: { id: string; name: string; title: string | null }[];
}
interface PayInfo { ref: string; status: string; depositStatus: string; amountMinor: number; currency: string; email: string | null; startsAt: string; serviceName: string; paystackPublicKey: string | null }

let paystackP: Promise<void> | null = null;
const loadPaystack = (): Promise<void> => (paystackP ??= new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://js.paystack.co/v1/inline.js'; s.onload = () => res(); s.onerror = () => rej(new Error('blocked')); document.head.appendChild(s); }));

function head(name: string, sub: string): Raw {
  return html`<header class="public-head"><div class="row between"><div class="row"><span class="avatar red" style="border-radius:12px">${initials(name)}</span><div><b style="font-size:1.0625rem">${name}</b><div class="muted small">${sub}</div></div></div><span class="badge" title="Powered by ZexCore">${brand()}</span></div></header>`;
}

export async function renderPublicBooking(slug: string, payRef: string | null): Promise<void> {
  const root = document.getElementById('app')!;
  mount(root, html`<div class="public-wrap"><div class="skel" style="height:64px;margin:12px 0"></div><div class="skel" style="height:300px"></div></div>`);
  let p: Profile;
  try { p = await api<Profile>(`/api/public/${encodeURIComponent(slug)}`, { auth: false }); }
  catch (e) {
    mount(root, html`<div class="auth-wrap"><div class="auth-card" style="text-align:center"><div class="auth-logo">${brand('lg')}</div><h2>${e instanceof ApiError && e.status === 404 ? 'We couldn\'t find that business' : 'Something went wrong'}</h2><p class="muted" style="margin:8px 0 20px">${e instanceof ApiError && e.status === 404 ? 'Check the link you were given, or ask the business to resend it.' : 'Please try again in a moment.'}</p><a class="btn btn-primary" href="/" data-link>Go to ZexCore</a></div></div>`);
    return;
  }
  document.title = `Book with ${p.business.name}`;
  const off = p.hours.utcOffsetMinutes;
  const sub = [p.business.address, p.business.phone].filter(Boolean).join(' · ') || 'Online booking';

  const showReceipt = (ref: string, serviceName: string, startsAt: string, status: string, paid: boolean): void => {
    mount(root, html`<div class="public-wrap">${head(p.business.name, sub)}
      <div class="receipt"><span class="icon-tile" style="margin:0 auto 12px;background:${paid || status === 'confirmed' ? 'var(--success)' : 'var(--warning)'};color:#fff;border-radius:50%">${ic(paid || status === 'confirmed' ? 'check' : 'clock')}</span>
        <h2>${paid || status === 'confirmed' ? 'You\'re booked' : 'Request received'}</h2>
        <p class="muted" style="margin:6px 0 18px">${paid || status === 'confirmed' ? 'Your appointment is confirmed.' : 'The business will confirm your appointment shortly.'}</p>
        <div class="booking-meta" style="text-align:left"><div class="l"><span class="muted">Service</span><b>${serviceName}</b></div><div class="l"><span class="muted">When</span><b>${whenLabel(startsAt, off)}</b></div><div class="l"><span class="muted">Reference</span><span class="ref">${ref}</span></div>${p.business.address ? html`<div class="l"><span class="muted">Where</span><b>${p.business.address}</b></div>` : ''}</div>
        <p class="muted small" style="margin-top:16px">Save your reference. ${p.business.phone ? html`Questions? Call <a href="tel:${p.business.phone}" style="text-decoration:underline">${p.business.phone}</a>.` : ''}</p></div></div>`);
  };

  const pollPaid = async (payment: string): Promise<boolean> => {
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try { const s = await api<PayInfo>(`/api/public/${slug}/payments/${payment}`, { auth: false }); if (s.depositStatus === 'paid') { showReceipt(s.ref, s.serviceName, s.startsAt, s.status, true); return true; } } catch { /* keep polling */ }
    }
    return false;
  };
  const pay = async (key: string | null, ref: string, amount: number, currency: string, email: string, onFail: (m: string) => void): Promise<void> => {
    if (!key) { onFail('Online payment is not available right now. The business will contact you to arrange your deposit.'); return; }
    try {
      await loadPaystack();
      (window as any).PaystackPop.setup({
        key, email, amount, currency, ref,
        callback: () => { mount(root, html`<div class="auth-wrap"><div class="auth-card" style="text-align:center"><div class="spinner" style="margin:0 auto 14px"></div><h3>Confirming your payment…</h3><p class="muted small" style="margin-top:6px">This usually takes a few seconds.</p></div></div>`); void pollPaid(ref).then((ok) => { if (!ok) mount(root, html`<div class="auth-wrap"><div class="auth-card" style="text-align:center"><h3>Payment received</h3><p class="muted" style="margin:8px 0">We are still confirming it. You'll be contacted shortly. Reference <span class="mono">${ref}</span>.</p></div></div>`); }); },
        onClose: () => {},
      }).openIframe();
    } catch { onFail('Could not open the payment window. Disable ad blockers and try again.'); }
  };

  // ── Pay-link mode: a booking already exists, just collect the deposit ──
  if (payRef) {
    try {
      const s = await api<PayInfo>(`/api/public/${slug}/payments/${encodeURIComponent(payRef)}`, { auth: false });
      if (s.depositStatus === 'paid') { showReceipt(s.ref, s.serviceName, s.startsAt, s.status, true); return; }
      mount(root, html`<div class="public-wrap">${head(p.business.name, sub)}
        <div class="card card-pad stack"><h2>Secure your booking</h2>
          <div class="booking-meta"><div class="l"><span class="muted">Service</span><b>${s.serviceName}</b></div><div class="l"><span class="muted">When</span><b>${whenLabel(s.startsAt, off)}</b></div><div class="l"><span class="muted">Reference</span><span class="ref">${s.ref}</span></div></div>
          <div id="perr" class="alert alert-error hidden" role="alert"></div>
          <button class="btn btn-primary btn-lg btn-block" data-pay>${ic('lock', 'ico-sm')} Pay ${money(s.amountMinor, s.currency)} deposit</button>
          <p class="muted small" style="text-align:center">Secured by Paystack. The balance is settled at your appointment.</p></div></div>`);
      $('[data-pay]')!.addEventListener('click', (e) => void busy(e.currentTarget as HTMLButtonElement, () => pay(s.paystackPublicKey, payRef, s.amountMinor, s.currency, s.email || 'customer@zexcore.app', (m) => { const x = $('#perr')!; x.textContent = m; x.classList.remove('hidden'); })));
    } catch { mount(root, html`<div class="public-wrap">${head(p.business.name, sub)}<div class="card">${html`<div class="empty"><h3>This payment link is not valid</h3><p>Ask ${p.business.name} to send you a new one.</p></div>`}</div></div>`); }
    return;
  }

  // ── Booking flow ──
  const st = { serviceId: p.services[0]?.id ?? '', staffId: '', date: '', slot: '' };
  const today = ymd(new Date().toISOString(), off);
  const days: string[] = [];
  for (let i = 0; i < Math.min(p.hours.maxDaysAhead, 21); i++) days.push(ymd(new Date(Date.now() + i * 86_400_000).toISOString(), off));
  const open = (d: string) => p.hours.daysOpen.includes(new Date(d + 'T00:00:00Z').getUTCDay());
  st.date = days.find(open) ?? today;
  const svc = () => p.services.find((s) => s.id === st.serviceId);
  const needDeposit = p.deposit.enabled;
  const dep = () => { const s = svc(); const price = s?.priceMinor ?? 0; return needDeposit ? (price > 0 ? Math.min(p.deposit.amountMinor, price) : p.deposit.amountMinor) : 0; };

  if (!p.services.length) { mount(root, html`<div class="public-wrap">${head(p.business.name, sub)}<div class="card"><div class="empty"><h3>Bookings aren't open yet</h3><p>${p.business.name} hasn't added any services. Please check back soon.</p></div></div></div>`); return; }

  const draw = () => {
    mount(root, html`<div class="public-wrap">${head(p.business.name, sub)}
      <form id="bf" novalidate>
      <section class="pub-section"><h2 style="margin-top:8px">1. Choose a service <small></small></h2>
        <div class="stack-sm" role="radiogroup" aria-label="Service">${p.services.map((s) => html`<button type="button" class="option-card" role="radio" aria-checked="${s.id === st.serviceId}" data-svc="${s.id}"><span class="radio-dot">${ic('check')}</span><span class="grow"><b>${s.name}</b><br><span class="muted small">${s.durationMin} min${s.description ? ` · ${s.description}` : ''}</span></span><b class="num" style="color:var(--primary)">${s.priceMinor ? money(s.priceMinor, p.currency) : 'Free'}</b></button>`)}</div></section>
      ${p.staff.length ? html`<section class="pub-section"><h2>2. Choose who <small>Any available is fastest</small></h2>
        <div class="stack" style="grid-template-columns:1fr 1fr;gap:10px"><button type="button" class="option-card" role="radio" aria-checked="${st.staffId === ''}" data-staff="" style="background:${st.staffId === '' ? 'var(--primary-tint)' : '#fff'}"><span class="grow"><b>Any available</b><br><span class="muted small">Auto-assigned</span></span></button>
        ${p.staff.map((s) => html`<button type="button" class="option-card" role="radio" aria-checked="${s.id === st.staffId}" data-staff="${s.id}"><span class="avatar grey">${initials(s.name)}</span><span class="grow"><b>${s.name}</b><br><span class="muted small">${s.title ?? ''}</span></span></button>`)}</div></section>` : ''}
      <section class="pub-section"><h2>${p.staff.length ? 3 : 2}. Pick a date & time <small>${off === 60 ? 'WAT (GMT+1)' : ''}</small></h2>
        <div class="date-strip">${days.map((d) => { const dt = new Date(d + 'T00:00:00Z'); return html`<button type="button" class="date-chip" aria-pressed="${d === st.date}" data-date="${d}" ${open(d) ? '' : 'disabled'}><span>${DAY[dt.getUTCDay()]}</span><b>${dt.getUTCDate()}</b><span>${MON[dt.getUTCMonth()]}</span></button>`; })}</div>
        <div id="slots" class="slot-grid" style="margin-top:12px" aria-live="polite"></div></section>
      <section class="pub-section"><h2>${p.staff.length ? 4 : 3}. Your details</h2>
        <div class="card card-pad form-grid">
          <div class="field"><label for="cn">Full name</label><input class="input" id="cn" autocomplete="name" required maxlength="160"></div>
          <div class="field"><label for="cp">WhatsApp / mobile number</label><input class="input" id="cp" type="tel" autocomplete="tel" required placeholder="0803 123 4567"></div>
          <div class="field"><label for="ce">Email ${needDeposit ? '(for your receipt)' : html`<span class="faint">(optional)</span>`}</label><input class="input" id="ce" type="email" autocomplete="email" ${needDeposit ? 'required' : ''}></div>
        </div></section>
      ${needDeposit ? html`<section class="pub-section"><h2>${p.staff.length ? 5 : 4}. Secure your slot</h2><div class="notice">${ic('info')}<div><b>${money(dep(), p.currency)} refundable deposit</b> is required to hold your appointment.${svc() && svc()!.priceMinor > dep() ? html` The balance of <b>${money(svc()!.priceMinor - dep(), p.currency)}</b> is paid when you arrive.` : ''}</div></div></section>` : ''}
      <div id="berr" class="alert alert-error hidden" style="margin-top:16px" role="alert"></div>
      </form>
      <div class="pay-bar"><div><button class="btn btn-primary btn-lg btn-block" id="go">${needDeposit ? html`${ic('lock', 'ico-sm')} Pay ${money(dep(), p.currency)} deposit` : 'Request booking'}</button>
        ${needDeposit ? html`<p class="muted small" style="text-align:center;margin-top:6px">Secured by Paystack</p>` : ''}</div></div></div>`);

    $$('[data-svc]').forEach((b) => b.addEventListener('click', () => { st.serviceId = b.dataset.svc!; st.slot = ''; keep(); }));
    $$('[data-staff]').forEach((b) => b.addEventListener('click', () => { st.staffId = b.dataset.staff!; st.slot = ''; keep(); }));
    $$('[data-date]').forEach((b) => b.addEventListener('click', () => { st.date = b.dataset.date!; st.slot = ''; keep(); }));
    void loadSlots();
    $('#go')!.addEventListener('click', (e) => void submit(e.currentTarget as HTMLButtonElement));
  };
  const keep = () => { const v = { n: ($('#cn') as HTMLInputElement)?.value, p: ($('#cp') as HTMLInputElement)?.value, e: ($('#ce') as HTMLInputElement)?.value }; const y = window.scrollY; draw(); ($('#cn') as HTMLInputElement).value = v.n ?? ''; ($('#cp') as HTMLInputElement).value = v.p ?? ''; ($('#ce') as HTMLInputElement).value = v.e ?? ''; window.scrollTo(0, y); };

  async function loadSlots(): Promise<void> {
    const host = $('#slots')!;
    mount(host, html`<div class="skel" style="height:56px;grid-column:1/-1"></div>`);
    try {
      const q = new URLSearchParams({ date: st.date, serviceId: st.serviceId }); if (st.staffId) q.set('staffId', st.staffId);
      const r = await api<{ slots: { startsAt: string; available: boolean }[] }>(`/api/public/${slug}/availability?${q}`, { auth: false });
      if (!r.slots.length) { mount(host, html`<p class="muted" style="grid-column:1/-1">No times available on this day. Try another date.</p>`); return; }
      mount(host, html`${r.slots.map((s) => html`<button type="button" class="slot" data-t="${s.startsAt}" aria-pressed="${s.startsAt === st.slot}" ${s.available ? '' : 'disabled'}>${timeOf(s.startsAt, off)}<small>${s.available ? 'Available' : 'Booked'}</small></button>`)}`);
      $$('.slot:not(:disabled)', host).forEach((b) => b.addEventListener('click', () => { st.slot = b.dataset.t!; $$('.slot', host).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }));
    } catch { mount(host, html`<p class="err" style="grid-column:1/-1">Could not load times. Please refresh.</p>`); }
  }

  async function submit(btn: HTMLButtonElement): Promise<void> {
    const err = $('#berr')!; err.classList.add('hidden');
    const fail = (m: string) => { err.textContent = m; err.classList.remove('hidden'); err.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
    const name = ($('#cn') as HTMLInputElement).value.trim(), phone = ($('#cp') as HTMLInputElement).value.trim(), email = ($('#ce') as HTMLInputElement).value.trim();
    if (!st.slot) return fail('Please pick a time slot.');
    if (name.length < 2) return fail('Please enter your full name.');
    if (!phone) return fail('Please enter your phone number.');
    if (needDeposit && !/^\S+@\S+\.\S+$/.test(email)) return fail('Please enter a valid email for your receipt.');
    await busy(btn, async () => {
      try {
        const r = await api<{ booking: { ref: string; status: string; startsAt: string; serviceName: string }; payment: { reference: string; amountMinor: number; currency: string; email: string } | null }>(`/api/public/${slug}/bookings`, { method: 'POST', auth: false, body: { serviceId: st.serviceId, staffId: st.staffId || null, customerName: name, customerPhone: phone, customerEmail: email || null, startsAt: st.slot } });
        if (!r.payment) { showReceipt(r.booking.ref, r.booking.serviceName, r.booking.startsAt, r.booking.status, false); return; }
        await pay(p.paystackPublicKey, r.payment.reference, r.payment.amountMinor, r.payment.currency, r.payment.email, (m) => { showReceipt(r.booking.ref, r.booking.serviceName, r.booking.startsAt, r.booking.status, false); toast(m, 'info'); });
      } catch (e) { fail(e instanceof ApiError ? e.message : 'Could not complete your booking'); if (e instanceof ApiError && e.status === 409) void loadSlots(); }
    });
  }
  draw();
}
