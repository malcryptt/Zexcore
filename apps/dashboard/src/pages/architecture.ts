/** Architecture: modelled on Convex's "one coherent backend" story — data, rules, functions, live updates — described for the real Firebase build. */
import { block, cards, code, cta, intro, shell, steps, table } from './ref';

export function renderArchitecturePage(): string {
  return shell('architecture',
    intro('ARCHITECTURE', 'A backend with no server to babysit',
      'ZexCore runs on Firebase Authentication, Cloud Firestore and Firebase Hosting, plus one small Cloudflare Worker for the things a browser must never do: take payments and hold secrets. Every request has exactly one place it is checked.',
      [{ text: 'Start free', href: '/signup', primary: true }, { text: 'Read the docs', href: '/docs' }]),

    block('The whole system on one page', 'Four parts. Each one has a single job, and none of them can do the job of another.', cards([
      { tag: 'HOSTING', title: 'Dashboard & booking pages', text: 'A static single-page app on Firebase Hosting behind a strict Content-Security-Policy. No server renders anything.' },
      { tag: 'AUTH', title: 'Firebase Authentication', text: 'Email and password sign-in, email verification and password reset. Every request carries a signed ID token.' },
      { tag: 'DATA', title: 'Cloud Firestore', text: 'All business data lives under one workspace path. Security rules decide who may read or write every document.' },
      { tag: 'WORKER', title: 'Payments Worker', text: 'A Cloudflare Worker that holds the Paystack secret and a service account. It is the only thing allowed to change a plan.' },
    ])),

    block('How a request travels', 'The browser talks straight to Firestore. The rules are the gate, so there is no middle layer to forget a check.', steps([
      { title: 'You sign in', text: 'Firebase Authentication returns a signed ID token that proves who you are.' },
      { title: 'The app asks Firestore', text: 'Reads and writes go directly to your workspace path, workspaces/{id}, with the token attached.' },
      { title: 'Rules decide', text: 'Firestore security rules check that you are a member of that workspace, your role allows the action, the data is valid and your plan has room.' },
      { title: 'Live updates arrive', text: 'Accepted writes are visible to the other members of the workspace straight away.' },
      { title: 'Money goes through the Worker', text: 'Checkout and Paystack webhooks hit the Worker, which verifies the signature, re-checks the payment with Paystack and then updates the plan.' },
    ]), true),

    block('Guarantees enforced in the data layer', 'These are not conventions. Each one is a rule that refuses the write if it is broken.', table(
      ['Guarantee', 'How it is enforced'],
      [
        ['Workspace isolation', 'Every document sits under workspaces/{id}. Rules require a members/{uid} record for that workspace before any read or write.'],
        ['No double booking', 'A booking and its 15-minute lock cells are created in one atomic batch. A lock cell can be created only once, so a second booking of the same slot fails.'],
        ['Plan limits', 'Services, staff, contacts and pages use numbered slots (s_0, s_1…). Rules refuse any slot at or above the plan limit. Bookings are counted per month the same way.'],
        ['Plans cannot be forged', 'Plan fields are not writable from the browser at all. Only the Worker, using a service account, can change them.'],
        ['Public booking is narrow', 'Visitors may create only a pending booking with a valid phone, a future time within 180 days and an existing staff member. They can read only the public profile, services, staff and slot availability.'],
      ])),

    block('What a rule looks like', 'This is the real shape of the check that protects your data.', code(
`<b>function</b> isMember(wid) {
  <b>return</b> request.auth != null
    && exists(/databases/$(database)/documents/workspaces/$(wid)/members/$(request.auth.uid));
}

<b>match</b> /workspaces/{wid}/bookings/{id} {
  <b>allow read:</b> if isMember(wid);
  <b>allow create:</b> if isMember(wid) && slotId(wid, 'bookings', id);
}`), true),

    block('The pieces around the edges', 'Everything else is a managed service you do not run.', cards([
      { title: 'Payments Worker', text: 'Paystack checkout, signature-verified webhooks and idempotent plan updates. It scales to zero and costs nothing when idle.' },
      { title: 'Firestore indexes & rules', text: 'Kept in the repository and deployed by CI, so the rules in production are always the rules you can read.' },
      { title: 'Emulator-tested', text: 'The security rules and the full data layer are tested against the Firebase emulators on every change.' },
    ])),

    cta('Read the rules yourself', 'The security rules, indexes and Worker are in the repository. Nothing about the boundary is hidden.', [{ text: 'See the security model', href: '/security', primary: true }, { text: 'Multi-tenancy', href: '/multi-tenancy' }]),
  );
}
