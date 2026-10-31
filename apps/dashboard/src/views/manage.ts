import { html, mount, $, $$, type Raw } from '../lib/html';
import { ic, type IconName } from '../lib/icons';
import { api, ApiError } from '../lib/api';
import { money, initials, minutesToTime, timeToMinutes } from '../lib/format';
import { toast, openModal, emptyState, errorState, skeletonRows, busy, copyText } from '../lib/ui';
import { loadSettings, bookingUrl, type Service, type Staff } from '../lib/store';
import { canAdmin, current, logout } from '../lib/session';
import { navigate } from '../router';

const ro = (): Raw => canAdmin() ? html`` : html`<div class="alert alert-info" style="margin-bottom:16px">${ic('info', 'ico-sm')} Only owners and admins can change these settings.</div>`;

export function renderMore(view: HTMLElement): void {
  const items: { href: string; icon: IconName; t: string; s: string }[] = [
    { href: '/app/customers', icon: 'users', t: 'Customers', s: 'Everyone who has booked' },
    { href: '/app/services', icon: 'list-checks', t: 'Services', s: 'What you offer, how long, how much' },
    { href: '/app/team', icon: 'id-card', t: 'Team', s: 'Doctors, stylists and staff' },
    { href: '/app/booking-page', icon: 'link', t: 'Booking page', s: 'Your public link to share' },
    { href: '/app/crm', icon: 'handshake', t: 'CRM', s: 'Leads, pipeline and contacts' },
    { href: '/app/devices', icon: 'cpu', t: 'Devices', s: 'Sensors, readings and alerts' },
    { href: '/app/automations', icon: 'workflow', t: 'Automations', s: 'Rules that react to events' },
    { href: '/app/content', icon: 'globe', t: 'Website pages', s: 'Draft and publish page content' },
    { href: '/app/compliance', icon: 'scale', t: 'Data protection', s: 'Consent, erasure and retention' },
    { href: '/app/billing', icon: 'credit-card', t: 'Plan & billing', s: 'Your subscription and payments' },
    { href: '/app/security', icon: 'shield-check', t: 'Security', s: 'Password and signed-in devices' },
    { href: '/app/audit', icon: 'history', t: 'Audit log', s: 'Tamper-evident record of changes' },
    { href: '/app/settings', icon: 'settings', t: 'Settings', s: 'Hours, deposits and business details' },
  ];
  const me = current()!;
  mount(view, html`<div class="page-head"><div><h1>More</h1><p>${me.tenant.name}</p></div></div>
    <div class="card list">${items.map((i) => html`<a class="list-item hover" href="${i.href}" data-link><span class="icon-tile">${ic(i.icon)}</span><span class="grow"><b>${i.t}</b><br><span class="muted small">${i.s}</span></span>${ic('chevron-right')}</a>`)}</div>
    <button class="btn btn-secondary btn-block" style="margin-top:16px" data-out>${ic('log-out', 'ico-sm')} Sign out</button>`);
  $('[data-out]', view)!.addEventListener('click', () => { logout(); navigate('/signin'); });
}

