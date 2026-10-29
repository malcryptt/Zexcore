import { ApiError, toApiError, unavailable, loadCtx } from './core';
import { fb } from './firebase';
import * as authApi from './auth';
import * as cat from './catalog';
import * as bk from './bookings';
import * as pub from './public';
import * as crm from './crm';
import * as bill from './billing';

type Params = string[];
interface Req { method: string; params: Params; query: URLSearchParams; body: Record<string, any> }
type Handler = (r: Req) => Promise<unknown> | unknown;

const routes: { method: string; re: RegExp; run: Handler }[] = [];
const on = (method: string, path: string, run: Handler): void => {
  routes.push({ method, re: new RegExp(`^${path.replace(/:[a-zA-Z]+/g, '([^/]+)')}$`), run });
};

// ── auth ──
on('POST', '/api/auth/register', async ({ body }) => { await authApi.register(body as never); return { token: 'firebase' }; });
on('POST', '/api/auth/login', async ({ body }) => { await authApi.login(body.email, body.password); return { token: 'firebase' }; });
on('POST', '/api/auth/logout', async () => { await authApi.logout(); return { ok: true }; });
on('GET', '/api/auth/me', async () => authApi.me());
on('POST', '/api/auth/password/forgot', async ({ body }) => { await authApi.forgot(body.email); return { ok: true }; });
on('POST', '/api/auth/password/reset', async ({ body }) => { await authApi.reset(body.token, body.password); return { ok: true }; });
on('POST', '/api/auth/password/change', async ({ body }) => { await authApi.changePassword(body.currentPassword, body.newPassword); return { token: 'firebase' }; });
on('POST', '/api/auth/email/verify', async ({ body }) => { await authApi.verifyEmail(body.token); return { ok: true }; });
on('POST', '/api/auth/email/resend', async () => { await authApi.resendVerification(); return { ok: true }; });
on('GET', '/api/auth/google/config', () => ({ clientId: null }));
on('POST', '/api/auth/google', () => { throw unavailable('Google sign-in'); });
// Firebase signs a device out from the Firebase console / by password change; per-device session lists are not exposed.
on('GET', '/api/auth/sessions', () => ({ sessions: [] }));
on('POST', '/api/auth/sessions/revoke-others', () => { throw unavailable('Signing out other devices'); });
on('DELETE', '/api/auth/sessions/:id', () => { throw unavailable('Signing out other devices'); });

// ── workspace catalog ──
on('GET', '/api/bookings/settings', () => cat.getSettings());
on('PUT', '/api/bookings/settings', ({ body }) => cat.putSettings(body));
on('GET', '/api/bookings/services', async () => ({ services: await cat.listServices(await loadCtx()) }));
on('POST', '/api/bookings/services', ({ body }) => cat.createService(body));
on('PATCH', '/api/bookings/services/:id', ({ params, body }) => cat.patchService(params[0]!, body));
on('GET', '/api/bookings/staff', async () => ({ staff: await cat.listStaff(await loadCtx()) }));
on('POST', '/api/bookings/staff', ({ body }) => cat.createStaff(body));
on('PATCH', '/api/bookings/staff/:id', ({ params, body }) => cat.patchStaff(params[0]!, body));

// ── bookings ──
on('GET', '/api/bookings/summary', () => bk.summary());
on('GET', '/api/bookings/customers', ({ query }) => bk.customers(query));
on('GET', '/api/bookings', ({ query }) => bk.listBookings(query));
on('POST', '/api/bookings', ({ body }) => bk.staffCreate(body));
on('PATCH', '/api/bookings/:id', ({ params, body }) => bk.patchBooking(params[0]!, body));
on('POST', '/api/bookings/:id/payment-link', () => { throw unavailable('Deposit payment links'); });
// WhatsApp conversations are not stored in this release; the inbox simply shows as empty.
on('GET', '/api/bookings/conversations', () => ({ conversations: [], counts: { all: 0, waiting: 0, booked: 0 } }));
on('GET', '/api/bookings/conversation', () => { throw unavailable('Messaging'); });
on('POST', '/api/bookings/conversation/read', () => ({ ok: true }));
on('POST', '/api/bookings/messages', () => { throw unavailable('Messaging'); });

// ── public booking page ──
on('GET', '/api/public/:slug', ({ params }) => pub.profile(params[0]!));
on('GET', '/api/public/:slug/availability', ({ params, query }) => pub.slots(params[0]!, query));
on('POST', '/api/public/:slug/bookings', ({ params, body }) => pub.book(params[0]!, body));
on('GET', '/api/public/:slug/payments/:ref', () => pub.payment());

// ── CRM + website pages ──
on('GET', '/api/crm/stages', () => crm.listStages());
on('POST', '/api/crm/stages', ({ body }) => crm.createStage(body));
on('GET', '/api/crm/contacts', ({ query }) => crm.listContacts(query));
on('POST', '/api/crm/contacts', ({ body }) => crm.createContact(body));
on('GET', '/api/crm/leads', ({ query }) => crm.listLeads(query));
on('POST', '/api/crm/leads', ({ body }) => crm.createLead(body));
on('PATCH', '/api/crm/leads/:id/move', ({ params, body }) => crm.moveLead(params[0]!, body));
on('PATCH', '/api/crm/leads/:id/close', ({ params, body }) => crm.closeLead(params[0]!, body));
on('GET', '/api/cms/pages', () => crm.listPages());
on('POST', '/api/cms/pages', ({ body }) => crm.createPage(body));
on('POST', '/api/cms/pages/:id/publish', ({ params }) => crm.publishPage(params[0]!));

// ── billing + audit ──
on('GET', '/api/billing/plans', () => bill.plans());
on('GET', '/api/billing/usage', () => bill.usage());
on('POST', '/api/billing/checkout', ({ body }) => bill.checkout(body));
on('GET', '/api/billing/payments', () => bill.payments());
on('GET', '/api/audit-log', () => bill.auditLog());
on('GET', '/api/audit-log/verify', () => { throw unavailable('Tamper-evidence verification'); });

// ── not in this release (need an always-on server) ──
for (const [prefix, what] of [['/api/iot', 'Device monitoring'], ['/api/rules', 'Automations'], ['/api/compliance', 'Data-protection tools']] as const) {
  for (const m of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) on(m, `${prefix}(?:/.*)?`, () => { throw unavailable(what); });
}

export async function dispatch(path: string, method: string, body: unknown): Promise<unknown> {
  const url = new URL(path, 'https://zexcore.local');
  const route = routes.find((r) => r.method === method && r.re.test(url.pathname));
  if (!route) throw new ApiError(404, 'Not found', 'not_found');
  const params = (route.re.exec(url.pathname) ?? []).slice(1).map(decodeURIComponent);
  try {
    fb(); // fails fast with a clear message when the Firebase settings are missing
    return await route.run({ method, params, query: url.searchParams, body: (body ?? {}) as Record<string, any> });
  } catch (e) { throw toApiError(e); }
}
