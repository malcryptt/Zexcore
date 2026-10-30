/** Architecture: modelled on Convex's "one coherent backend" story — data, rules, functions, live updates. Public copy is infrastructure-agnostic. */
import { block, cards, cta, intro, shell, steps, table } from './ref';

export function renderArchitecturePage(): string {
  return shell('architecture',
    intro('ARCHITECTURE', 'A Backend With No Server To Babysit',
      'ZexCore is built on a purpose-designed cloud data layer, a hardened identity service and a small isolated payments processor. Every request has exactly one place it is checked — with no application server sitting in between.',
      [{ text: 'Start free', href: '/signup', primary: true }, { text: 'Read the docs', href: '/docs' }]),

    block('The Whole System on One Page', 'Four parts. Each one has a single job, and none of them can do the job of another.', cards([
      { tag: 'HOSTING', title: 'Dashboard & Booking Pages', text: 'A static single-page application served behind a strict Content-Security-Policy. No server renders anything on a request.' },
      { tag: 'IDENTITY', title: 'Managed Authentication', text: 'Email and password sign-in, email verification and password reset. Every request carries a signed identity token that cannot be forged.' },
      { tag: 'DATA', title: 'Cloud Data Layer', text: 'All business data lives under one workspace path, isolated per tenant. Access policies decide who may read or write every record — enforced at the data layer, not in application code.' },
      { tag: 'PAYMENTS', title: 'Payments Processor', text: 'An isolated, serverless worker that holds the payment secret and a privileged service credential. It is the only component permitted to change a subscription plan.' },
    ])),

    block('How a Request Travels', 'The browser talks directly to the data layer. The access policies are the gate — there is no middleware layer to forget a check.', steps([
      { title: 'You Sign In', text: 'The identity service returns a signed token that proves who you are. It is attached to every subsequent request automatically.' },
      { title: 'The App Queries the Data Layer', text: 'Reads and writes go directly to your workspace, with the token attached.' },
      { title: 'Policies Decide', text: 'Access policies check that you are a member of that workspace, your role permits the action, the data is valid and your plan has capacity.' },
      { title: 'Live Updates Arrive', text: 'Accepted writes are visible to other members of the workspace in real time without a page refresh.' },
      { title: 'Money Goes Through the Payments Worker', text: 'Checkout and payment webhooks hit the isolated worker, which verifies the signature, confirms the payment and then updates the plan.' },
    ]), true),

    block('Guarantees Enforced at the Data Layer', 'These are not conventions enforced by code. Each one is a policy that refuses the write if it is broken.', table(
      ['Guarantee', 'How It Is Enforced'],
      [
        ['Workspace Isolation', 'Every record sits under a unique workspace path. Access policies require verified membership of that workspace before any read or write.'],
        ['No Double Booking', 'A booking and its time-lock cells are created in one atomic operation. A lock cell can only be created once — a second booking of the same slot fails at the data layer.'],
        ['Plan Limits', 'Services, staff, contacts and pages use numbered capacity slots. Policies refuse any slot at or above the plan limit. Monthly booking counts work the same way.'],
        ['Plans Cannot Be Forged', 'Plan fields are not writable from the browser at all. Only the payments worker, using a privileged service credential, can change them.'],
        ['Public Booking Is Narrow', 'Visitors may create only a pending booking with a valid phone, a future time within 180 days and an existing staff member. They cannot read private records.'],
      ])),

    block('The Pieces Around the Edges', 'Everything else is a managed service you do not run.', cards([
      { title: 'Payments Worker', text: 'Handles checkout, signature-verified webhooks and idempotent plan updates. It scales to zero and costs nothing when idle.' },
      { title: 'Access Policies & Indexes', text: 'Kept in the repository and deployed by CI, so the policies in production are always the policies your security team can review.' },
      { title: 'Emulator-Tested', text: 'The access policies and the full data layer are tested against local emulators on every code change before deployment.' },
    ])),

    cta('Ready to Build on a Solid Foundation?', 'Review the security model in detail, or speak with our team about your requirements.', [{ text: 'See the Security Model', href: '/security', primary: true }, { text: 'Multi-Tenancy', href: '/multi-tenancy' }]),
  );
}