// ── Services ─────────────────────────────────────────────────────────────────
export async function renderServices(view: HTMLElement): Promise<void> {
  mount(view, html`<div class="page-head"><div><h1>Services</h1><p>What customers can book.</p></div>${canAdmin() ? html`<button class="btn btn-primary" data-add>${ic('plus', 'ico-sm')} Add service</button>` : ''}</div>${ro()}<div class="card" id="l"></div>`);
  const host = $('#l', view)!;
  const load = async () => {
    mount(host, skeletonRows(3));
    try {
      const { services } = await api<{ services: Service[] }>('/api/bookings/services');
      if (!services.length) { mount(host, emptyState({ icon: 'list-checks', title: 'No services yet', text: 'Add what you offer, for example “Consultation, 30 min, $10”.', action: canAdmin() ? html`<button class="btn btn-primary btn-sm" data-add2>${ic('plus', 'ico-sm')} Add service</button>` : undefined })); $('[data-add2]', host)?.addEventListener('click', () => edit()); return; }
      mount(host, html`<div class="list">${services.map((s) => html`<div class="list-item"><span class="icon-tile">${ic('list-checks')}</span><div class="grow"><b>${s.name}</b> ${s.active ? '' : html`<span class="badge">Hidden</span>`}<div class="muted small">${s.durationMin} min · ${money(s.priceMinor)}${s.description ? ` · ${s.description}` : ''}</div></div>${canAdmin() ? html`<button class="btn btn-secondary btn-sm" data-edit="${s.id}">Edit</button>` : ''}</div>`)}</div>`);
      host.querySelectorAll<HTMLElement>('[data-edit]').forEach((b) => b.addEventListener('click', () => edit(services.find((s) => s.id === b.dataset.edit))));
    } catch (e) { mount(host, errorState(e instanceof ApiError ? e.message : 'Could not load services')); $('[data-retry]', host)?.addEventListener('click', () => void load()); }
  };
  function edit(s?: Service): void {
    openModal({
      title: s ? 'Edit service' : 'Add service',
      body: html`<form class="form-grid"><div id="se" class="alert alert-error hidden"></div>
        <div class="field"><label for="sn">Name</label><input class="input" id="sn" required maxlength="120" value="${s?.name ?? ''}"></div>
        <div class="form-grid two"><div class="field"><label for="sd">Duration (minutes)</label><input class="input" id="sd" type="number" min="5" max="480" value="${s?.durationMin ?? 30}"></div>
        <div class="field"><label for="sp">Price ($)</label><input class="input" id="sp" type="number" min="0" value="${s ? s.priceMinor / 100 : 0}"></div></div>
        <div class="field"><label for="sx">Description <span class="faint">(optional)</span></label><input class="input" id="sx" maxlength="500" value="${s?.description ?? ''}"></div>
        ${s ? html`<label class="check"><input type="checkbox" id="sa" ${s.active ? 'checked' : ''}> Show on my booking page</label>` : ''}</form>`,
      footer: html`<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" data-save>Save</button>`,
      onMount: (el, close) => $('[data-save]', el)!.addEventListener('click', () => void busy($('[data-save]', el) as HTMLButtonElement, async () => {
        const body: Record<string, unknown> = { name: ($('#sn', el) as HTMLInputElement).value.trim(), durationMin: Number(($('#sd', el) as HTMLInputElement).value), priceMinor: Math.round(Number(($('#sp', el) as HTMLInputElement).value) * 100), description: ($('#sx', el) as HTMLInputElement).value.trim() };
        if (s) body.active = ($('#sa', el) as HTMLInputElement).checked;
        try { await api(s ? `/api/bookings/services/${s.id}` : '/api/bookings/services', { method: s ? 'PATCH' : 'POST', body }); toast('Saved', 'success'); close(); void load(); }
        catch (x) { const e = $('#se', el)!; e.textContent = x instanceof ApiError ? x.message : 'Could not save'; e.classList.remove('hidden'); }
      })),
    });
  }
  $('[data-add]', view)?.addEventListener('click', () => edit());
  await load();
}

