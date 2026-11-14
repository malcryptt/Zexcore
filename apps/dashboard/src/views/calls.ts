/** Calls — customers who asked for a video call about a booking or an order. Confirm a time, and both sides are emailed 30 minutes before. */
import { html, mount, $, type Raw } from '../lib/html';
import { ic } from '../lib/icons';
import { ApiError } from '../lib/api';
import { whenLabel } from '../lib/format';
import { toast, openModal, confirmDialog, emptyState, errorState, skeletonRows, busy } from '../lib/ui';
import { offset, loadSettings } from '../lib/store';
import { canManage } from '../lib/session';
import { navigate } from '../router';
import { listCalls, respondToCall, type CallDto } from '../lib/fb/calls';

const err = (e: unknown, f: string): string => (e instanceof ApiError ? e.message : f);
/** A <input type=datetime-local> value is the business's local time; the Worker wants a real instant. */
const toInput = (iso: string, off: number): string => new Date(new Date(iso).getTime() + off * 60_000).toISOString().slice(0, 16);
const fromInput = (v: string, off: number): string => new Date(Date.parse(`${v}:00Z`) - off * 60_000).toISOString();

const badge = (s: CallDto['status']): Raw => ({
  requested: html`<span class="badge badge-warning"><span class="dot dot-warning"></span>Needs a time</span>`,
  scheduled: html`<span class="badge badge-info">${ic('video', 'ico-sm')}Scheduled</span>`,
  declined: html`<span class="badge">Declined</span>`, cancelled: html`<span class="badge">Cancelled</span>`,
  completed: html`<span class="badge badge-success">${ic('check', 'ico-sm')}Done</span>`,
}[s]);

function pickTime(c: CallDto, off: number): void {
  const start = toInput(c.scheduledAt ?? c.preferredAt ?? new Date(Date.now() + 86_400_000).toISOString(), off);
  const m = openModal({
    title: c.status === 'scheduled' ? 'Change the call time' : 'Confirm a call time',
    subtitle: `${c.customerName} · ${c.what}`,
    body: html`<div class="form-grid"><div id="ce" class="alert alert-error hidden"></div>
      ${c.preferredAt ? html`<p class="muted small">They asked for ${whenLabel(c.preferredAt, off)}. You can keep that or choose another time.</p>` : html`<p class="muted small">They did not choose a time.</p>`}
      <div class="field"><label for="ct">Call time</label><input class="input" id="ct" type="datetime-local" value="${start}"></div>
      <p class="muted small">${c.customerEmail ? 'They are emailed the time and a link to join.' : 'They gave no email, so please tell them the time yourself.'} Calls are about 30 minutes.</p></div>`,
    footer: html`<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" id="cc">Confirm time</button>`,
    onMount: (el, close) => {
      $('[data-close]', el)?.addEventListener('click', close);
      $('#cc', el)?.addEventListener('click', async (ev) => {
        const v = ($('#ct', el) as HTMLInputElement).value; const box = $('#ce', el)!;
        if (!v) { box.textContent = 'Choose a date and time.'; box.classList.remove('hidden'); return; }
        const ok = await busy(ev.currentTarget as HTMLButtonElement, async () => { try { await respondToCall(c.id, 'confirm', fromInput(v, off)); return true; } catch (e) { box.textContent = err(e, 'Could not save the time.'); box.classList.remove('hidden'); return false; } });
        if (ok) { close(); toast('Call scheduled. The customer has been emailed.', 'success'); void render(); }
      });
    },
  });
  void m;
}

