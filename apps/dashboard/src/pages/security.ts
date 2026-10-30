/** Security: access-control focus (TenantX + PlatformXe style) — who can do what, what guards it, what we do not claim. Public copy is infrastructure-agnostic. */
import { block, cards, cta, intro, shell, table } from './ref';

export function renderSecurityPage(): string {
  return shell('security',
    intro('SECURITY', 'Security You Can Read, Not Just Trust',
      'ZexCore has no application server to misconfigure. Your data sits behind access policies that live in the repository and are deployed by CI — the policies in production are always the policies you can read. Payment processing is handled by an isolated worker that is the only place the payment secret exists.',
      [{ text: 'Start free', href: '/signup', primary: true }, { text: 'How It Is Built', href: '/architecture' }]),

    block('Layers of Protection', 'Each layer assumes the one before it could fail.', cards([
      { tag: '1 · IDENTITY', title: 'Managed Authentication', text: 'Passwords are handled by a dedicated identity service — never stored by ZexCore directly. Email verification and secure reset links are built in and cannot be bypassed.' },
      { tag: '2 · ACCESS', title: 'Data-Layer Access Policies', text: 'Every read and write is checked against your workspace membership, role, data shape and plan limits before it is accepted. There is no application code in the path that could be skipped.' },
      { tag: '3 · PAYMENTS', title: 'Isolated Payments Worker', text: 'The payment secret and service credential exist only inside the worker. It verifies every webhook signature and re-confirms the payment with the payment provider before any plan changes are made.' },
      { tag: '4 · BROWSER', title: 'Hardened Hosting', text: 'A strict Content-Security-Policy limits which scripts can run and which hosts the application can contact, reducing the attack surface of a compromised dependency.' },
    ])),

    block('Who Can Do What', 'The access model, from the public booking page to the payments worker.', table(
      ['Actor', 'Can', 'Cannot'],
      [
        ['Public Visitor', 'View your public booking page, services and open times. Submit a pending booking.', 'Read bookings, contacts or any private data. Confirm their own booking without your approval.'],
        ['Workspace Owner', 'Manage services, staff, settings, bookings, contacts and billing for their workspace.', 'Read or write another workspace. Change their subscription plan directly from the browser.'],
        ['Signed-In Member', 'Read and write only the workspaces they are explicitly a member of.', 'List or read workspaces they do not belong to.'],
        ['Payments Worker', 'Create payment records and update the plan after a verified payment event.', 'Act without a valid signed webhook or a verified user token.'],
        ['Everyone Else', 'Nothing. Any path not explicitly opened is closed by default.', 'Anything not explicitly permitted.'],
      ]), true),

    block('Default Deny', 'The last policy rule in the configuration closes everything not opened above it. There is no catch-all that accidentally permits access.', `<div class="rp-code-wrap"><pre><code><b>// Any path not explicitly matched above is denied.</b>
<b>match</b> /{document=**} { <b>allow read, write:</b> if false; }</code></pre></div>`),

    block('Payment Security', '', cards([
      { title: 'Signature-Verified Webhooks', text: 'Payment events are accepted only with a valid HMAC signature, then independently confirmed with the payment provider before any plan changes.' },
      { title: 'Idempotent Processing', text: 'Replaying a webhook never grants a plan upgrade twice or changes a payment already settled.' },
      { title: 'Server-Side Pricing', text: 'Plan prices are defined inside the worker, not the browser, so a tampered request cannot purchase a plan at a reduced price.' },
    ]), true),

    block('What We Do Not Claim', '', `<div class="rp-note">ZexCore is built on enterprise-grade cloud infrastructure operated by major cloud providers whose security certifications apply to that infrastructure layer. ZexCore itself has not completed a SOC 2 or ISO 27001 audit. If you need a formal security review for your organisation, <a href="/contact" data-link>contact us</a> and we will walk your team through the access policies and worker implementation.</div>`),

    cta('Have Your Security Team Take a Look', 'The access policies and worker source are available for review on request. We can arrange a walkthrough.', [{ text: 'Talk to Us', href: '/contact', primary: true }, { text: 'Read the Docs', href: '/docs' }]),
  );
}