// ── Team ─────────────────────────────────────────────────────────────────────
export async function renderTeam(view: HTMLElement): Promise<void> {
  mount(view, html`<div class="page-head"><div><h1>Team</h1><p>People customers can book with. Leave empty if you take bookings yourself.</p></div>${canAdmin() ? html`<button class="btn btn-primary" data-add>${ic('plus', 'ico-sm')} Add person</button>` : ''}</div>${ro()}<div class="card" id="l"></div>`);
  const host = $('#l', view)!;
  const load = async () => {
    mount(host, skeletonRows(2));
    try {
      const { staff } = await api<{ staff: Staff[] }>('/api/bookings/staff');
      if (!staff.length) { mount(host, emptyState({ icon: 'id-card', title: 'No team members yet', text: 'Without staff, each time slot can be booked once. Add people to run parallel appointments.' })); return; }
      mount(host, html`<div class="list">${staff.map((s) => html`<div class="list-item"><span class="avatar ${s.active ? 'green' : 'grey'}">${initials(s.name)}</span><div class="grow"><b>${s.name}</b> ${s.active ? '' : html`<span class="badge">Inactive</span>`}<div class="muted small">${s.title ?? 'No title'}</div></div>${canAdmin() ? html`<button class="btn btn-secondary btn-sm" data-edit="${s.id}">Edit</button>` : ''}</div>`)}</div>`);
      host.querySelectorAll<HTMLElement>('[data-edit]').forEach((b) => b.addEventListener('click', () => edit(staff.find((s) => s.id === b.dataset.edit))));
    } catch (e) { mount(host, errorState(e instanceof ApiError ? e.message : 'Could not load team')); $('[data-retry]', host)?.addEventListener('click', () => void load()); }
  };
  function edit(s?: Staff): void {
    openModal({
      title: s ? 'Edit person' : 'Add person',
      body: html`<form class="form-grid"><div id="te" class="alert alert-error hidden"></div><div class="field"><label for="tn">Name</label><input class="input" id="tn" required maxlength="120" value="${s?.name ?? ''}"></div><div class="field"><label for="tt">Title <span class="faint">(optional)</span></label><input class="input" id="tt" maxlength="120" placeholder="e.g. General Medicine" value="${s?.title ?? ''}"></div>${s ? html`<label class="check"><input type="checkbox" id="ta" ${s.active ? 'checked' : ''}> Available for bookings</label>` : ''}</form>`,
      footer: html`<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" data-save>Save</button>`,
      onMount: (el, close) => $('[data-save]', el)!.addEventListener('click', () => void busy($('[data-save]', el) as HTMLButtonElement, async () => {
        const body: Record<string, unknown> = { name: ($('#tn', el) as HTMLInputElement).value.trim(), title: ($('#tt', el) as HTMLInputElement).value.trim() };
        if (s) body.active = ($('#ta', el) as HTMLInputElement).checked;
        try { await api(s ? `/api/bookings/staff/${s.id}` : '/api/bookings/staff', { method: s ? 'PATCH' : 'POST', body }); toast('Saved', 'success'); close(); void load(); }
        catch (x) { const e = $('#te', el)!; e.textContent = x instanceof ApiError ? x.message : 'Could not save'; e.classList.remove('hidden'); }
      })),
    });
  }
  $('[data-add]', view)?.addEventListener('click', () => edit());
  await load();
}

// ── Booking page ─────────────────────────────────────────────────────────────
export async function renderBookingPage(view: HTMLElement): Promise<void> {
  const s = await loadSettings();
  const url = bookingUrl();
  const msg = `Book an appointment with ${s.publicName ?? current()!.tenant.name}: ${url}`;
  mount(view, html`<div class="page-head"><div><h1>Booking page</h1><p>The page your customers use to pick a service, choose a time and pay a deposit.</p></div></div>
    <div class="card card-pad stack">
      <div class="field"><label>Your link</label><div class="copy-box"><code>${url}</code><button class="btn btn-secondary btn-sm" data-copy>${ic('copy', 'ico-sm')} Copy</button></div></div>
      <div class="row wrap">
        <a class="btn btn-primary" href="${url}" target="_blank" rel="noopener noreferrer">${ic('external-link', 'ico-sm')} Open page</a>
        <a class="btn btn-secondary" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener noreferrer">${ic('message-circle', 'ico-sm')} Share on WhatsApp</a>
      </div>
      <div class="alert alert-info">${ic('info', 'ico-sm')}<span>Deposits are ${s.depositEnabled ? html`<b>on</b> (${money(s.depositMinor, s.currency)} per booking)` : html`<b>off</b>`}. Change this in <a href="/app/settings" data-link style="text-decoration:underline">Settings</a>.</span></div>
    </div>`);
  $('[data-copy]', view)!.addEventListener('click', () => copyText(url));
}

