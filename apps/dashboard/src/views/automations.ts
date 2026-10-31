import { ApiError } from '../lib/api';
import { ago } from '../lib/format';
import { html, mount, $ } from '../lib/html';
import { ic } from '../lib/icons';
import { emptyState, skeletonRows, confirmDialog, openModal } from '../lib/ui';
import { canAdmin, canManage } from '../lib/session';
import { api, toast, badge, pageHead, formModal, inp, fail, errMsg } from './shared';

interface Rule {
  id: string; name: string; description: string | null; enabled: boolean; approved: boolean;
  trigger: { source: string } | string; conditions: unknown; actions: { type: string; message?: string; event?: string; path?: string; url?: string }[] | string;
}
const parse = <T,>(v: T | string): T => (typeof v === 'string' ? JSON.parse(v) as T : v);
const OPS: [string, string][] = [['eq', 'equals'], ['neq', 'does not equal'], ['gt', 'is above'], ['gte', 'is at least'], ['lt', 'is below'], ['lte', 'is at most'], ['contains', 'contains'], ['exists', 'is present']];

function status(r: Rule): { text: string; kind: 'success' | 'warning' | '' } {
  if (!r.approved) return { text: 'Needs approval', kind: 'warning' };
  return r.enabled ? { text: 'Active', kind: 'success' } : { text: 'Paused', kind: '' };
}
const summary = (r: Rule): string => {
  const a = parse(r.actions); const t = parse(r.trigger);
  const first = a[0]; const what = first ? (first.type === 'notify' ? `notify “${first.message ?? ''}”` : first.type === 'emit' ? `emit ${first.event}` : first.type === 'webhook' ? `call ${first.url}` : `set ${first.path}`) : 'no action';
  return `When ${t.source.replace(/^event:/, '')} → ${what}${a.length > 1 ? ` (+${a.length - 1} more)` : ''}`;
};

