/** The call screen. Team members join from a booking; customers join from the link in their email (no account). */
import { html, mount, $, type Raw } from '../lib/html';
import { ic } from '../lib/icons';
import { ApiError } from '../lib/api';
import { navigate } from '../router';
import { joinAsGuest, joinMeeting, type JoinTarget } from '../lib/fb/meetings';

const ALLOW = 'camera; microphone; fullscreen; display-capture; autoplay; clipboard-write';

function frame(t: JoinTarget, team: boolean): Raw {
  if (t.mode === 'own') {
    return html`<div class="card card-pad stack" style="max-width:520px;margin:0 auto;text-align:center">
      <span class="icon-tile" style="margin:0 auto;background:var(--primary-tint);color:var(--primary)">${ic('video')}</span>
      <h2>Your meeting is ready</h2><p class="muted">This business hosts the call on its own meeting link. It opens in a new tab.</p>
      <a class="btn btn-primary" href="${t.url}" target="_blank" rel="noopener noreferrer">${ic('video', 'ico-sm')} Open the meeting</a></div>`;
  }
  return html`<div class="stack" style="gap:10px">
    <iframe title="Video call" src="${t.url}" allow="${ALLOW}" style="width:100%;height:min(72vh,640px);border:0;border-radius:14px;background:#0f172a"></iframe>
    <div class="row between wrap"><span class="muted small">${t.expiresAt ? `This call ends automatically at ${new Date(t.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` : ''}${team && t.used && t.limit ? ` Video calls this month: ${t.used} of ${t.limit}.` : ''}</span>
      <button class="btn btn-secondary btn-sm" data-leave>Leave</button></div></div>`;
}

async function run(host: HTMLElement, load: () => Promise<JoinTarget>, leave: () => void, head: Raw, team: boolean): Promise<void> {
  mount(host, html`${head}<div class="card card-pad" style="text-align:center">Getting your meeting ready…</div>`);
  try {
    const t = await load();
    mount(host, html`${head}${frame(t, team)}`);
    $('[data-leave]', host)?.addEventListener('click', leave);
    if (t.mode === 'own') window.open(t.url, '_blank', 'noopener,noreferrer');
  } catch (e) {
    mount(host, html`${head}<div class="card card-pad stack" style="max-width:520px;margin:0 auto;text-align:center"><span class="icon-tile" style="margin:0 auto">${ic('video')}</span>
      <h3>Cannot join yet</h3><p class="muted">${e instanceof ApiError ? e.message : 'Something went wrong. Please try again.'}</p><div><button class="btn btn-secondary" data-retry>Try again</button></div></div>`);
    $('[data-retry]', host)?.addEventListener('click', () => void run(host, load, leave, head, team));
  }
}

/** /app/meet/:id — the team side. */
export async function renderMeet(view: HTMLElement, bookingId: string): Promise<void> {
  const head = html`<div class="page-head"><div><h1>Video meeting</h1><p>Allow the camera and microphone when your browser asks.</p></div></div>`;
  await run(view, () => joinMeeting(bookingId), () => navigate('/app/bookings'), head, true);
}

/** /meet/:workspace/:booking/:key — the customer side, no sign-in. */
export async function renderGuestMeet(wid: string, bookingId: string, key: string): Promise<void> {
  const root = document.getElementById('app')!;
  document.title = 'Join your meeting — ZexCore';
  const head = html`<div style="text-align:center;margin:18px 0"><b style="font-size:1.1rem">Your online appointment</b><div class="muted small">Allow the camera and microphone when your browser asks.</div></div>`;
  const host = document.createElement('div'); host.className = 'public-wrap'; host.style.cssText = 'max-width:900px;margin:0 auto;padding:16px';
  root.replaceChildren(host);
  await run(host, () => joinAsGuest(wid, bookingId, key), () => { host.innerHTML = '<p class="muted" style="text-align:center;margin-top:40px">You have left the meeting. You can close this page.</p>'; }, head, false);
}
