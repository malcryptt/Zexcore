import { html, mount, $, $$, type Raw } from './lib/html';
import { ic, type IconName } from './lib/icons';
import { current, logout } from './lib/session';
import { api } from './lib/api';
import { toast } from './lib/ui';
import { initials } from './lib/format';
import { navigate } from './router';
import { clearStore, loadSettings } from './lib/store';

const root = (): HTMLElement => document.getElementById('app')!;

const NAV: { label?: string; items: { href: string; icon: IconName; text: string; key?: string }[] }[] = [
  { items: [
    { href: '/app', icon: 'house', text: 'Home' },
    { href: '/app/bookings', icon: 'calendar-check', text: 'Bookings' },
    { href: '/app/calendar', icon: 'calendar-days', text: 'Calendar' },
    { href: '/app/messages', icon: 'message-square', text: 'Messages', key: 'msg' },
    { href: '/app/customers', icon: 'users', text: 'Customers' },
  ] },
  { label: 'Business', items: [
    { href: '/app/services', icon: 'list-checks', text: 'Services' },
    { href: '/app/team', icon: 'id-card', text: 'Team' },
    { href: '/app/booking-page', icon: 'link', text: 'Booking page' },
  ] },
  { label: 'Workspace tools', items: [
    { href: '/app/crm', icon: 'handshake', text: 'CRM' },
    { href: '/app/devices', icon: 'cpu', text: 'Devices' },
    { href: '/app/automations', icon: 'workflow', text: 'Automations' },
    { href: '/app/content', icon: 'globe', text: 'Website pages' },
    { href: '/app/compliance', icon: 'scale', text: 'Data protection' },
  ] },
  { label: 'Account', items: [
    { href: '/app/billing', icon: 'credit-card', text: 'Plan & billing' },
    { href: '/app/security', icon: 'shield-check', text: 'Security' },
    { href: '/app/audit', icon: 'history', text: 'Audit log' },
    { href: '/app/settings', icon: 'settings', text: 'Settings' },
  ] },
];

export function brand(size = ''): Raw {
  const h = size === 'lg' ? 44 : 32;
  return html`<span class="brand ${size}"><img class="brand-lockup" src="/zexcore-logo-light.png" alt="ZexCore" height="${h}" style="height:${h}px;width:auto;display:block"></span>`;
}

let unread = 0;
export async function refreshUnread(): Promise<void> {
  try {
    const r = await api<{ counts: { waiting: number } }>('/api/bookings/conversations');
    unread = r.counts.waiting;
  } catch { unread = 0; }
  $$('[data-unread]').forEach((el) => { el.textContent = String(unread); el.classList.toggle('hidden', unread === 0); });
  $$('[data-unread-pip]').forEach((el) => el.classList.toggle('hidden', unread === 0));
}

function isActive(href: string, path: string): boolean {
  return href === '/app' ? path === '/app' : path === href || path.startsWith(href + '/');
}

