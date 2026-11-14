/** The "would you like a video call?" choice on the public booking and shop pages. The customer can accept or say no thanks; nothing is required. */
import { html, $, type Raw } from './html';
import { ic } from './icons';

/** `off` is the business's UTC offset in minutes: the time the customer picks is read as the business's local time. */
export function callBlock(id: string, intro: string, init: { yes: boolean; at: string } = { yes: false, at: '' }): Raw {
  return html`<section class="card card-pad form-grid" id="${id}" style="margin-top:12px"><h3>${ic('video', 'ico-sm')} Would you like a video call?</h3>
    <p class="muted small">${intro}</p>
    <label class="check"><input type="radio" name="${id}-want" value="no" ${init.yes ? '' : 'checked'}> No thanks</label>
    <label class="check"><input type="radio" name="${id}-want" value="yes" ${init.yes ? 'checked' : ''}> Request a call</label>
    <div class="field ${init.yes ? '' : 'hidden'}" data-call-when><label for="${id}-at">When suits you? <span class="faint">(optional)</span></label><input class="input" id="${id}-at" type="datetime-local" value="${init.at}">
      <span class="hint">The business confirms a time by email. You need to give your email address above so we can send it.</span></div></section>`;
}

export function bindCallBlock(id: string): void {
  const root = document.getElementById(id); if (!root) return;
  root.querySelectorAll<HTMLInputElement>('input[type=radio]').forEach((r) => r.addEventListener('change', () => {
    const yes = (root.querySelector('input[type=radio]:checked') as HTMLInputElement | null)?.value === 'yes';
    $('[data-call-when]', root)?.classList.toggle('hidden', !yes);
  }));
}

/** null when the customer said no thanks (or the block is not on the page); otherwise their wish. */
export function readCallBlock(id: string, off: number): { preferredAt: string | null } | null {
  const root = document.getElementById(id); if (!root) return null;
  if ((root.querySelector('input[type=radio]:checked') as HTMLInputElement | null)?.value !== 'yes') return null;
  const v = (document.getElementById(`${id}-at`) as HTMLInputElement | null)?.value ?? '';
  const t = v ? Date.parse(`${v}:00Z`) - off * 60_000 : NaN;
  return { preferredAt: Number.isFinite(t) ? new Date(t).toISOString() : null };
}

/** The raw choice, to keep it when a page redraws. */
export function peekCallBlock(id: string): { yes: boolean; at: string } | null {
  const root = document.getElementById(id); if (!root) return null;
  return { yes: (root.querySelector('input[type=radio]:checked') as HTMLInputElement | null)?.value === 'yes', at: (document.getElementById(`${id}-at`) as HTMLInputElement | null)?.value ?? '' };
}
