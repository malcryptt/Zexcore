/** Multi-tenancy: TenantX-style — what a tenant is, how isolation works, what is per-tenant. */
import { block, cards, code, cta, intro, shell, table } from './ref';

export function renderTenancyPage(): string {
  return shell('tenancy',
    intro('MULTI-TENANCY', 'One platform, a private workspace for every business',
      'Every business on ZexCore is a tenant with its own workspace, its own public address, its own plan and its own data. A tenant can never read or write another tenant’s records, and the database refuses the attempt, not just the screen.',
      [{ text: 'Create a workspace', href: '/signup', primary: true }, { text: 'Security model', href: '/security' }]),

    block('The tenant model', 'A tenant is a workspace. Everything it owns hangs off a single path.', code(
`workspaces/{workspaceId}
  <b>members</b>/{uid}        who belongs and with which role
  <b>services</b>/s_0 …       what you sell
  <b>staff</b>/p_0 …          who delivers it
  <b>bookings</b>/202611_0 …  appointments, counted per month
  <b>locks</b>/{staff}_{cell} 15-minute slots, one booking each
  <b>contacts</b> · <b>leads</b> · <b>pages</b> · <b>payments</b> · <b>audit</b>`)),

    block('What is separate per tenant', '', table(
      ['Per tenant', 'How'],
      [
        ['Data', 'All documents live under the tenant’s own workspace path. Rules require membership of that workspace for every access.'],
        ['Public address', 'A unique slug, claimed once, gives the tenant its booking page at zexcore.com.ng/slug.'],
        ['Plan & limits', 'Each workspace has its own plan. Limits are checked by the database, so one tenant’s growth never affects another.'],
        ['Settings', 'Hours, booking notice and deposit options belong to the workspace and are changeable only by its owner.'],
        ['Payments', 'Payment records are written by the payments Worker against the tenant that paid.'],
      ]), true),

    block('How isolation is enforced', 'There is no shared table to filter and no WHERE clause to forget.', cards([
      { title: 'Path-based boundary', text: 'The workspace id is part of every document path. A request for another tenant’s path fails the membership rule.' },
      { title: 'No cross-tenant queries', text: 'Rules do not allow listing workspaces. A signed-in user can only reach the workspaces they belong to.' },
      { title: 'Tested end to end', text: 'The test suite signs in as two different tenants and proves each one is refused when reaching for the other’s data.' },
    ])),

    block('Roles', 'Roles are stored on the membership and checked by the rules.', table(
      ['Role', 'Intended access'],
      [
        ['Owner', 'Everything in the workspace, including settings and billing. The workspace creator is the owner.'],
        ['Admin', 'Manage services, staff, pages and bookings.'],
        ['Staff', 'Work with bookings, contacts and leads.'],
      ]), true),

    cta('Built for businesses that serve many customers', 'Agencies and multi-location operators: ask about the Agency and Enterprise plans.', [{ text: 'See pricing', href: '/pricing', primary: true }, { text: 'Contact us', href: '/contact' }]),
  );
}
