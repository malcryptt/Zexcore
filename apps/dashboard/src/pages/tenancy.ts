/** Multi-tenancy: TenantX-style — what a tenant is, how isolation works, what is per-tenant. Infrastructure-agnostic public copy. */
import { block, cards, code, cta, intro, shell, table } from './ref';

export function renderTenancyPage(): string {
  return shell('tenancy',
    intro('MULTI-TENANCY', 'One Platform. A Private Workspace for Every Business.',
      'Every business on ZexCore is a tenant with its own workspace, its own public address, its own plan and its own data. A tenant can never read or write another tenant\'s records — and the data layer refuses the attempt at the infrastructure level, not just the interface.',
      [{ text: 'Create a Workspace', href: '/signup', primary: true }, { text: 'Security Model', href: '/security' }]),

    block('The Tenant Model', 'A tenant is a workspace. Everything it owns hangs off a single, isolated path in the data layer.', code(
`workspaces/{workspaceId}
  <b>members</b>/{uid}        who belongs and with which role
  <b>services</b>/s_0 …       what you sell
  <b>staff</b>/p_0 …          who delivers it
  <b>bookings</b>/202611_0 …  appointments, counted per month
  <b>locks</b>/{staff}_{cell} 15-minute slots, one booking each
  <b>contacts</b> · <b>leads</b> · <b>pages</b> · <b>payments</b> · <b>audit</b>`)),

    block('What Is Separate per Tenant', '', table(
      ['Per Tenant', 'How'],
      [
        ['Data', 'All records live under the tenant\'s own workspace path. Access policies require verified membership of that workspace for every read and write.'],
        ['Public Address', 'A unique slug, claimed once, gives the tenant its booking page at zexcore.com.ng/slug.'],
        ['Plan & Limits', 'Each workspace has its own plan. Limits are enforced at the data layer, so one tenant\'s growth never affects another.'],
        ['Settings', 'Hours, booking notice and deposit options belong to the workspace and are changeable only by its owner.'],
        ['Payments', 'Payment records are written by the secure payments worker against the specific tenant that paid.'],
      ]), true),

    block('How Isolation Is Enforced', 'There is no shared table to filter and no application-level check to forget.', cards([
      { title: 'Path-Based Boundary', text: 'The workspace identifier is part of every record path. A request for another tenant\'s path fails the membership policy at the data layer.' },
      { title: 'No Cross-Tenant Queries', text: 'Access policies do not permit listing all workspaces. A signed-in user can only reach the workspaces they explicitly belong to.' },
      { title: 'Tested End to End', text: 'The test suite authenticates as two different tenants and verifies that each one is refused when attempting to access the other\'s data.' },
    ])),

    block('Roles & Permissions', 'Roles are stored on the workspace membership record and enforced by data-layer access policies — not by UI guards alone.', table(
      ['Role', 'Intended Access'],
      [
        ['Owner', 'Full access to the workspace, including settings and billing. The workspace creator is always the initial owner.'],
        ['Admin', 'Manage services, staff, booking pages and appointments.'],
        ['Staff', 'Work with bookings, contacts and leads.'],
      ]), true),

    cta('Built for Businesses That Serve Many Customers', 'Agencies and multi-location operators: ask about the Agency and Enterprise plans.', [{ text: 'See Pricing', href: '/pricing', primary: true }, { text: 'Contact Us', href: '/contact' }]),
  );
}