/** Renders the signed-in chrome once and returns the element views render into. */
export async function appLayout(path: string, onNew: () => void): Promise<HTMLElement> {
  let view = $('#view');
  const me = current()!;
  if (!view || !$('.app')) {
    const s = await loadSettings();
    const bizName = s.publicName || me.tenant.name;
    mount(root(), html`
      <div class="app">
        <aside class="sidebar" aria-label="Main">
          <a href="/app" data-link>${brand()}</a>
          ${NAV.map((g) => html`
            ${g.label ? html`<div class="nav-label">${g.label}</div>` : ''}
            ${g.items.map((i) => html`<a class="nav-link" href="${i.href}" data-link data-nav="${i.href}">${ic(i.icon)}<span>${i.text}</span>${i.key === 'msg' ? html`<span class="badge-n hidden" data-unread>0</span>` : ''}</a>`)}`)}
        </aside>
        <div class="content-col">
          <header class="topbar">
            <a href="/app" data-link class="brand-link">${brand()}</a>
            <span class="biz-chip"><span class="dot dot-success pulse"></span><span class="t">${bizName}</span></span>
            <span class="spacer"></span>
            <button class="btn btn-primary btn-sm" data-new>${ic('plus', 'ico-sm')} New</button>
            <a class="icon-circle" href="/app/messages" data-link aria-label="Messages">${ic('bell')}<span class="pip hidden" data-unread-pip></span></a>
            <div class="menu-wrap">
              <button class="avatar-btn" data-menu aria-haspopup="true" aria-label="Account menu">${initials(me.user.name || me.tenant.name)}</button>
              <div class="menu hidden" data-menu-panel role="menu">
                <div class="who"><div style="font-weight:650">${me.user.name || 'Account'}</div><div class="muted small truncate">${me.user.email ?? ''}</div><div class="small faint" style="margin-top:2px">${me.tenant.name} · ${me.role ?? ''}</div></div>
                <a href="/app/settings" data-link role="menuitem">${ic('settings', 'ico-sm')} Settings</a>
                <a href="/app/billing" data-link role="menuitem">${ic('credit-card', 'ico-sm')} Plan & billing</a>
                <button data-logout role="menuitem">${ic('log-out', 'ico-sm')} Sign out</button>
              </div>
            </div>
          </header>
          ${me.user.emailVerified === false ? html`<div class="verify-banner" data-verify-banner role="status">${ic('mail')}<span class="grow"><b>Confirm your email.</b> We sent a link to ${me.user.email ?? 'your address'}. You need it to upgrade your plan.</span><button class="btn btn-secondary btn-sm" data-resend>Resend</button></div>` : ''}
          <main class="main" id="view" tabindex="-1"></main>
        </div>
        <nav class="bottom-nav" aria-label="Primary">
          <a href="/app" data-link data-nav="/app">${ic('house')}Home</a>
          <a href="/app/calendar" data-link data-nav="/app/calendar">${ic('calendar-days')}Calendar</a>
          <a href="/app/messages" data-link data-nav="/app/messages">${ic('message-square')}Messages<span class="badge-n hidden" data-unread>0</span></a>
          <a href="/app/more" data-link data-nav="/app/more">${ic('ellipsis')}More</a>
        </nav>
      </div>`);
    view = $('#view')!;
    $('[data-new]')!.addEventListener('click', onNew);
    $('[data-resend]')?.addEventListener('click', async (ev) => {
      const b = ev.currentTarget as HTMLButtonElement; b.disabled = true;
      try { await api('/api/auth/email/resend', { method: 'POST' }); b.textContent = 'Sent'; toast('Confirmation email sent', 'success'); }
      catch (x) { b.disabled = false; toast(x instanceof Error ? x.message : 'Could not send the email', 'error'); }
    });
    const menu = $('[data-menu]')!, panel = $('[data-menu-panel]')!;
    menu.addEventListener('click', (e) => { e.stopPropagation(); panel.classList.toggle('hidden'); });
    document.addEventListener('click', () => panel.classList.add('hidden'));
    $('[data-logout]')!.addEventListener('click', () => { logout(); clearStore(); navigate('/signin'); });
    void refreshUnread();
  }
  $$('[data-nav]').forEach((a) => { isActive(a.dataset.nav!, path) ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
  const moreActive = !['/app', '/app/bookings', '/app/calendar', '/app/messages'].some((h) => isActive(h, path));
  $('.bottom-nav [data-nav="/app/more"]')?.[moreActive ? 'setAttribute' : 'removeAttribute']('aria-current', 'page');
  return view;
}

export function leaveApp(): void {
  if ($('.app')) mount(root(), '');
}

export function authLayout(inner: Raw, showBack = true): void {
  mount(root(), html`<div class="auth-wrap">
    ${showBack ? html`<a class="auth-back-link" href="/" data-link aria-label="Back to website">${ic('arrow-left', 'ico-sm')} Back to website</a>` : ''}
    <a class="auth-logo" href="/" data-link aria-label="ZexCore home">
      <img src="/zexcore-logo-light.png" alt="ZexCore" width="168" height="44" style="height:44px;width:auto;display:block;margin:0 auto">
    </a>
    <main class="auth-card">${inner}</main>
    <footer class="auth-footer">
      ${ic('shield-check', 'ico-sm')}
      <span>Protected workspace access. Your business data stays isolated.</span>
    </footer>
  </div>`);
}
