import { html, mount, $, $$ } from '../lib/html';
import { ic } from '../lib/icons';
import { api, ApiError } from '../lib/api';
import { money, ago } from '../lib/format';
import { toast, emptyState, errorState, skeletonRows, busy } from '../lib/ui';
import { current, loadMe, canAdmin } from '../lib/session';

interface PlanList { currencyRates: { NGN_PER_USD: number }; paystackPublicKey: string | null; plans: { tier: string; monthlyUsd: number; annualUsd: number }[] }
interface Payment { reference: string; tier: string; cycle: string; currency: string; amount_minor: string | number; paid_minor: string | number | null; status: string; gateway: string | null; created_at: string; paid_at: string | null }
const BLURB: Record<string, string> = { starter: 'For a single location getting started.', growth: 'For growing businesses with a busy calendar.', agency: 'For operators running several locations.', enterprise: 'For large organisations with advanced needs.', dedicated: 'Dedicated infrastructure and a named support contact.' };

let paystackP: Promise<void> | null = null;
function loadPaystack(): Promise<void> {
  paystackP ??= new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://js.paystack.co/v1/inline.js'; s.onload = () => res(); s.onerror = () => rej(new Error('blocked')); document.head.appendChild(s); });
  return paystackP;
}

export async function renderBilling(view: HTMLElement): Promise<void> {
  const me = current()!;
  let cycle: 'monthly' | 'annual' = 'monthly';
  mount(view, html`<div class="page-head"><div><h1>Plan & billing</h1><p>Current plan: <b style="text-transform:capitalize">${me.tenant.tier}</b>${me.tenant.plan_expires_at ? ` · renews ${new Date(me.tenant.plan_expires_at).toISOString().slice(0, 10)}` : ''}</p></div>
    <div class="chips"><button class="chip-btn" data-c="monthly" aria-pressed="true">Monthly</button><button class="chip-btn" data-c="annual" aria-pressed="false">Annual · 2 months free</button></div></div>
    <div id="plans" class="stack" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr))"></div>
    <h3 style="margin:28px 0 12px">Payment history</h3><div class="card" id="pay"></div>`);
  let plans: PlanList;
  try { plans = await api<PlanList>('/api/billing/plans', { auth: false }); }
  catch (e) { mount($('#plans', view)!, errorState(e instanceof ApiError ? e.message : 'Could not load plans')); return; }

  const draw = () => {
    $$('[data-c]', view).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === cycle)));
    mount($('#plans', view)!, html`${plans.plans.map((p) => {
      const usd = cycle === 'annual' ? p.annualUsd : p.monthlyUsd;
      const ngn = Math.round(usd * plans.currencyRates.NGN_PER_USD * 100);
      const cur = me.tenant.tier === p.tier;
      return html`<section class="card card-pad stack-sm" style="${cur ? 'border:2px solid var(--primary);padding:19px' : ''}">
        <div class="row between"><h3 style="text-transform:capitalize">${p.tier}</h3>${cur ? html`<span class="badge badge-primary">Current</span>` : ''}</div>
        <div><span style="font-size:1.75rem;font-weight:700;letter-spacing:-.02em" class="num">${money(ngn, 'NGN')}</span><span class="muted small"> / ${cycle === 'annual' ? 'year' : 'month'}</span></div>
        <p class="muted small">${BLURB[p.tier]}</p>
        ${canAdmin() ? html`<button class="btn ${cur ? 'btn-secondary' : 'btn-primary'} btn-block" data-buy="${p.tier}" ${cur ? 'disabled' : ''}>${cur ? 'Your plan' : 'Choose plan'}</button>` : ''}</section>`;
    })}`);
    $$('[data-buy]', view).forEach((b) => b.addEventListener('click', () => void checkout(b.dataset.buy!, b as HTMLButtonElement)));
  };
  $$('[data-c]', view).forEach((b) => b.addEventListener('click', () => { cycle = b.dataset.c as typeof cycle; draw(); }));

  async function checkout(tier: string, btn: HTMLButtonElement): Promise<void> {
    if (!plans.paystackPublicKey) { toast('Online payments are not enabled on this server yet.', 'error'); return; }
    await busy(btn, async () => {
      try {
        const intent = await api<{ reference: string; amountMinor: number; currency: string }>('/api/billing/checkout', { method: 'POST', body: { tier, cycle, currency: 'NGN' } });
        await loadPaystack();
        const pop = (window as any).PaystackPop.setup({
          key: plans.paystackPublicKey, email: me.user.email, amount: intent.amountMinor, currency: intent.currency, ref: intent.reference,
          callback: () => { toast('Payment received. Activating your plan…', 'success'); void settle(); },
          onClose: () => {},
        });
        pop.openIframe();
      } catch (e) { toast(e instanceof ApiError ? e.message : 'Could not start checkout', 'error'); }
    });
  }
  async function settle(): Promise<void> {
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const me2 = await loadMe(true);
      if (me2 && me2.tenant.tier !== me.tenant.tier) { toast(`Plan updated to ${me2.tenant.tier}`, 'success'); void renderBilling(view); return; }
    }
    toast('Payment is still being confirmed. Refresh in a minute.', 'info');
  }
  draw();

  const ph = $('#pay', view)!;
  mount(ph, skeletonRows(2));
  try {
    const { payments } = await api<{ payments: Payment[] }>('/api/billing/payments');
    mount(ph, payments.length === 0 ? emptyState({ icon: 'receipt', title: 'No payments yet', text: 'Your receipts appear here after you choose a plan.' }) : html`<div class="table-wrap"><table class="table"><thead><tr><th>Reference</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>${payments.map((p) => html`<tr><td class="mono">${p.reference.slice(0, 22)}…</td><td style="text-transform:capitalize">${p.tier} · ${p.cycle}</td><td class="num">${money(Number(p.amount_minor), p.currency)}</td><td><span class="badge ${p.status === 'paid' ? 'badge-success' : p.status === 'mismatch' ? 'badge-warning' : ''}">${p.status}</span></td><td class="muted">${ago(p.created_at)}</td></tr>`)}</tbody></table></div>`);
  } catch (e) { mount(ph, errorState(e instanceof ApiError ? e.message : 'Could not load payments', false)); }
}

