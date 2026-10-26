import { ApiError } from '../lib/api';
import { html, mount, $ } from '../lib/html';
import { ic } from '../lib/icons';
import { ago } from '../lib/format';
import { emptyState, skeletonRows, confirmDialog } from '../lib/ui';
import { canManage, canAdmin } from '../lib/session';
import { api, toast, badge, pageHead, formModal, inp, fail, errMsg } from './shared';

interface Stage { id: string; name: string; position: number }
interface Lead { id: string; title: string; value: number | null; currency: string; stage_id: string; first_name: string | null; last_name: string | null; company: string | null; closed_at: string | null; close_reason?: string | null }
interface Contact { id: string; type: 'person' | 'company'; first_name: string | null; last_name: string | null; company: string | null; email: string | null; phone: string | null; created_at: string }

const cname = (c: { first_name: string | null; last_name: string | null; company: string | null }): string => [c.first_name, c.last_name].filter(Boolean).join(' ') || c.company || 'Unnamed';
const amount = (minor: number | null, cur: string): string => (minor == null ? '' : `${cur.trim() === 'NGN' ? '₦' : cur.trim() + ' '}${(minor / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`);

export async function renderCrm(view: HTMLElement): Promise<void> {
  let tab: 'pipeline' | 'contacts' = 'pipeline';
  mount(view, html`${pageHead('CRM', 'Track leads through your pipeline and keep your contacts in one place.',
    canManage() ? html`<div class="row"><button class="btn btn-secondary" data-contact>${ic('plus', 'ico-sm')} Contact</button><button class="btn btn-primary" data-lead>${ic('plus', 'ico-sm')} Lead</button></div>` : '')}
    <div class="chips" role="tablist" style="margin-bottom:16px"><button class="chip-btn" role="tab" data-tab="pipeline" aria-pressed="true">Pipeline</button><button class="chip-btn" role="tab" data-tab="contacts" aria-pressed="false">Contacts</button></div>
    <div id="body"></div>`);
  const host = $('#body', view)!;
  let stages: Stage[] = []; let contacts: Contact[] = [];

  const loadPipeline = async (): Promise<void> => {
    mount(host, html`<div class="card">${skeletonRows(3)}</div>`);
    try {
      const [s, l] = await Promise.all([api<{ stages: Stage[] }>('/api/crm/stages'), api<{ leads: Lead[] }>('/api/crm/leads?closed=false&limit=200')]);
      stages = s.stages;
      for (const x of l.leads) x.value = x.value == null ? null : Number(x.value); // BIGINT arrives as a string
      if (!stages.length) {
        mount(host, html`<div class="card">${emptyState({ icon: 'kanban', title: 'Set up your pipeline', text: 'Stages are the steps a lead moves through. Start with a standard set; you can add more later.', action: canAdmin() ? html`<button class="btn btn-primary" data-seed>Create standard stages</button>` : undefined })}</div>`);
        $('[data-seed]', host)?.addEventListener('click', async (ev) => {
          const b = ev.currentTarget as HTMLButtonElement; b.disabled = true;
          try { for (const [i, n] of ['New', 'Contacted', 'Proposal', 'Negotiation'].entries()) await api('/api/crm/stages', { method: 'POST', body: { name: n, position: i + 1, isDefault: i === 0 } }); void loadPipeline(); }
          catch (e) { toast(errMsg(e, 'Could not create stages'), 'error'); b.disabled = false; }
        });
        return;
      }
      mount(host, html`<div style="display:grid;grid-auto-flow:column;grid-auto-columns:minmax(260px,1fr);gap:14px;overflow-x:auto;padding-bottom:8px">
        ${stages.map((st) => { const items = l.leads.filter((x) => x.stage_id === st.id); const total = items.reduce((a, x) => a + (x.value ?? 0), 0); return html`<section class="card" style="align-self:start">
          <div class="card-head"><div><b>${st.name}</b><div class="muted small">${items.length} lead${items.length === 1 ? '' : 's'}${total ? ` · ${amount(total, items[0]?.currency ?? 'NGN')}` : ''}</div></div></div>
          <div class="stack" style="padding:12px">${items.length === 0 ? html`<p class="muted small" style="text-align:center;padding:12px 0">Nothing here</p>` : items.map((x) => html`<div class="card card-pad" style="box-shadow:none">
            <b>${x.title}</b><div class="muted small">${cname(x)}${x.value != null ? ` · ${amount(x.value, x.currency)}` : ''}</div>
            ${canManage() ? html`<div class="row" style="margin-top:10px;gap:6px;flex-wrap:wrap"><select class="input" style="height:34px;flex:1;min-width:110px" data-move="${x.id}" aria-label="Move ${x.title}">${stages.map((o) => html`<option value="${o.id}" ${o.id === x.stage_id ? 'selected' : ''}>${o.name}</option>`)}</select>
              <button class="btn btn-soft-danger btn-sm" data-lost="${x.id}" aria-label="Mark lost">Lost</button><button class="btn btn-success btn-sm" data-won="${x.id}">Won</button></div>` : ''}</div>`)}</div></section>`; })}</div>`);
      host.querySelectorAll<HTMLSelectElement>('[data-move]').forEach((sel) => sel.addEventListener('change', async () => {
        try { await api(`/api/crm/leads/${sel.dataset.move}/move`, { method: 'PATCH', body: { stageId: sel.value } }); void loadPipeline(); } catch (e) { toast(errMsg(e, 'Could not move the lead'), 'error'); }
      }));
      const close = (attr: 'won' | 'lost'): void => host.querySelectorAll<HTMLElement>(`[data-${attr}]`).forEach((b) => b.addEventListener('click', async () => {
        if (!await confirmDialog({ title: attr === 'won' ? 'Mark as won?' : 'Mark as lost?', message: 'The lead leaves the pipeline.', confirmLabel: attr === 'won' ? 'Mark won' : 'Mark lost', danger: attr === 'lost' })) return;
        try { await api(`/api/crm/leads/${b.getAttribute(`data-${attr}`)}/close`, { method: 'PATCH', body: { reason: attr } }); toast(attr === 'won' ? 'Marked as won' : 'Marked as lost', 'success'); void loadPipeline(); }
        catch (e) { toast(errMsg(e, 'Could not close the lead'), 'error'); }
      }));
      close('won'); close('lost');
    } catch (e) { mount(host, html`<div class="card">${fail(host, e, () => void loadPipeline(), 'Could not load your pipeline')}</div>`); }
  };

  const loadContacts = async (q = ''): Promise<void> => {
    if (!$('#cs', host)) mount(host, html`<div class="input-icon" style="margin-bottom:12px">${ic('search')}<input class="input" id="cs" type="search" placeholder="Search by name, company, email or phone" aria-label="Search contacts"></div><div class="card" id="ct"></div>`);
    const box = $('#ct', host)!;
    let t: number | undefined;
    const input = $('#cs', host) as HTMLInputElement;
    if (!input.dataset.bound) { input.dataset.bound = '1'; input.addEventListener('input', () => { clearTimeout(t); t = window.setTimeout(() => void loadContacts(input.value.trim()), 300); }); }
    mount(box, skeletonRows(3));
    try {
      contacts = (await api<{ contacts: Contact[] }>(`/api/crm/contacts?limit=200${q ? `&search=${encodeURIComponent(q)}` : ''}`)).contacts;
      mount(box, contacts.length === 0 ? emptyState({ icon: 'users', title: q ? 'No matches' : 'No contacts yet', text: q ? 'Try a different name or number.' : 'Add the people and companies you work with.' })
        : html`<div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Type</th><th>Email</th><th>Phone</th><th>Added</th></tr></thead><tbody>${contacts.map((c) => html`<tr><td><b>${cname(c)}</b>${c.company && c.type === 'person' ? html`<br><span class="muted small">${c.company}</span>` : ''}</td><td>${badge(c.type === 'company' ? 'Company' : 'Person', 'info')}</td><td>${c.email ?? '–'}</td><td>${c.phone ?? '–'}</td><td class="muted small">${ago(c.created_at)}</td></tr>`)}</tbody></table></div>`);
    } catch (e) { mount(box, fail(box, e, () => void loadContacts(q), 'Could not load contacts')); }
  };

  const show = (): void => { view.querySelectorAll<HTMLElement>('[data-tab]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === tab))); if (tab === 'pipeline') void loadPipeline(); else void loadContacts(); };
  view.querySelectorAll<HTMLElement>('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab as typeof tab; show(); }));

  $('[data-contact]', view)?.addEventListener('click', () => formModal({
    title: 'Add contact', submitLabel: 'Add contact',
    body: html`<div class="field"><label for="ky">Type</label><select class="input" id="ky"><option value="person">Person</option><option value="company">Company</option></select></div>
      <div class="form-grid two"><div class="field"><label for="kf">First name</label><input class="input" id="kf" maxlength="128"></div><div class="field"><label for="kl">Last name</label><input class="input" id="kl" maxlength="128"></div></div>
      <div class="field"><label for="kc">Company</label><input class="input" id="kc" maxlength="255"></div>
      <div class="form-grid two"><div class="field"><label for="ke">Email</label><input class="input" id="ke" type="email"></div><div class="field"><label for="kp">Phone</label><input class="input" id="kp" type="tel" maxlength="32"></div></div>`,
    submit: async (el) => {
      if (!inp(el, '#kf') && !inp(el, '#kl') && !inp(el, '#kc')) throw new ApiError(0, 'Enter a name or a company');
      const body: Record<string, unknown> = { type: inp(el, '#ky') };
      for (const [k, s] of [['firstName', '#kf'], ['lastName', '#kl'], ['company', '#kc'], ['email', '#ke'], ['phone', '#kp']] as const) if (inp(el, s)) body[k] = inp(el, s);
      await api('/api/crm/contacts', { method: 'POST', body }); toast('Contact added', 'success'); show();
    },
  }));

  $('[data-lead]', view)?.addEventListener('click', async () => {
    try {
      const [s, c] = await Promise.all([api<{ stages: Stage[] }>('/api/crm/stages'), api<{ contacts: Contact[] }>('/api/crm/contacts?limit=200')]);
      if (!s.stages.length) { toast('Set up your pipeline stages first', 'error'); tab = 'pipeline'; show(); return; }
      if (!c.contacts.length) { toast('Add a contact first, then create a lead for them', 'error'); return; }
      formModal({
        title: 'Add lead', submitLabel: 'Add lead',
        body: html`<div class="field"><label for="lt">Title</label><input class="input" id="lt" maxlength="255" required placeholder="Website redesign"></div>
          <div class="field"><label for="lc">Contact</label><select class="input" id="lc">${c.contacts.map((x) => html`<option value="${x.id}">${cname(x)}</option>`)}</select></div>
          <div class="form-grid two"><div class="field"><label for="ls">Stage</label><select class="input" id="ls">${s.stages.map((x) => html`<option value="${x.id}">${x.name}</option>`)}</select></div>
          <div class="field"><label for="lv">Value (₦)</label><input class="input" id="lv" type="number" min="0" step="1"></div></div>`,
        submit: async (el) => {
          if (!inp(el, '#lt')) throw new ApiError(0, 'Give the lead a title');
          const body: Record<string, unknown> = { title: inp(el, '#lt'), contactId: inp(el, '#lc'), stageId: inp(el, '#ls'), currency: 'NGN' };
          if (inp(el, '#lv')) body.value = Math.round(Number(inp(el, '#lv')) * 100);
          await api('/api/crm/leads', { method: 'POST', body }); toast('Lead added', 'success'); tab = 'pipeline'; show();
        },
      });
    } catch (e) { toast(errMsg(e, 'Could not open the form'), 'error'); }
  });
  show();
}
