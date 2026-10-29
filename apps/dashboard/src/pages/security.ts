/** Security: access-control focus (TenantX + PlatformXe style) — who can do what, what guards it, what we do not claim. */
import { block, cards, code, cta, intro, shell, table } from './ref';

export function renderSecurityPage(): string {
  return shell('security',
    intro('SECURITY', 'Security you can read, not just trust',
      'ZexCore has no application server to misconfigure. Your data sits in Cloud Firestore behind security rules that live in the repository, and money is handled by a small Worker that is the only place the payment secret exists.',
      [{ text: 'Start free', href: '/signup', primary: true }, { text: 'How it is built', href: '/architecture' }]),

    block('Layers of protection', 'Each layer assumes the one before it could fail.', cards([
      { tag: '1 · IDENTITY', title: 'Firebase Authentication', text: 'Passwords are handled by Google’s identity service, never stored by ZexCore. Email verification and reset links are built in.' },
      { tag: '2 · ACCESS', title: 'Firestore security rules', text: 'Every read and write is checked against your workspace membership, role, data shape and plan before it is accepted.' },
      { tag: '3 · MONEY', title: 'Isolated payments Worker', text: 'The Paystack secret and service account exist only inside the Worker. It verifies every webhook signature and re-checks the payment with Paystack.' },
      { tag: '4 · BROWSER', title: 'Hardened hosting', text: 'A strict Content-Security-Policy limits which scripts can run and which hosts the app can contact.' },
    ])),

    block('Who can do what', 'The access model enforced by the rules, from the public booking page to the payments Worker.', table(
      ['Actor', 'Can', 'Cannot'],
      [
        ['Public visitor', 'View your public booking page, services and open times. Submit a pending booking.', 'Read bookings, customers or any private data. Confirm their own booking.'],
        ['Workspace owner', 'Manage services, staff, settings, bookings, contacts and billing for their workspace.', 'Read or write another workspace. Change their plan directly.'],
        ['Signed-in user', 'Read and write only the workspaces they are a member of.', 'List or read workspaces they do not belong to.'],
        ['Payments Worker', 'Create payment records and update the plan after a verified Paystack payment.', 'Act without a valid signed webhook or a verified user token.'],
        ['Everyone else', 'Nothing. Any path not explicitly opened is closed.', 'Anything.'],
      ]), true),

    block('Default deny, in the rules', 'The last rule in the file closes everything not opened above it.', code(
`<b>match</b> /workspaces/{wid} {
  <b>allow read:</b> if isMember(wid);
  <b>allow update:</b> if isAdmin(wid) && onlyChanges(['name', 'settings']);  <i>// plan fields are never client-writable</i>
  <b>allow delete:</b> if false;
}

<b>match</b> /{document=**} { <b>allow read, write:</b> if false; }`)),

    block('Payments', '', cards([
      { title: 'Signature-checked webhooks', text: 'Paystack events are accepted only with a valid HMAC signature, then verified again with Paystack before any plan changes.' },
      { title: 'Idempotent', text: 'Replaying a webhook never grants a plan twice or changes a payment already settled.' },
      { title: 'Amounts set on the server', text: 'Plan prices live in the Worker, not the browser, so a tampered request cannot buy a plan for less.' },
    ]), true),

    block('What we do not claim', '', `<div class="rp-note">ZexCore is built on Firebase, so Google operates the infrastructure and its certifications apply to that layer. ZexCore itself has not completed a SOC 2 or ISO 27001 audit. If you need a security review for your organisation, <a href="/contact" data-link>contact us</a> and we will walk your team through the rules and the Worker code.</div>`),

    cta('Have your security team look', 'The rules, indexes and Worker source are available for review. Ask for a walkthrough.', [{ text: 'Talk to us', href: '/contact', primary: true }, { text: 'Read the docs', href: '/docs' }]),
  );
}