interface Entry { seq: number; action: string; entity: string; entity_id: string | null; principal_type: string; created_at: string; hash: string }
export async function renderAudit(view: HTMLElement): Promise<void> {
  mount(view, html`<div class="page-head"><div><h1>Audit log</h1><p>Every important change is recorded in a hash-chained log that cannot be edited.</p></div><button class="btn btn-secondary" data-verify>${ic('shield-check', 'ico-sm')} Verify integrity</button></div>
    <div id="vr" class="hidden" style="margin-bottom:16px"></div><div class="card" id="al"></div>`);
  const host = $('#al', view)!;
  mount(host, skeletonRows(4));
  try {
    const { entries } = await api<{ entries: Entry[] }>('/api/audit-log?limit=100');
    mount(host, entries.length === 0 ? emptyState({ icon: 'history', title: 'Nothing recorded yet', text: 'Actions like signups, settings changes and payments appear here.' }) : html`<div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>Action</th><th>Entity</th><th>Actor</th><th>When</th></tr></thead><tbody>${entries.map((e) => html`<tr><td class="mono muted">${e.seq}</td><td><b>${e.action}</b></td><td class="muted">${e.entity}${e.entity_id ? html` <span class="mono">${String(e.entity_id).slice(0, 12)}</span>` : ''}</td><td class="muted">${e.principal_type}</td><td class="muted">${ago(e.created_at)}</td></tr>`)}</tbody></table></div>`);
  } catch (e) { mount(host, errorState(e instanceof ApiError ? e.message : 'Could not load the audit log')); }
  $('[data-verify]', view)!.addEventListener('click', (ev) => void busy(ev.currentTarget as HTMLButtonElement, async () => {
    const box = $('#vr', view)!;
    try {
      const r = await api<{ valid: boolean; total: number; brokenSeq: number | null; reason: string | null; headHash: string | null }>('/api/audit-log/verify');
      box.className = r.valid ? 'alert alert-ok' : 'alert alert-error';
      mount(box, r.valid ? html`${ic('circle-check', 'ico-sm')}<span><b>Chain verified.</b> ${r.total} entries recomputed inside the database with no gaps or edits.${r.headHash ? html` Head <span class="mono">${r.headHash.slice(0, 16)}…</span>` : ''}</span>` : html`${ic('triangle-alert', 'ico-sm')}<span><b>Integrity problem at entry ${r.brokenSeq}.</b> ${r.reason}</span>`);
    } catch (e) { toast(e instanceof ApiError ? e.message : 'Verification failed', 'error'); }
  }));
}
