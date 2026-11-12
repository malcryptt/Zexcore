import seo from './seo/pages.json';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/site.css';
import './styles/modules.css';
import './styles/mobile-app.css';

import { route, setNotFound, setGuard, setAfter, startRouter, navigate } from './router';
import { setUnauthorizedHandler } from './lib/api';
import { loadMe, isSignedIn, current } from './lib/session';
import { appLayout, leaveApp, syncTitle } from './layouts';
import { html, mount } from './lib/html';
import { errorState } from './lib/ui';

const clearLegacySiteStyles = () => {
  document.getElementById('legacy-site-style')?.remove();
};

setUnauthorizedHandler(() => navigate('/signin', true));

const TITLES: Record<string, string> = {
  '/app': 'Home', '/app/bookings': 'Bookings', '/app/enquiries': 'Service enquiries', '/app/calendar': 'Calendar', '/app/messages': 'Messages', '/app/whatsapp': 'WhatsApp Business', '/app/more': 'More',
  '/app/customers': 'Customers', '/app/services': 'Services', '/app/team': 'Bookable staff', '/app/access': 'Team access', '/app/insights': 'Business insights', '/app/shop': 'Shop', '/app/license': 'Cluster & license', '/app/waitlist': 'Revenue protection', '/app/export': 'Export data', '/app/backups': 'Backups', '/app/api-keys': 'API keys', '/app/booking-page': 'Booking page',
  '/app/billing': 'Plan & billing', '/app/audit': 'Audit log', '/app/settings': 'Settings', '/app/security': 'Security',
  '/app/crm': 'CRM', '/app/devices': 'Devices', '/app/automations': 'Automations', '/app/content': 'Website pages', '/app/compliance': 'Data protection',
  '/docs': 'Documentation', '/documentation': 'Documentation',
  '/pricing': 'Pricing', '/product': 'Product', '/platform': 'Product', '/solutions': 'Solutions', '/modules': 'Modules', '/security': 'Security',
  '/contact': 'Contact', '/about': 'About', '/architecture': 'Architecture', '/multi-tenancy': 'Multi-tenancy', '/automation': 'Automation',
  '/privacy': 'Privacy', '/terms': 'Terms', '/signin': 'Sign in', '/signup': 'Create your workspace', '/forgot-password': 'Reset your password',
};

setGuard(async (ctx) => {
  const inApp = ctx.path === '/app' || ctx.path.startsWith('/app/');
  if (inApp) {
    if (!isSignedIn()) return '/signin';
    try { if (!(await loadMe())) return '/signin'; }
    catch { mount(document.getElementById('app')!, html`<div class="auth-wrap"><div class="auth-card">${errorState('We could not reach ZexCore. Check your connection and try again.')}</div></div>`); document.querySelector('[data-retry]')?.addEventListener('click', () => location.reload()); return ctx.path; }
  }
  // Someone opened an invitation link before signing in: finish accepting it once they are.
  if (inApp && ctx.path !== '/app/onboarding') { try { if (localStorage.getItem('zx.invite')) return '/accept-invite'; } catch { /* ignore */ } }
  if ((ctx.path === '/signin' || ctx.path === '/signup') && isSignedIn()) {
    // Only bother with the async Firebase call when we already have a local session token
    const me = await loadMe().catch(() => null);
    if (me) return '/app';
  }
});
const SITE = 'https://zexcore.com.ng';
const SITE_PAGES = new Set(['/', '/product', '/pricing', '/solutions', ...seo.pages.filter((p) => (p as { kind?: string }).kind === 'industry').map((p) => p.path), '/modules', '/about', '/architecture', '/multi-tenancy', '/automation', '/security', '/contact', '/privacy', '/terms', '/docs', '/documentation']);
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
    if (['/signin', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/accept-invite'].includes(path) || path.startsWith('/app') || path.startsWith('/meet/')) {
      if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; head.appendChild(robots); }
      robots.content = 'noindex, nofollow';
    } else robots?.remove();
  }
}
const SEO = new Map(seo.pages.map((p) => [p.path, p]));
function setText(sel: string, attr: string, value: string): void { document.head.querySelector(sel)?.setAttribute(attr, value); }
setAfter((ctx) => {
  const page = SEO.get(ctx.path);
  if (page) {
    // Public pages carry their own title and description, the same ones the build writes into each page's HTML.
    document.title = page.title; syncTitle();
    setText('meta[name="description"]', 'content', page.description);
    setText('meta[property="og:title"]', 'content', page.title); setText('meta[property="og:description"]', 'content', page.description);
    setText('meta[property="og:url"]', 'content', SITE + (page.path === '/' ? '/' : page.path));
  } else if (TITLES[ctx.path]) { document.title = `${TITLES[ctx.path]} — ZexCore`; syncTitle(); }
  setMeta(ctx.path);
});

