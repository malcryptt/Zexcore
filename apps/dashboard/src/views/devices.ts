import { html, mount, $, $$, type Raw } from '../lib/html';
import { ic } from '../lib/icons';
import { api, ApiError } from '../lib/api';
import { ago } from '../lib/format';
import { toast, emptyState, errorState, skeletonRows, confirmDialog, copyText, openModal } from '../lib/ui';
import { formModal, inp } from './shared';
import { current, canAdmin } from '../lib/session';

const readOnlyNotice = (allowed: boolean): Raw => allowed ? html`` : html`<div class="alert alert-info" style="margin-bottom:16px">${ic('info', 'ico-sm')} Only owners and admins can change this.</div>`;

interface Device { id: string; device_key: string; name: string; kind: string; status: 'online' | 'offline' | 'unknown'; firmware_version: string | null; tags: string[] | null; last_seen_at: string | null; created_at: string }
interface Reading { device_id: string; metrics: Record<string, number | string | boolean>; recorded_at: string }
interface AlertRule { id: string; device_id: string | null; metric: string; op: string; threshold: number; severity: 'low' | 'medium' | 'high' | 'critical'; message: string | null; enabled: boolean }

const OPS: Record<string, string> = { gt: 'is above', gte: 'is at least', lt: 'is below', lte: 'is at most', eq: 'equals' };
const SEV: Record<string, string> = { low: '', medium: 'badge-info', high: 'badge-warning', critical: 'badge-primary' };
const apiOrigin = (): string => ((import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')) || location.origin;

export async function renderDevices(view: HTMLElement): Promise<void> {
  const can = canAdmin();
  let tab: 'devices' | 'alerts' = 'devices';
  mount(view, html`<div class="page-head"><div><h1>Devices</h1><p>Sensors and gateways that report to your workspace, with the alerts that watch them.</p></div>
    ${can ? html`<button class="btn btn-primary" data-add>${ic('plus', 'ico-sm')} Add device</button>` : ''}</div>
    ${readOnlyNotice(can)}
    <div class="chips" style="margin-bottom:12px"><button class="chip-btn" data-tab="devices" aria-pressed="true">Devices</button><button class="chip-btn" data-tab="alerts" aria-pressed="false">Alert rules</button></div>
    <div id="dv"></div>`);
  const host = $('#dv', view)!;
  const fail = (e: unknown, retry: () => void) => { mount(host, errorState(e instanceof ApiError ? e.message : 'Could not load devices')); $('[data-retry]', host)?.addEventListener('click', retry); };

  async function showDevices(): Promise<void> {
    mount(host, html`<div class="card">${skeletonRows(3)}</div>`);
    try {
      const [{ devices }, { latest }] = await Promise.all([
        api<{ devices: Device[] }>('/api/iot/devices?limit=200'),
        api<{ latest: Reading[] }>('/api/iot/telemetry/latest').catch(() => ({ latest: [] as Reading[] })),
      ]);
      if (!devices.length) { mount(host, html`<div class="card">${emptyState({ icon: 'cpu', title: 'No devices yet', text: 'Register a sensor or gateway to get a secure token it can use to send readings.', action: can ? html`<button class="btn btn-primary btn-sm" data-add2>${ic('plus', 'ico-sm')} Add device</button>` : html`` })}</div>`); $('[data-add2]', host)?.addEventListener('click', addDevice); return; }
      const online = devices.filter((d) => d.status === 'online').length;
      mount(host, html`<div class="kpi-row"><div class="kpi"><span class="muted small">Devices</span><b class="num">${devices.length}</b></div><div class="kpi"><span class="muted small">Online</span><b class="num">${online}</b></div></div>
        <div class="dev-grid">${devices.map((d) => deviceCard(d, latest.find((r) => r.device_id === d.id)))}</div>`);
      $$('[data-dev]', host).forEach((b) => b.addEventListener('click', () => { const d = devices.find((x) => x.id === b.dataset.dev); if (d) manage(d); }));
    } catch (e) { fail(e, () => void showDevices()); }
  }

  const deviceCard = (d: Device, r?: Reading): Raw => {
    const metrics = r ? Object.entries(r.metrics).slice(0, 4) : [];
    return html`<article class="dev-card"><div class="row between"><div class="row"><span class="icon-tile">${ic('cpu')}</span><div style="min-width:0"><b class="truncate">${d.name}</b><div class="muted small mono truncate">${d.device_key}</div></div></div>
      <span class="badge ${d.status === 'online' ? 'badge-success' : ''}"><span class="status-dot ${d.status === 'online' ? 'on' : ''}"></span>${d.status === 'unknown' ? 'No data yet' : d.status === 'online' ? 'Online' : 'Offline'}</span></div>
      ${metrics.length ? html`<div class="metric-row">${metrics.map(([k, v]) => html`<div class="metric"><span class="muted small">${k}</span><b class="num">${String(v)}</b></div>`)}</div><div class="muted small">Last reading ${ago(r!.recorded_at)}</div>` : html`<div class="muted small">${d.last_seen_at ? `Last seen ${ago(d.last_seen_at)}` : 'Waiting for its first reading.'}</div>`}
      <div class="row between"><span class="muted small">${d.kind}${d.firmware_version ? ` · v${d.firmware_version}` : ''}</span><button class="btn btn-secondary btn-sm" data-dev="${d.id}">Manage</button></div></article>`;
  };

  function addDevice(): void {
    formModal({
      title: 'Add a device', subtitle: 'You will get a one-time token for the device to send data with.', submitLabel: 'Register device',
      body: html`<div class="field"><label for="dn">Name</label><input class="input" id="dn" maxlength="128" placeholder="e.g. Cold room sensor" required></div>
        <div class="form-grid two"><div class="field"><label for="dk">Device ID</label><input class="input mono" id="dk" minlength="4" maxlength="64" placeholder="cold-room-1" required><span class="hint">Letters, numbers and dashes. Must be unique.</span></div>
        <div class="field"><label for="dt">Type</label><input class="input" id="dt" maxlength="64" placeholder="temperature_sensor" required></div></div>`,
      submit: async (el) => {
        const name = inp(el, '#dn'), deviceKey = inp(el, '#dk'), kind = inp(el, '#dt');
        if (!name || deviceKey.length < 4 || !kind) throw new ApiError(0, 'Fill in the name, a device ID of at least 4 characters, and a type');
        const r = await api<{ device: Device; token: string }>('/api/iot/devices', { method: 'POST', body: { name, deviceKey, kind } });
        toast('Device registered', 'success'); showToken(r.device, r.token); void refresh();
      },
    });
  }

  function showToken(d: Device, token: string): void {
    const sample = `curl -X POST ${apiOrigin()}/api/iot/ingest \\\n  -H "x-tenant-id: ${current()?.tenant.id ?? ''}" \\\n  -H "x-device-token: ${token}" \\\n  -H "content-type: application/json" \\\n  -d '{"metrics":{"temperature":4.2}}'`;
    openModal({
      title: 'Device token', subtitle: `Copy this now for ${d.name}. It is shown once and cannot be recovered.`,
      body: html`<div class="stack"><div class="copy-box"><code>${token}</code><button class="btn btn-secondary btn-sm" data-copy-token>${ic('copy', 'ico-sm')} Copy</button></div>
        <div><b class="small">Send a reading</b><div class="codeblock" style="margin-top:6px">${sample}</div></div></div>`,
      footer: html`<button class="btn btn-primary" data-close>I have saved it</button>`,
      onMount: (el) => $('[data-copy-token]', el)!.addEventListener('click', () => copyText(token)),
    });
  }

  function manage(d: Device): void {
    formModal({
      title: d.name, subtitle: `${d.device_key} · ${d.kind}`, submitLabel: can ? 'Save name' : 'Close',
      body: html`<div class="field"><label for="mn">Name</label><input class="input" id="mn" maxlength="128" value="${d.name}" ${can ? '' : 'disabled'}></div>
        ${can ? html`<div class="row" style="flex-wrap:wrap"><button type="button" class="btn btn-secondary btn-sm" data-rotate>${ic('rotate-cw', 'ico-sm')} New token</button><button type="button" class="btn btn-soft-danger btn-sm" data-remove>${ic('trash-2', 'ico-sm')} Remove device</button></div>` : ''}`,
      submit: async (el) => {
        const name = inp(el, '#mn');
        if (can && name && name !== d.name) { await api(`/api/iot/devices/${d.id}`, { method: 'PATCH', body: { name } }); toast('Saved', 'success'); void refresh(); }
      },
    });
    queueMicrotask(() => {
      const overlay = Array.from(document.querySelectorAll<HTMLElement>('.overlay')).pop();
      if (!overlay) return;
      const closeIt = () => { overlay.remove(); document.body.style.overflow = ''; };
      $('[data-rotate]', overlay)?.addEventListener('click', async () => {
        if (!(await confirmDialog({ title: 'Issue a new token?', message: 'The old token stops working immediately. Update the device before it next reports.', confirmLabel: 'Issue new token' }))) return;
        try { const r = await api<{ token: string }>(`/api/iot/devices/${d.id}/rotate-token`, { method: 'POST' }); closeIt(); showToken(d, r.token); }
        catch (e) { toast(e instanceof ApiError ? e.message : 'Could not issue a new token', 'error'); }
      });
      $('[data-remove]', overlay)?.addEventListener('click', async () => {
        if (!(await confirmDialog({ title: `Remove ${d.name}?`, message: 'Its readings and alert rules are deleted too. This cannot be undone.', confirmLabel: 'Remove device', danger: true }))) return;
        try { await api(`/api/iot/devices/${d.id}`, { method: 'DELETE' }); toast('Device removed', 'success'); closeIt(); void refresh(); }
        catch (e) { toast(e instanceof ApiError ? e.message : 'Could not remove the device', 'error'); }
      });
    });
  }

  async function showAlerts(): Promise<void> {
    mount(host, html`<div class="card">${skeletonRows(3)}</div>`);
    try {
      const [{ alerts }, { devices }] = await Promise.all([api<{ alerts: AlertRule[] }>('/api/iot/alerts'), api<{ devices: Device[] }>('/api/iot/devices?limit=200')]);
      const name = (id: string | null) => devices.find((d) => d.id === id)?.name ?? 'Any device';
      const bar = can ? html`<div class="row" style="justify-content:flex-end;margin-bottom:12px"><button class="btn btn-primary btn-sm" data-add-alert ${devices.length ? '' : 'disabled'}>${ic('plus', 'ico-sm')} New alert rule</button></div>` : html``;
      if (!alerts.length) { mount(host, html`${bar}<div class="card">${emptyState({ icon: 'siren', title: 'No alert rules', text: devices.length ? 'Get flagged when a reading crosses a limit, for example temperature above 8.' : 'Add a device first, then set limits for its readings.' })}</div>`); }
      else mount(host, html`${bar}<div class="card list">${alerts.map((a) => html`<div class="list-item"><span class="icon-tile">${ic('siren')}</span><div class="grow"><b>${name(a.device_id)}: ${a.metric} ${OPS[a.op] ?? a.op} ${a.threshold}</b><div class="muted small">${a.message ?? 'No custom message'}</div></div><span class="badge ${SEV[a.severity] ?? ''}">${a.severity}</span></div>`)}</div>`);
      $('[data-add-alert]', host)?.addEventListener('click', () => addAlert(devices));
    } catch (e) { fail(e, () => void showAlerts()); }
  }

  function addAlert(devices: Device[]): void {
    formModal({
      title: 'New alert rule', submitLabel: 'Create rule',
      body: html`<div class="field"><label for="ad">Device</label><select class="select" id="ad">${devices.map((d) => html`<option value="${d.id}">${d.name}</option>`)}</select></div>
        <div class="form-grid two"><div class="field"><label for="am">Reading</label><input class="input" id="am" maxlength="64" placeholder="temperature" required></div>
        <div class="field"><label for="ao">When it</label><select class="select" id="ao">${Object.entries(OPS).map(([k, v]) => html`<option value="${k}">${v}</option>`)}</select></div></div>
        <div class="form-grid two"><div class="field"><label for="at">Value</label><input class="input" id="at" type="number" step="any" required></div>
        <div class="field"><label for="as">Severity</label><select class="select" id="as"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div></div>
        <div class="field"><label for="ax">Message <span class="faint">optional</span></label><input class="input" id="ax" maxlength="255" placeholder="Cold room too warm"></div>`,
      submit: async (el) => {
        const metric = inp(el, '#am'), t = inp(el, '#at'); if (!metric || t === '' || Number.isNaN(Number(t))) throw new ApiError(0, 'Enter the reading name and a number');
        const message = inp(el, '#ax');
        await api('/api/iot/alerts', { method: 'POST', body: { deviceId: inp(el, '#ad'), metric, op: inp(el, '#ao'), threshold: Number(t), severity: inp(el, '#as'), ...(message ? { message } : {}) } });
        toast('Alert rule created', 'success'); void refresh();
      },
    });
  }

  const refresh = async (): Promise<void> => {
    $$('[data-tab]', view).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === tab)));
    await (tab === 'devices' ? showDevices() : showAlerts());
  };
  $$('[data-tab]', view).forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab as typeof tab; void refresh(); }));
  $('[data-add]', view)?.addEventListener('click', addDevice);
  await refresh();
}