// ── Settings ─────────────────────────────────────────────────────────────────
export async function renderSettings(view: HTMLElement): Promise<void> {
  const s = await loadSettings(true);
  const me = current()!;
  const dis = canAdmin() ? '' : 'disabled';
  mount(view, html`<div class="page-head"><div><h1>Settings</h1><p>Business details, opening hours and deposit rules.</p></div></div>${ro()}
    <form id="st" class="stack-lg" novalidate>
      <div id="st-err" class="alert alert-error hidden" role="alert"></div>
      <section class="card card-pad form-grid"><h3>Business</h3>
        <div class="field"><label for="pn">Business name</label><input class="input" id="pn" maxlength="255" value="${s.publicName ?? me.tenant.name}" ${dis}></div>
        <div class="form-grid two"><div class="field"><label for="ph">Phone / WhatsApp</label><input class="input" id="ph" type="tel" value="${s.phone ?? ''}" ${dis}></div><div class="field"><label for="ad">Address</label><input class="input" id="ad" maxlength="500" value="${s.address ?? ''}" ${dis}></div></div></section>
      <section class="card card-pad form-grid"><h3>Opening hours</h3>
        <div class="form-grid two"><div class="field"><label for="op">Opens</label><input class="input" id="op" type="time" value="${minutesToTime(s.openMinutes)}" ${dis}></div><div class="field"><label for="cl">Closes</label><input class="input" id="cl" type="time" value="${minutesToTime(s.closeMinutes)}" ${dis}></div></div>
        <div class="field"><label>Open days</label><div class="day-pills">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => html`<label><input type="checkbox" name="day" value="${i}" ${s.daysOpen.includes(i) ? 'checked' : ''} ${dis}><span>${d}</span></label>`)}</div></div>
        <div class="form-grid two"><div class="field"><label for="sl">Slot length (minutes)</label><select class="select" id="sl" ${dis}>${[15, 20, 30, 45, 60].map((n) => html`<option value="${n}" ${n === s.slotMinutes ? 'selected' : ''}>${n}</option>`)}</select></div>
        <div class="field"><label for="ld">Minimum notice (hours)</label><input class="input" id="ld" type="number" min="0" max="168" value="${s.leadMinutes / 60}" ${dis}></div></div></section>
      <section class="card card-pad form-grid" id="payout"><h3>Where deposits are paid</h3><p class="muted small">Loading…</p></section>
      <section class="card card-pad form-grid"><div class="row between"><div><h3>Upfront deposit</h3><p class="muted small">Customers pay this by card through Paystack to secure their slot. The money goes straight to your bank account below.</p></div><label class="switch"><input type="checkbox" id="dep" ${s.depositEnabled ? 'checked' : ''} ${dis} aria-label="Require deposit"><span></span></label></div>
        <div class="field"><label for="fx">Exchange rate (₦ per $1)</label><input class="input" id="fx" type="number" min="100" max="100000" step="0.01" value="${s.exchangeRate ?? 1500}" ${dis}><span class="hint">Your prices are in US dollars. Customers pay by card in naira, converted at this rate. Change it whenever the market moves; it applies to every payment for your business, not to ZexCore plan prices.</span></div>
        <div class="field" id="depf"><label for="depn">Deposit per booking ($)</label><input class="input" id="depn" type="number" min="0" value="${s.depositMinor / 100}" ${dis}></div></section>
      ${canAdmin() ? html`<div><button class="btn btn-primary btn-lg" type="submit">Save changes</button></div>` : ''}
    </form>
    <section class="card card-pad stack-sm" style="margin-top:20px"><h3>Account</h3><div class="muted small">Signed in as <b>${me.user.email}</b> · role <b>${me.role}</b></div><div class="muted small">Workspace <span class="mono">${me.tenant.slug}</span> · plan <b style="text-transform:capitalize">${me.tenant.tier}</b></div></section>`);
  void paintPayout(view, s.depositEnabled);
  const form = $('#st', view) as HTMLFormElement;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    void busy(form.querySelector('button[type=submit]'), async () => {
      const err = $('#st-err', view)!; err.classList.add('hidden');
      const days = $$('input[name=day]:checked', view).map((i) => Number((i as HTMLInputElement).value));
      try {
        await api('/api/bookings/settings', { method: 'PUT', body: {
          publicName: ($('#pn') as HTMLInputElement).value.trim(), phone: ($('#ph') as HTMLInputElement).value.trim(), address: ($('#ad') as HTMLInputElement).value.trim(),
          openMinutes: timeToMinutes(($('#op') as HTMLInputElement).value), closeMinutes: timeToMinutes(($('#cl') as HTMLInputElement).value), daysOpen: days,
          slotMinutes: Number(($('#sl') as HTMLSelectElement).value), leadMinutes: Math.round(Number(($('#ld') as HTMLInputElement).value) * 60),
          exchangeRate: Number(($('#fx') as HTMLInputElement).value), depositEnabled: ($('#dep') as HTMLInputElement).checked, depositMinor: Math.round(Number(($('#depn') as HTMLInputElement).value) * 100),
        } });
        await loadSettings(true); toast('Settings saved', 'success');
      } catch (x) { err.textContent = x instanceof ApiError ? x.message : 'Could not save'; err.classList.remove('hidden'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });
  });
}