const loadLegacy = () => import('./legacySite').then((m) => m.renderLegacySite);
const legacyRoute = (path: string, page: string) =>
  route(path, async () => {
    if (path === '/home') history.replaceState(null, '', '/');
    const render = await loadLegacy();
    render(page as any);
  });

legacyRoute('/', 'home');
legacyRoute('/home', 'home');
legacyRoute('/product', 'platform');
legacyRoute('/platform', 'platform');
legacyRoute('/architecture', 'architecture');
legacyRoute('/multi-tenancy', 'tenancy');
legacyRoute('/automation', 'automation');
legacyRoute('/modules', 'modules');
legacyRoute('/solutions', 'solutions');
route('/meet/:wid/:bid/:key', async (ctx) => {
  clearLegacySiteStyles();
  const { renderGuestMeet } = await import('./views/meet');
  await renderGuestMeet(ctx.params.wid!, ctx.params.bid!, ctx.params.key!);
});
route('/solutions/:industry', async (ctx) => {
  const { renderLegacySite } = await import('./legacySite');
  const { renderIndustryPage } = await import('./pages/industry');
  const html = renderIndustryPage(ctx.path);
  if (!html) { navigate('/solutions', true); return; }
  renderLegacySite('industry', html);
});
legacyRoute('/security', 'security');
legacyRoute('/docs', 'docs');
legacyRoute('/documentation', 'docs');
legacyRoute('/resources', 'resources');
legacyRoute('/pricing', 'pricing');
legacyRoute('/about', 'about');
legacyRoute('/contact', 'contact');

route('/console', () => navigate('/app', true));
route('/dashboard', () => navigate('/app', true));
route('/console/:tab', (ctx) => {
  const aliases: Record<string, string> = { overview: '/app', iot: '/app/devices', crm: '/app/crm', rules: '/app/automations', compliance: '/app/compliance', audit: '/app/audit', whitelabel: '/app/settings', license: '/app/billing', billing: '/app/billing' };
  navigate(aliases[ctx.params.tab] || '/app', true);
});

route('/privacy', async () => { clearLegacySiteStyles(); const { renderPrivacy } = await import('./views/site'); renderPrivacy(); });
route('/terms', async () => { clearLegacySiteStyles(); const { renderTerms } = await import('./views/site'); renderTerms(); });
route('/signin', async () => { clearLegacySiteStyles(); leaveApp(); const { renderSignIn } = await import('./views/auth'); renderSignIn(); });
route('/signup', async () => { clearLegacySiteStyles(); leaveApp(); const { renderSignUp } = await import('./views/auth'); renderSignUp(); });
route('/forgot-password', async () => { clearLegacySiteStyles(); leaveApp(); const { renderForgot } = await import('./views/auth'); renderForgot(); });
route('/reset-password', async () => { clearLegacySiteStyles(); leaveApp(); const { renderReset } = await import('./views/auth'); renderReset(); });
route('/accept-invite', async (ctx) => { clearLegacySiteStyles(); leaveApp(); const { renderAcceptInvite } = await import('./views/access'); void renderAcceptInvite(ctx.query); });
route('/verify-email', async () => { clearLegacySiteStyles(); leaveApp(); const { renderVerify } = await import('./views/auth'); void renderVerify(); });

const handleAuthAction = (ctx: { query: URLSearchParams }) => {
  clearLegacySiteStyles();
  leaveApp();
  const mode = ctx.query.get('mode');
  const code = ctx.query.get('oobCode') || ctx.query.get('token') || ctx.query.get('code') || '';
  if (mode === 'resetPassword') {
    navigate(`/reset-password?oobCode=${encodeURIComponent(code)}`, true);
  } else if (mode === 'verifyEmail') {
    navigate(`/verify-email?oobCode=${encodeURIComponent(code)}`, true);
  } else {
    navigate('/signin', true);
  }
};
route('/auth/action', handleAuthAction);
route('/__/auth/action', handleAuthAction);