export async function renderAutomations(view: HTMLElement): Promise<void> {
  mount(view, html`${pageHead('Automations', 'Rules that react to things happening in your workspace. Every rule must be approved by an admin before it can run.',
    canManage() ? html`<div class="row"><button class="btn btn-secondary" data-ai>${ic('sparkles', 'ico-sm')} Draft with AI</button><button class="btn btn-primary" data-add>${ic('plus', 'ico-sm')} New rule</button></div>` : '')}
    <div class="card" id="rl"></div>`);
  const host = $('#rl', view)!;
  let rules: Rule[] = [];

  const load = async (): Promise<void> => {
    mount(host, skeletonRows(3));
    try {
      rules = (await api<{ rules: Rule[] }>('/api/rules?limit=200')).rules;
      if (!rules.length) {
        mount(host, emptyState({ icon: 'workflow', title: 'No rules yet', text: 'For example: when a lead worth more than $500 is created, notify the team.' }));
        return;
      }
      mount(host, html`<div class="list">${rules.map((r) => { const s = status(r); return html`<div class="list-item" style="align-items:flex-start;flex-wrap:wrap">
        <span class="icon-tile">${ic('workflow')}</span>
        <div class="grow" style="min-width:200px"><b>${r.name}</b> ${badge(s.text, s.kind)}<br><span class="muted small">${summary(r)}</span>${r.description ? html`<br><span class="muted small">${r.description}</span>` : ''}</div>
        <div class="row" style="gap:6px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" data-test="${r.id}">${ic('play', 'ico-sm')} Test</button>
          ${canAdmin() && !r.approved ? html`<button class="btn btn-primary btn-sm" data-approve="${r.id}">Approve</button>` : ''}
          ${canAdmin() && r.approved && r.enabled ? html`<button class="btn btn-secondary btn-sm" data-off="${r.id}">Pause</button>` : ''}
          ${canAdmin() && r.approved && !r.enabled ? html`<button class="btn btn-secondary btn-sm" data-on="${r.id}">Resume</button>` : ''}
          ${canManage() ? html`<button class="btn btn-ghost btn-sm" data-del="${r.id}" aria-label="Delete ${r.name}">${ic('trash-2', 'ico-sm')}</button>` : ''}
        </div></div>`; })}</div>`);
      const on = (attr: string, fn: (id: string) => void): void => host.querySelectorAll<HTMLElement>(`[data-${attr}]`).forEach((b) => b.addEventListener('click', () => fn(b.getAttribute(`data-${attr}`)!)));
      on('test', testRun); on('approve', (id) => void act(id, 'approve', 'Rule approved and active')); on('off', (id) => void act(id, 'disable', 'Rule paused')); on('on', (id) => void act(id, 'enable', 'Rule resumed')); on('del', (id) => void remove(id));
    } catch (e) { mount(host, fail(host, e, () => void load(), 'Could not load automations')); }
  };

  async function act(id: string, what: 'approve' | 'disable' | 'enable', msg: string): Promise<void> {
    try { await api(`/api/rules/${id}/${what}`, { method: 'POST' }); toast(msg, 'success'); void load(); }
    catch (e) { toast(errMsg(e, 'Could not update the rule'), 'error'); }
  }
  async function remove(id: string): Promise<void> {
    if (!await confirmDialog({ title: 'Delete this rule?', message: 'It stops running immediately.', confirmLabel: 'Delete', danger: true })) return;
    try { await api(`/api/rules/${id}`, { method: 'DELETE' }); toast('Rule deleted', 'success'); void load(); }
    catch (e) { toast(errMsg(e, 'Could not delete the rule'), 'error'); }
  }
  function testRun(id: string): void {
    const r = rules.find((x) => x.id === id)!;
    openModal({
      title: 'Test rule', subtitle: `${r.name}. A dry run: nothing is executed.`,
      body: html`<div class="field"><label for="tp">Sample event data (JSON)</label><textarea class="textarea mono" id="tp" rows="6">{ "lead": { "value": 600000 } }</textarea></div><div id="tr" style="margin-top:12px"></div>`,
      footer: html`<button class="btn btn-secondary" data-close>Close</button><button class="btn btn-primary" data-run>Run test</button>`,
      onMount: (el) => $('[data-run]', el)!.addEventListener('click', async () => {
        const out = $('#tr', el)!;
        let payload: unknown;
        try { payload = JSON.parse(inp(el, '#tp')); } catch { out.className = 'alert alert-error'; out.textContent = 'That is not valid JSON.'; return; }
        try {
          const x = await api<{ triggerPassed: boolean; conditionsPassed: boolean; wouldExecute: boolean }>(`/api/rules/${id}/test-run`, { method: 'POST', body: { payload } });
          out.className = x.wouldExecute ? 'alert alert-ok' : 'alert alert-info';
          out.textContent = x.wouldExecute ? 'This event would run the rule.' : !x.triggerPassed ? 'This event does not match the trigger filter.' : 'The conditions are not met, so the rule would not run.';
        } catch (e) { out.className = 'alert alert-error'; out.textContent = errMsg(e, 'Test failed'); }
      }),
    });
  }
  function create(): void {
    formModal({
      title: 'New rule', subtitle: 'Saved as a draft until an admin approves it.', submitLabel: 'Save draft',
      body: html`<div class="field"><label for="rn">Name</label><input class="input" id="rn" maxlength="128" required placeholder="Big lead alert"></div>
        <div class="field"><label for="rt">When this happens</label><input class="input mono" id="rt" required placeholder="bookings.booking.created" list="evs"><datalist id="evs"><option value="bookings.booking.created"><option value="crm.lead.created"><option value="iot.reading"><option value="iot.alert"></datalist><span class="hint">Pick an event: a booking or lead is created, a device reports, or an alert fires.</span></div>
        <div class="form-grid two"><div class="field"><label for="rf">Only if field <span class="faint">(optional)</span></label><input class="input mono" id="rf" placeholder="lead.value"></div>
        <div class="field"><label for="ro">Condition</label><select class="input" id="ro">${OPS.map(([v, l]) => html`<option value="${v}">${l}</option>`)}</select></div></div>
        <div class="field"><label for="rv">Value</label><input class="input" id="rv" placeholder="500000"></div>
        <div class="field"><label for="rm">Then notify with message</label><input class="input" id="rm" maxlength="512" required placeholder="New booking from {{booking.customerName}}"><span class="hint">Use {{field}} to insert details from the event.</span></div>
        <div class="field"><label for="rw">Also call this web address <span class="faint">(optional, https)</span></label><input class="input mono" id="rw" maxlength="300" placeholder="https://hooks.example.com/zexcore"></div>`,
      submit: async (el) => {
        const event = inp(el, '#rt').replace(/^event:/, '');
        if (!inp(el, '#rn') || !/^[a-z0-9_.]+$/.test(event) || !inp(el, '#rm')) throw new ApiError(0, 'Fill in the name, a valid event name (lowercase letters, numbers, dots) and a message');
        const field = inp(el, '#rf'), op = inp(el, '#ro'), raw = inp(el, '#rv');
        const body: Record<string, unknown> = { name: inp(el, '#rn'), trigger: { source: `event:${event}` }, actions: [{ type: 'notify', message: inp(el, '#rm') }, ...(inp(el, '#rw') ? [{ type: 'webhook', url: inp(el, '#rw') }] : [])] };
        if (field) body.conditions = { field, op, ...(op === 'exists' ? {} : { value: raw !== '' && !Number.isNaN(Number(raw)) ? Number(raw) : raw }) };
        await api('/api/rules', { method: 'POST', body }); toast('Draft saved. Ask an admin to approve it.', 'success'); void load();
      },
    });
  }
  function ai(): void {
    formModal({
      title: 'Draft a rule with AI', subtitle: 'Describe what should happen. You review it before it can run.', submitLabel: 'Draft rule',
      body: html`<div class="field"><label for="ai">What should happen?</label><textarea class="textarea" id="ai" rows="4" minlength="10" maxlength="1000" placeholder="when a lead worth more than $500 is created, notify the team"></textarea></div>`,
      submit: async (el) => {
        if (inp(el, '#ai').length < 10) throw new ApiError(0, 'Describe the rule in at least 10 characters');
        await api('/api/rules/ai-draft', { method: 'POST', body: { intent: inp(el, '#ai') } });
        toast('Draft created. Review and approve it.', 'success'); void load();
      },
    });
  }
  $('[data-add]', view)?.addEventListener('click', create);
  $('[data-ai]', view)?.addEventListener('click', ai);
  if (canAdmin()) {
    view.insertAdjacentHTML('beforeend', '<h3 style="margin:22px 0 8px;font-size:1rem">Recent activity</h3><div class="card" id="runs"></div>');
    try {
      const { runs } = await api<{ runs: { id: string; rule: string; event: string; outcome: string; detail: string; at: string }[] }>('/api/rules/runs');
      mount($('#runs', view)!, runs.length === 0 ? emptyState({ icon: 'history', title: 'Nothing has run yet', text: 'Each time an approved rule runs, what it did is recorded here.' })
        : html`<div class="list">${runs.map((r) => html`<div class="list-item"><span class="icon-tile">${ic('workflow')}</span><div class="grow"><b>${r.rule}</b><div class="muted small">${r.detail || r.event}</div></div>${badge(r.outcome === 'ok' ? 'Done' : r.outcome === 'partial' ? 'Partly done' : 'Failed', r.outcome === 'ok' ? 'success' : 'warning')}<span class="muted small nowrap">${ago(r.at)}</span></div>`)}</div>`);
    } catch { $('#runs', view)?.remove(); }
  }
  await load();
}