let host: HTMLElement | null = null;
async function render(): Promise<void> {
  if (!host) return;
  const view = host;
  mount($('#calls-body', view)!, skeletonRows(3));
  try {
    const rows = await listCalls(); const off = offset(); const mgr = canManage();
    const open = rows.filter((r) => r.status === 'requested'), sched = rows.filter((r) => r.status === 'scheduled').sort((a, b) => String(a.scheduledAt).localeCompare(String(b.scheduledAt)));
    const past = rows.filter((r) => r.status !== 'requested' && r.status !== 'scheduled');
    const card = (r: CallDto): Raw => html`<article class="card card-pad stack" data-id="${r.id}" style="gap:10px">
      <div class="row between wrap"><div><b>${r.customerName}</b><div class="muted small">${r.what} · ${r.kind === 'order' ? 'Shop order' : 'Booking'}${r.customerPhone ? ` · ${r.customerPhone}` : ''}</div></div>${badge(r.status)}</div>
      ${r.status === 'scheduled' && r.scheduledAt ? html`<div class="row" style="gap:8px">${ic('calendar', 'ico-sm')}<b>${whenLabel(r.scheduledAt, off)}</b></div>` : r.preferredAt ? html`<div class="muted small">Prefers ${whenLabel(r.preferredAt, off)}</div>` : html`<div class="muted small">No preferred time</div>`}
      ${r.note ? html`<div class="muted small">“${r.note}”</div>` : ''}
      ${mgr ? html`<div class="row wrap" style="gap:8px">
        ${r.status === 'requested' ? html`<button class="btn btn-primary btn-sm" data-act="confirm">Confirm a time</button><button class="btn btn-secondary btn-sm" data-act="decline">Decline</button>` : ''}
        ${r.status === 'scheduled' ? html`<button class="btn btn-primary btn-sm" data-act="join">${ic('video', 'ico-sm')} Join</button><button class="btn btn-secondary btn-sm" data-act="confirm">Change time</button><button class="btn btn-secondary btn-sm" data-act="complete">Mark done</button><button class="btn btn-soft-danger btn-sm" data-act="cancel">Cancel</button>` : ''}
      </div>` : ''}</article>`;
    const sect = (title: string, list: CallDto[]): Raw => list.length ? html`<h3 style="margin:18px 0 8px">${title}</h3><div class="stack">${list.map(card)}</div>` : '' as unknown as Raw;
    mount($('#calls-body', view)!, rows.length ? html`${sect('Waiting for you', open)}${sect('Scheduled', sched)}${sect('Earlier', past)}`
      : emptyState({ icon: 'video', title: 'No call requests yet', text: 'When a customer asks for a call on a large booking or order, it shows up here. Switch call requests on in Settings.', action: html`<a class="btn btn-secondary btn-sm" href="/app/settings#meetings" data-link>Open Settings</a>` }));
    view.querySelectorAll<HTMLElement>('article[data-id]').forEach((el) => {
      const c = rows.find((x) => x.id === el.dataset.id)!;
      el.querySelectorAll<HTMLElement>('[data-act]').forEach((b) => b.addEventListener('click', async () => {
        const a = b.dataset.act;
        if (a === 'confirm') return pickTime(c, off);
        if (a === 'join') return navigate(`/app/meet/${c.id}`);
        const t = { decline: ['Decline this call?', 'The customer is told politely. Their booking or order is not affected.', 'Decline'], cancel: ['Cancel this call?', 'The customer is emailed that it is cancelled.', 'Cancel call'], complete: ['', '', ''] }[a as 'decline' | 'cancel' | 'complete'];
        if (a !== 'complete' && !await confirmDialog({ title: t[0], message: t[1], confirmLabel: t[2], danger: true })) return;
        await busy(b as HTMLButtonElement, async () => { try { await respondToCall(c.id, a as 'decline' | 'cancel' | 'complete'); toast('Done', 'success'); void render(); } catch (e) { toast(err(e, 'Could not update the call'), 'error'); } });
      }));
    });
  } catch (e) { mount($('#calls-body', view)!, errorState(err(e, 'Could not load your calls.'))); }
}

export async function renderCalls(view: HTMLElement): Promise<void> {
  host = view;
  await loadSettings();
  mount(view, html`<div class="page-head"><div><h1>Calls</h1><p>Customers who asked for a video call. Pick a time and they are emailed, then reminded 30 minutes before.</p></div></div><div id="calls-body"></div>`);
  await render();
}
