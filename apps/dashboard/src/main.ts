import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/site.css';

import { route, setNotFound, setGuard, setAfter, startRouter, navigate } from './router';
import { setUnauthorizedHandler } from './lib/api';
import { loadMe, isSignedIn, current } from './lib/session';
import { appLayout, leaveApp } from './layouts';
import { html, mount } from './lib/html';
import { errorState } from './lib/ui';
import { renderSignIn, renderSignUp } from './views/auth';
import { renderHome as renderAppHome } from './views/home';
import { renderBookings, openNewBooking } from './views/bookings';
import { renderCalendar } from './views/calendar';
import { renderMessages } from './views/messages';
import { renderCustomers } from './views/customers';
import { renderMore, renderServices, renderTeam, renderBookingPage, renderSettings } from './views/manage';
import { renderBilling, renderAudit } from './views/account';
import { renderOnboarding } from './views/onboarding';
import { renderPublicBooking } from './views/publicBooking';
import { renderHome, renderProduct, renderPricing, renderSecurity, renderContact, renderPrivacy, renderTerms, renderNotFound } from './views/site';

setUnauthorizedHandler(() => navigate('/signin', true));

const TITLES: Record<string, string> = {
  '/app': 'Home', '/app/bookings': 'Bookings', '/app/calendar': 'Calendar', '/app/messages': 'Messages', '/app/more': 'More',
  '/app/customers': 'Customers', '/app/services': 'Services', '/app/team': 'Team', '/app/booking-page': 'Booking page',
  '/app/billing': 'Plan & billing', '/app/audit': 'Audit log', '/app/settings': 'Settings',
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
setAfter((ctx) => { if (TITLES[ctx.path]) document.title = `${TITLES[ctx.path]} — ZexCore`; });

const appRoute = (path: string, render: (view: HTMLElement, ctx: { query: URLSearchParams }) => Promise<void> | void) =>
  route(path, async (ctx) => {
    const view = await appLayout(ctx.path, () => void openNewBooking(() => navigate(location.pathname + location.search)));
    view.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    await render(view, ctx);
  });

route('/', renderHome);
route('/product', renderProduct);
route('/pricing', () => void renderPricing());
route('/security', renderSecurity);
route('/contact', renderContact);
route('/privacy', renderPrivacy);
route('/terms', renderTerms);
route('/signin', () => { leaveApp(); renderSignIn(); });
route('/signup', () => { leaveApp(); renderSignUp(); });

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

// A single path segment that is not a site page is a business's public booking page: /<slug>
setNotFound((ctx) => {
  const m = /^\/([a-z0-9][a-z0-9-]{1,62})$/.exec(ctx.path);
  if (m) return renderPublicBooking(m[1]!, ctx.query.get('pay'));
  renderNotFound();
});

void current;
startRouter();