const appRoute = (path: string, loader: () => Promise<(view: HTMLElement, ctx: { query: URLSearchParams; params: Record<string, string> }) => Promise<void> | void>) =>
  route(path, async (ctx) => {
    clearLegacySiteStyles();
    const [view, render] = await Promise.all([
      appLayout(ctx.path, async () => {
        const { openNewBooking } = await import('./views/bookings');
        openNewBooking(() => navigate(location.pathname + location.search));
      }),
      loader(),
    ]);
    view.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    await render(view, ctx);
  });

route('/app/onboarding', async () => { const { renderOnboarding } = await import('./views/onboarding'); await renderOnboarding(); });
appRoute('/app', () => import('./views/home').then((m) => m.renderHome));
appRoute('/app/meet/:id', () => import('./views/meet').then((m) => (v, c) => m.renderMeet(v, c.params.id!)));
appRoute('/app/bookings', () => import('./views/bookings').then((m) => m.renderBookings));
appRoute('/app/enquiries', () => import('./views/enquiries').then((m) => m.renderEnquiries));
appRoute('/app/calendar', () => import('./views/calendar').then((m) => (v, c) => m.renderCalendar(v, c.query.get('date'))));
appRoute('/app/messages', () => import('./views/messages').then((m) => (v, c) => m.renderMessages(v, c.query.get('phone'))));
appRoute('/app/more', () => import('./views/manage').then((m) => m.renderMore));
appRoute('/app/customers', () => import('./views/customers').then((m) => m.renderCustomers));
appRoute('/app/services', () => import('./views/manage').then((m) => m.renderServices));
appRoute('/app/backups', () => import('./views/backups').then((m) => m.renderBackups));
appRoute('/app/insights', () => import('./views/insights').then((m) => m.renderInsights));
appRoute('/app/license', () => import('./views/license').then((m) => m.renderLicense));
appRoute('/app/shop', () => import('./views/shop').then((m) => m.renderShop));
appRoute('/app/waitlist', () => import('./views/waitlist').then((m) => m.renderWaitlist));
appRoute('/app/api-keys', () => import('./views/apikeys').then((m) => m.renderApiKeys));
appRoute('/app/export', () => import('./views/export').then((m) => m.renderExport));
appRoute('/app/access', () => import('./views/access').then((m) => m.renderAccess));
appRoute('/app/team', () => import('./views/manage').then((m) => m.renderTeam));
appRoute('/app/booking-page', () => import('./views/manage').then((m) => m.renderBookingPage));
appRoute('/app/billing', () => import('./views/account').then((m) => m.renderBilling));
appRoute('/app/audit', () => import('./views/account').then((m) => m.renderAudit));
appRoute('/app/settings', () => import('./views/manage').then((m) => m.renderSettings));
appRoute('/app/whatsapp', () => import('./views/whatsapp').then((m) => m.renderWhatsApp));
appRoute('/app/security', () => import('./views/security').then((m) => m.renderSecurity));
appRoute('/app/crm', () => import('./views/crm').then((m) => m.renderCrm));
appRoute('/app/devices', () => import('./views/devices').then((m) => m.renderDevices));
appRoute('/app/automations', () => import('./views/automations').then((m) => m.renderAutomations));
appRoute('/app/content', () => import('./views/content').then((m) => m.renderContent));
appRoute('/app/compliance', () => import('./views/compliance').then((m) => m.renderCompliance));

setNotFound(async (ctx) => {
  clearLegacySiteStyles();
  const m = /^\/([a-z0-9][a-z0-9-]{1,62})$/.exec(ctx.path);
  if (m) {
    const { renderPublicBooking } = await import('./views/publicBooking');
    return renderPublicBooking(m[1]!, ctx.query.get('pay'), ctx.query.get('order'));
  }
  const { renderNotFound } = await import('./views/site');
  renderNotFound();
});

void current;
startRouter();

// Pre-warm the most-visited view chunks during browser idle time.
// This means the first navigation to /app, /signin, etc. hits the module cache
// instead of triggering a network fetch + parse on demand.
const _prewarmChunks = () => {
  void import('./views/auth');
  void import('./views/home');
  void import('./views/bookings');
};
if (typeof requestIdleCallback !== 'undefined') {
  requestIdleCallback(_prewarmChunks, { timeout: 2000 });
} else {
  setTimeout(_prewarmChunks, 300);
}
