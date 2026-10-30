import { ApiError } from '../lib/api';
import { html, mount, $, type Raw } from '../lib/html';
import { ic } from '../lib/icons';
import { ago } from '../lib/format';
import { emptyState, skeletonRows, confirmDialog } from '../lib/ui';
import { canAdmin, canManage } from '../lib/session';
import { api, toast, badge, pageHead, formModal, inp, fail, errMsg } from './shared';

type Tab = 'retention' | 'erasure' | 'consent' | 'access';
interface Policy { id: string; entity: string; retention_days: number; action: string; enabled: boolean; last_run_at: string | null }
interface Erasure { id: string; subject_id: string; status: string; requested_at: string; completed_at?: string | null }
interface Consent { id: string; subject_id: string; purpose: string; legal_basis: string; granted_at: string; revoked_at: string | null }
interface Access { id: string; subject_id: string | null; entity: string; action?: string; accessed_at: string; actor_id?: string | null }

const ENTITIES: Record<string, string> = { messages: 'Messages', bookings: 'Past bookings' };
const BASIS: [string, string][] = [['consent', 'Consent'], ['contract', 'Contract'], ['legal_obligation', 'Legal obligation'], ['vital_interests', 'Vital interests'], ['legitimate_interests', 'Legitimate interests']];

export async function renderCompliance(view: HTMLElement): Promise<void> {
  let tab: Tab = 'retention';
  mount(view, html`${pageHead('Data protection', 'Retention, erasure requests, consent and access records for the personal data you hold (NDPA and GDPR style duties).')}
    <div class="chips" role="tablist" style="margin-bottom:16px">${(['retention', 'erasure', 'consent', 'access'] as Tab[]).map((t) => html`<button class="chip-btn" role="tab" data-tab="${t}" aria-pressed="${t === tab}">${{ retention: 'Retention', erasure: 'Erasure', consent: 'Consent', access: 'Access logs' }[t]}</button>`)}</div>
    <div id="cb"></div>`);
  const host = $('#cb', view)!;
  const card = (inner: Raw): Raw => html`<div class="card">${inner}</div>`;

  const retention = async (): Promise<void> => {
    mount(host, card(skeletonRows(2)));
    try {
      const { policies } = await api<{ policies: Policy[] }>('/api/compliance/retention');
      mount(host, html`<div class="row" style="justify-content:flex-end;gap:8px;margin-bottom:12px">${canAdmin() ? html`<button class="btn btn-secondary" data-run>${ic('rotate-cw', 'ico-sm')} Run now</button><button class="btn btn-primary" data-pol>${ic('plus', 'ico-sm')} Set policy</button>` : ''}</div>
        ${card(policies.length === 0 ? emptyState({ icon: 'database', title: 'No retention policies', text: 'Decide how long data is kept. Older records are removed when a policy runs.' })
          : html`<div class="table-wrap"><table class="table"><thead><tr><th>Data</th><th>Keep for</th><th>Status</th><th>Last run</th></tr></thead><tbody>${policies.map((p) => html`<tr><td><b>${ENTITIES[p.entity] ?? p.entity}</b></td><td>${p.retention_days} days</td><td>${badge(p.enabled ? 'On' : 'Off', p.enabled ? 'success' : '')}</td><td class="muted small">${p.last_run_at ? ago(p.last_run_at) : 'Never'}</td></tr>`)}</tbody></table></div>`)}`);
      $('[data-pol]', host)?.addEventListener('click', () => formModal({
        title: 'Retention policy', submitLabel: 'Save policy',
        body: html`<div class="field"><label for="re">Data</label><select class="input" id="re">${Object.entries(ENTITIES).map(([v, l]) => html`<option value="${v}">${l}</option>`)}</select></div>
          <div class="field"><label for="rd">Keep for (days)</label><input class="input" id="rd" type="number" min="1" max="3650" value="365"></div>
          <label class="check"><input type="checkbox" id="ron" checked> Enabled</label>`,
        submit: async (el) => {
          const days = Number(inp(el, '#rd')); if (!Number.isInteger(days) || days < 1 || days > 3650) throw new ApiError(0, 'Enter between 1 and 3650 days');
          await api('/api/compliance/retention', { method: 'POST', body: { entity: inp(el, '#re'), retentionDays: days, action: 'hard_delete', enabled: ($('#ron', el) as HTMLInputElement).checked } });
          toast('Policy saved', 'success'); void retention();
        },
      }));
      $('[data-run]', host)?.addEventListener('click', async () => {
        if (!await confirmDialog({ title: 'Run retention now?', message: 'Records older than each enabled policy are permanently deleted.', confirmLabel: 'Run now', danger: true })) return;
        try { const r = await api<{ summary: { entity: string; purged: number }[] }>('/api/compliance/retention/run', { method: 'POST' }); toast(`Done. ${r.summary.reduce((a, x) => a + x.purged, 0)} records removed.`, 'success'); void retention(); }
        catch (e) { toast(errMsg(e, 'Run failed'), 'error'); }
      });
    } catch (e) { mount(host, card(fail(host, e, () => void retention(), 'Could not load retention policies'))); }
  };

  const erasure = async (): Promise<void> => {
    mount(host, card(skeletonRows(2)));
    try {
      const { requests } = await api<{ requests: Erasure[] }>('/api/compliance/erasure');
      mount(host, html`<div class="row" style="justify-content:flex-end;margin-bottom:12px"><button class="btn btn-primary" data-new>${ic('plus', 'ico-sm')} New request</button></div>
        ${card(requests.length === 0 ? emptyState({ icon: 'clipboard-list', title: 'No erasure requests', text: 'Record a person’s right-to-be-forgotten request here, then carry it out once verified.' })
          : html`<div class="list">${requests.map((r) => html`<div class="list-item"><span class="icon-tile">${ic('clipboard-list')}</span><div class="grow"><b class="mono">${r.subject_id}</b><br><span class="muted small">Requested ${ago(r.requested_at)}</span></div>${badge(r.status, r.status === 'completed' ? 'success' : r.status === 'pending' ? 'warning' : '')}${canAdmin() && r.status === 'pending' ? html`<button class="btn btn-soft-danger btn-sm" data-exec="${r.id}">Carry out</button>` : ''}</div>`)}</div>`)}`);
      $('[data-new]', host)!.addEventListener('click', () => formModal({
        title: 'Erasure request', submitLabel: 'Record request',
        body: html`<div class="field"><label for="es">Phone or email</label><input class="input mono" id="es" required placeholder="Phone number or email"></div><div class="field"><label for="er">Reason <span class="faint">(optional)</span></label><input class="input" id="er" maxlength="255"></div>`,
        submit: async (el) => { if (!inp(el, '#es')) throw new ApiError(0, 'Enter who the request is for'); const b: Record<string, unknown> = { subjectId: inp(el, '#es') }; if (inp(el, '#er')) b.reason = inp(el, '#er'); await api('/api/compliance/erasure', { method: 'POST', body: b }); toast('Request recorded', 'success'); void erasure(); },
      }));
      host.querySelectorAll<HTMLElement>('[data-exec]').forEach((b) => b.addEventListener('click', async () => {
        if (!await confirmDialog({ title: 'Carry out this erasure?', message: 'This permanently erases the person’s data and cannot be undone.', confirmLabel: 'Erase data', danger: true })) return;
        try { await api(`/api/compliance/erasure/${b.dataset.exec}/execute`, { method: 'POST' }); toast('Erasure completed', 'success'); void erasure(); }
        catch (e) { toast(errMsg(e, 'Could not carry out the erasure'), 'error'); }
      }));
    } catch (e) { mount(host, card(fail(host, e, () => void erasure(), 'Could not load erasure requests'))); }
  };

  const consent = (): void => {
    mount(host, html`<form class="card card-pad" id="cf" style="margin-bottom:16px"><div class="row" style="gap:8px;flex-wrap:wrap"><input class="input grow" id="cs" placeholder="Phone number or email" aria-label="Subject ID" style="min-width:220px"><button class="btn btn-primary">Look up</button>${canManage() ? html`<button type="button" class="btn btn-secondary" data-rec>${ic('plus', 'ico-sm')} Record consent</button>` : ''}</div></form><div id="cr"></div>`);
    const look = async (id: string): Promise<void> => {
      const box = $('#cr', host)!; mount(box, card(skeletonRows(2)));
      try {
        const { consents } = await api<{ consents: Consent[] }>(`/api/compliance/consent/${encodeURIComponent(id)}`);
        mount(box, card(consents.length === 0 ? emptyState({ icon: 'scale', title: 'No consent on record', text: 'Nothing has been recorded for this subject.' })
          : html`<div class="list">${consents.map((c) => html`<div class="list-item"><span class="icon-tile">${ic('scale')}</span><div class="grow"><b>${c.purpose}</b><br><span class="muted small">${BASIS.find(([v]) => v === c.legal_basis)?.[1] ?? c.legal_basis} · granted ${ago(c.granted_at)}</span></div>${c.revoked_at ? badge('Revoked') : badge('Active', 'success')}${canManage() && !c.revoked_at ? html`<button class="btn btn-ghost btn-sm" data-rev="${c.purpose}">Revoke</button>` : ''}</div>`)}</div>`));
        box.querySelectorAll<HTMLElement>('[data-rev]').forEach((b) => b.addEventListener('click', async () => {
          try { await api('/api/compliance/consent/revoke', { method: 'POST', body: { subjectId: id, purpose: b.dataset.rev } }); toast('Consent revoked', 'success'); void look(id); } catch (e) { toast(errMsg(e, 'Could not revoke'), 'error'); }
        }));
      } catch (e) { mount(box, card(fail(box, e, () => void look(id), 'Could not look up consent'))); }
    };
    $('#cf', host)!.addEventListener('submit', (ev) => { ev.preventDefault(); const v = ($('#cs', host) as HTMLInputElement).value.trim(); if (v) void look(v); });
    $('[data-rec]', host)?.addEventListener('click', () => formModal({
      title: 'Record consent', submitLabel: 'Record',
      body: html`<div class="field"><label for="ks">Phone or email</label><input class="input mono" id="ks" required value="${($('#cs', host) as HTMLInputElement).value}"></div><div class="field"><label for="kp">Purpose</label><input class="input" id="kp" maxlength="128" required placeholder="Appointment reminders"></div>
        <div class="field"><label for="kb">Legal basis</label><select class="input" id="kb">${BASIS.map(([v, l]) => html`<option value="${v}">${l}</option>`)}</select></div>`,
      submit: async (el) => { if (!inp(el, '#ks') || inp(el, '#kp').length < 2) throw new ApiError(0, 'Enter the subject and a purpose'); await api('/api/compliance/consent', { method: 'POST', body: { subjectId: inp(el, '#ks'), purpose: inp(el, '#kp'), legalBasis: inp(el, '#kb') } }); toast('Consent recorded', 'success'); void look(inp(el, '#ks')); },
    }));
  };

  const access = async (): Promise<void> => {
    mount(host, card(skeletonRows(3)));
    try {
      const { accessLogs } = await api<{ accessLogs: Access[] }>('/api/compliance/access-logs?limit=100');
      mount(host, card(accessLogs.length === 0 ? emptyState({ icon: 'eye', title: 'No activity yet', text: 'Retention runs, erasures and consent changes are recorded here.' })
        : html`<div class="table-wrap"><table class="table"><thead><tr><th>When</th><th>Action</th><th>Subject</th></tr></thead><tbody>${accessLogs.map((a) => html`<tr><td class="muted small">${ago(a.accessed_at)}</td><td>${a.entity}</td><td class="mono small">${a.subject_id ?? '–'}</td></tr>`)}</tbody></table></div>`));
    } catch (e) { mount(host, card(fail(host, e, () => void access(), 'Could not load access logs'))); }
  };

  const show = (): void => { view.querySelectorAll<HTMLElement>('[data-tab]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === tab))); void ({ retention, erasure, consent: async () => consent(), access }[tab]()); };
  view.querySelectorAll<HTMLElement>('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab as Tab; show(); }));
  show();
}
