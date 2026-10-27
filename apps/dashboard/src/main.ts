import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/site.css';
import './styles/modules.css';

import { route, setNotFound, setGuard, setAfter, startRouter, navigate } from './router';
import { setUnauthorizedHandler } from './lib/api';
import { loadMe, isSignedIn, current } from './lib/session';
import { appLayout, leaveApp } from './layouts';
import { html, mount } from './lib/html';
import { errorState } from './lib/ui';
import { renderSignIn, renderSignUp, renderForgot, renderReset, renderVerify } from './views/auth';
import { renderSecurity as renderAccountSecurity } from './views/security';
import { renderHome as renderAppHome } from './views/home';
import { renderBookings, openNewBooking } from './views/bookings';
import { renderCalendar } from './views/calendar';
import { renderMessages } from './views/messages';
import { renderCustomers } from './views/customers';
import { renderMore, renderServices, renderTeam, renderBookingPage, renderSettings } from './views/manage';
import { renderBilling, renderAudit } from './views/account';
import { renderCrm } from './views/crm';
import { renderDevices } from './views/devices';
import { renderAutomations } from './views/automations';
import { renderContent } from './views/content';
import { renderCompliance } from './views/compliance';
import { renderOnboarding } from './views/onboarding';
import { renderPublicBooking } from './views/publicBooking';
import { renderPrivacy, renderTerms, renderNotFound } from './views/site';
import { renderLegacySite, clearLegacySiteStyles } from './legacySite';

setUnauthorizedHandler(() => navigate('/signin', true));

const TITLES: Record<string, string> = {
  '/app': 'Home', '/app/bookings': 'Bookings', '/app/calendar': 'Calendar', '/app/messages': 'Messages', '/app/more': 'More',
  '/app/customers': 'Customers', '/app/services': 'Services', '/app/team': 'Team', '/app/booking-page': 'Booking page',
  '/app/billing': 'Plan & billing', '/app/audit': 'Audit log', '/app/settings': 'Settings', '/app/security': 'Security',
  '/app/crm': 'CRM', '/app/devices': 'Devices', '/app/automations': 'Automations', '/app/content': 'Website pages', '/app/compliance': 'Data protection',
};

setGuard(async (ctx) => {
  const inApp = ctx.path === '/app' || ctx.path.startsWith('/app/');
  if (inApp) {
    if (!isSignedIn()) return '/signin';
    try { if (!(await loadMe())) return '/signin'; }
    catch { mount(document.getElementById('app')!, html`<div class="auth-wrap"><div class="auth-card">${errorState('We could not reach ZexCore. Check your connection and try again.')}</div></div>`); document.querySelector('[data-retry]')?.addEventListener('click', () => location.reload()); return ctx.path; }
  }
  if ((ctx.path === '/signin' || ctx.path === '/signup') && isSignedIn()) { if (await loadMe().catch(() => null)) return '/app'; }
});
const SITE = 'https://zexcore.com.ng';
const SITE_PAGES = new Set(['/', '/product', '/pricing', '/security', '/contact', '/privacy', '/terms']);
function setMeta(path: string): void {
  const head = document.head;
  let canon = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  let robots = head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (SITE_PAGES.has(path)) {
    robots?.remove();
    if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; head.appendChild(canon); }
    canon.href = SITE + (path === '/' ? '/' : path);
  } else {
    canon?.remove();
    if (['/signin', '/signup', '/forgot-password', '/reset-password', '/verify-email'].includes(path) || path.startsWith('/app')) {
      if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; head.appendChild(robots); }
      robots.content = 'noindex, nofollow';
    } else robots?.remove();
  }
}
setAfter((ctx) => { if (TITLES[ctx.path]) document.title = `${TITLES[ctx.path]} — ZexCore`; setMeta(ctx.path); });

const appRoute = (path: string, render: (view: HTMLElement, ctx: { query: URLSearchParams }) => Promise<void> | void) =>
  route(path, async (ctx) => {
    clearLegacySiteStyles();
    const view = await appLayout(ctx.path, () => void openNewBooking(() => navigate(location.pathname + location.search)));
    view.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    await render(view, ctx);
  });

route('/', () => renderLegacySite('home'));
route('/home', () => { history.replaceState(null, '', '/'); renderLegacySite('home'); });
route('/product', () => renderLegacySite('platform'));
route('/platform', () => renderLegacySite('platform'));
route('/architecture', () => renderLegacySite('architecture'));
route('/modules', () => renderLegacySite('modules'));
route('/solutions', () => renderLegacySite('solutions'));
route('/security', () => renderLegacySite('security'));
route('/docs', () => renderLegacySite('docs'));
route('/documentation', () => renderLegacySite('docs'));
route('/resources', () => renderLegacySite('resources'));
route('/pricing', () => renderLegacySite('pricing'));
route('/about', () => renderLegacySite('about'));
route('/contact', () => renderLegacySite('contact'));
route('/console', () => navigate('/app', true));
route('/dashboard', () => navigate('/app', true));
route('/console/:tab', (ctx) => {
  const aliases: Record<string, string> = { overview: '/app', iot: '/app/devices', crm: '/app/crm', rules: '/app/automations', compliance: '/app/compliance', audit: '/app/audit', whitelabel: '/app/settings', license: '/app/billing', billing: '/app/billing' };
  navigate(aliases[ctx.params.tab] || '/app', true);
});
route('/privacy', () => { clearLegacySiteStyles(); renderPrivacy(); });
route('/terms', () => { clearLegacySiteStyles(); renderTerms(); });
route('/signin', () => { clearLegacySiteStyles(); leaveApp(); renderSignIn(); });
route('/signup', () => { clearLegacySiteStyles(); leaveApp(); renderSignUp(); });
route('/forgot-password', () => { clearLegacySiteStyles(); leaveApp(); renderForgot(); });
route('/reset-password', () => { clearLegacySiteStyles(); leaveApp(); renderReset(); });
route('/verify-email', () => { clearLegacySiteStyles(); leaveApp(); void renderVerify(); });

route('/app/onboarding', async () => { await renderOnboarding(); });
appRoute('/app', (v) => renderAppHome(v));
appRoute('/app/bookings', (v) => renderBookings(v));
appRoute('/app/calendar', (v) => renderCalendar(v));
appRoute('/app/messages', (v, c) => renderMessages(v, c.query.get('phone')));
appRoute('/app/more', (v) => renderMore(v));
appRoute('/app/customers', (v) => renderCustomers(v));
appRoute('/app/services', (v) => renderServices(v));
appRoute('/app/team', (v) => renderTeam(v));
appRoute('/app/booking-page', (v) => renderBookingPage(v));
appRoute('/app/billing', (v) => renderBilling(v));
appRoute('/app/audit', (v) => renderAudit(v));
appRoute('/app/settings', (v) => renderSettings(v));
appRoute('/app/security', (v) => renderAccountSecurity(v));
appRoute('/app/crm', (v) => renderCrm(v));
appRoute('/app/devices', (v) => renderDevices(v));
appRoute('/app/automations', (v) => renderAutomations(v));
appRoute('/app/content', (v) => renderContent(v));
appRoute('/app/compliance', (v) => renderCompliance(v));

// A single path segment that is not a site page is a business's public booking page: /<slug>
setNotFound((ctx) => {
  clearLegacySiteStyles();
  const m = /^\/([a-z0-9][a-z0-9-]{1,62})$/.exec(ctx.path);
  if (m) return renderPublicBooking(m[1]!, ctx.query.get('pay'));
  renderNotFound();
});

void current;
startRouter();