interface PayoutInfo { setUp: boolean; bankName: string | null; accountName: string | null; last4: string | null }
async function paintPayout(view: HTMLElement, depositsOn: boolean): Promise<void> {
  const box = $('#payout', view); if (!box) return;
  let p: PayoutInfo;
  try { p = await api<PayoutInfo>('/api/payout'); } catch { box.innerHTML = ''; return; }
  const show = (editing: boolean): void => {
    if (p.setUp && !editing) {
      mount(box, html`<div class="row between wrap" style="gap:12px"><div><h3>Where deposits are paid</h3><p class="muted small">${p.accountName} · ${p.bankName ?? 'Bank'} · account ending ${p.last4}</p></div>${canAdmin() && current()?.role === 'owner' ? html`<button class="btn btn-secondary btn-sm" type="button" id="po-edit">Change account</button>` : ''}</div>`);
      $('#po-edit', box)?.addEventListener('click', () => show(true));
      return;
    }
    if (current()?.role !== 'owner') { mount(box, html`<h3>Where deposits are paid</h3><p class="muted small">${depositsOn ? 'Deposits are on.' : 'The workspace owner has not added a bank account yet.'} Only the owner can add or change it.</p>`); return; }
    mount(box, html`<h3>Where deposits are paid</h3><p class="muted small">Add the bank account that should receive deposits. We check the account name with your bank before saving.</p>
      <div id="po-err" class="alert alert-error hidden" role="alert"></div>
      <div class="form-grid two"><div class="field"><label for="po-bank">Bank</label><select class="select" id="po-bank"><option value="">Loading banks…</option></select></div>
      <div class="field"><label for="po-acct">Account number</label><input class="input" id="po-acct" inputmode="numeric" maxlength="10" placeholder="10 digits" autocomplete="off"></div></div>
      <div class="row" style="gap:8px"><button class="btn btn-primary" type="button" id="po-save">Verify and save</button>${p.setUp ? html`<button class="btn btn-ghost" type="button" id="po-cancel">Cancel</button>` : ''}</div>`);
    const sel = $('#po-bank', box) as HTMLSelectElement;
    void api<{ banks: { name: string; code: string }[] }>('/api/payout/banks').then((r) => {
      sel.innerHTML = '<option value="">Choose your bank</option>' + r.banks.map((b) => `<option value="${b.code}">${b.name.replace(/[<>&"]/g, '')}</option>`).join('');
    }).catch((e) => { sel.innerHTML = '<option value="">Banks unavailable</option>'; const er = $('#po-err', box)!; er.textContent = e instanceof ApiError ? e.message : 'Could not load banks.'; er.classList.remove('hidden'); });
    $('#po-cancel', box)?.addEventListener('click', () => show(false));
    $('#po-save', box)?.addEventListener('click', (ev) => {
      void busy(ev.currentTarget as HTMLButtonElement, async () => {
        const er = $('#po-err', box)!; er.classList.add('hidden');
        try {
          const r = await api<{ accountName: string; last4: string }>('/api/payout', { method: 'POST', body: { bankCode: sel.value, bankName: sel.selectedOptions[0]?.textContent ?? '', accountNumber: ($('#po-acct', box) as HTMLInputElement).value.trim() } });
          p = { setUp: true, bankName: sel.selectedOptions[0]?.textContent ?? null, accountName: r.accountName, last4: r.last4 };
          toast(`Saved. Deposits will be paid to ${r.accountName}.`, 'success'); show(false);
        } catch (x) { er.textContent = x instanceof ApiError ? x.message : 'Could not save the account.'; er.classList.remove('hidden'); }
      });
    });
  };
  show(false);
}
