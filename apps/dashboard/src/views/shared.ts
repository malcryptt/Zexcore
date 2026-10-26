import { html, type Raw } from '../lib/html';
import { api, ApiError } from '../lib/api';
import { toast, openModal, busy, errorState } from '../lib/ui';
import { $ } from '../lib/html';

export const errMsg = (e: unknown, fallback = 'Something went wrong'): string => (e instanceof ApiError ? e.message : fallback);

export function badge(text: string, kind: 'success' | 'warning' | 'primary' | 'info' | '' = ''): Raw {
  return html`<span class="badge ${kind ? `badge-${kind}` : ''}">${text}</span>`;
}

export const pageHead = (title: string, sub: string, action: Raw | string = ''): Raw =>
  html`<div class="page-head"><div><h1>${title}</h1><p>${sub}</p></div>${action}</div>`;

export const inp = (el: HTMLElement, sel: string): string => (($(sel, el) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null)?.value ?? '').trim();

export function fail(host: HTMLElement, e: unknown, retry: () => void, fallback: string): Raw {
  const r = errorState(errMsg(e, fallback));
  queueMicrotask(() => host.querySelector('[data-retry]')?.addEventListener('click', retry));
  return r;
}

/** Modal with a single form: validates nothing itself, shows the server's message inline. */
export function formModal(opts: {
  title: string; subtitle?: string; body: Raw; submitLabel: string;
  submit: (el: HTMLElement) => Promise<void>;
}): void {
  openModal({
    title: opts.title, subtitle: opts.subtitle,
    body: html`<form class="form-grid" novalidate><div data-ferr class="alert alert-error hidden"></div>${opts.body}</form>`,
    footer: html`<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" data-go>${opts.submitLabel}</button>`,
    onMount: (el, close) => {
      const go = $('[data-go]', el) as HTMLButtonElement;
      const run = (): void => void busy(go, async () => {
        const box = $('[data-ferr]', el)!;
        box.classList.add('hidden');
        try { await opts.submit(el); close(); }
        catch (x) { box.textContent = errMsg(x, 'Could not save'); box.classList.remove('hidden'); }
      });
      go.addEventListener('click', run);
      $('form', el)!.addEventListener('submit', (ev) => { ev.preventDefault(); run(); });
    },
  });
}

export { api, toast };
