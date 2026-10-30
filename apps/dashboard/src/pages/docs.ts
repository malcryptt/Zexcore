/** Docs: Supabase/Appwrite-style — a persistent guide index beside plain, accurate articles. Infrastructure-agnostic public copy. */
import { code, cta, intro, shell, table } from './ref';

interface Article { id: string; group: string; title: string; body: string }

const ARTICLES: Article[] = [
  { id: 'start', group: 'Get Started', title: 'Quickstart', body: `
    <p>You can take your first booking in about ten minutes.</p>
    <ol><li><a href="/signup" data-link>Create your workspace</a> with your business name and email, then verify the email.</li>
    <li>Add your services (name, duration in 15-minute steps, price).</li>
    <li>Add the people who deliver them. A default team member is created for you.</li>
    <li>Set opening hours and booking notice in Settings.</li>
    <li>Share your public page: <code>zexcore.com.ng/your-name</code>.</li></ol>` },
  { id: 'booking', group: 'Get Started', title: 'How Booking Works', body: `
    <p>Customers pick a service, a team member and a time on your public page. Their request arrives as <b>pending</b>; you confirm it from the dashboard.</p>
    <p>Each booking reserves 15-minute time cells for the team member in the same atomic write. A cell can be reserved only once, so two customers can never hold the same time — even if they submit at the same instant.</p>` },
  { id: 'plans', group: 'Account', title: 'Plans and Limits', body: `
    <p>Limits are enforced at the data layer, so they hold regardless of how a request is made.</p>` + table(
      ['', 'Free', 'Starter', 'Growth', 'Agency'],
      [['Bookings / month', '30', '200', '1,000', '5,000'], ['Staff', '1', '3', '10', '50'], ['Services', '3', '10', '30', '100'], ['Booking pages', '3', '10', '50', '200'], ['Contacts', '50', '500', '5,000', '50,000']]) +
    `<p>When a paid plan expires you keep a 3-day grace period, then the workspace returns to Free. Nothing is deleted; limits apply only to new records.</p>` },
  { id: 'payments', group: 'Account', title: 'Payments with Paystack', body: `
    <p>Upgrading opens Paystack checkout. When the payment succeeds, Paystack notifies our secure payments worker. The worker verifies the signature, independently confirms the transaction with Paystack, then activates the plan. Replays are ignored.</p>
    <p>The plan is never changed by the browser directly, so closing the tab mid-payment cannot lose or fake an upgrade.</p>` },
  { id: 'data', group: 'Platform', title: 'Data Model', body: `<p>Everything a business owns sits under one workspace path, isolated from every other tenant on the platform.</p>` + code(
`workspaces/{id}
  <b>members</b> · <b>services</b> · <b>staff</b> · <b>bookings</b> · <b>locks</b>
  <b>contacts</b> · <b>leads</b> · <b>pages</b> · <b>payments</b> · <b>audit</b>`) },
  { id: 'access', group: 'Platform', title: 'Access Policies', body: `
    <p>There is no application server. Data-layer access policies are the boundary: workspace membership, role, data shape and plan limits are all verified before a write is accepted. See the <a href="/security" data-link>security model</a> and <a href="/architecture" data-link>architecture overview</a> for full details.</p>` },
  { id: 'worker', group: 'Platform', title: 'Payments Worker API', body: `<p>A small, isolated serverless worker handles all payment processing. Endpoints:</p>` + table(
      ['Endpoint', 'Purpose'],
      [['GET /api/health', 'Liveness check.'], ['POST /api/checkout', 'Initiates Paystack checkout for the signed-in workspace owner. Requires a valid identity token.'], ['POST /api/paystack-webhook', 'Receives Paystack events. Requires a valid HMAC signature.']]) },
  { id: 'deploy', group: 'Platform', title: 'Deploying Your Own', body: `
    <p>ZexCore is a cloud-hosted application with a single serverless payments worker. Deployment is fully automated through CI.</p>
    <ol><li>Configure cloud authentication (email/password sign-in) and a managed database.</li>
    <li>Deploy the access policy definitions and database index configuration.</li>
    <li>Deploy the payments worker and configure <code>PAYSTACK_SECRET_KEY</code> and service credentials as encrypted secrets.</li>
    <li>Build the dashboard with the <code>VITE_PAYMENTS_URL</code> environment variable pointing at the worker and deploy to hosting.</li></ol>
    <p>CI in the repository does all of this automatically on every merge to main.</p>` },
];

export function renderDocsPage(): string {
  const groups = [...new Set(ARTICLES.map((a) => a.group))];
  const nav = groups.map((g) => `<div class="rp-dgroup">${g}</div>${ARTICLES.filter((a) => a.group === g).map((a) => `<a href="#${a.id}" class="rp-dlink">${a.title}</a>`).join('')}`).join('');
  const body = ARTICLES.map((a) => `<article id="${a.id}" class="rp-doc"><h2>${a.title}</h2>${a.body}</article>`).join('');
  return shell('docs',
    intro('DOCUMENTATION', 'Platform Documentation', 'Comprehensive guides for running your business on ZexCore and for deploying the platform yourself.', [{ text: 'Quickstart', href: '#start', primary: true }]),
    `<style>
      .rp-docs{display:grid;gap:36px;grid-template-columns:240px minmax(0,1fr);padding:40px 0 72px}
      .rp-dnav{position:sticky;top:84px;align-self:start;display:flex;flex-direction:column;gap:2px}
      .rp-dgroup{font:700 .72rem/1 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#C90019;margin:16px 0 6px}
      .rp-dlink{padding:8px 10px;border-radius:8px;color:#334155;text-decoration:none;font-size:.93rem}
      .rp-dlink:hover{background:#FDF2F2;color:#C90019}
      .rp-doc{padding-bottom:36px;margin-bottom:36px;border-bottom:1px solid #f1e3e5;scroll-margin-top:90px}
      .rp-doc h2{font-size:1.5rem;margin:0 0 12px;color:#0f172a}
      .rp-doc p,.rp-doc li{color:#475569;line-height:1.7}
      .rp-doc code{background:#FDF2F2;border-radius:6px;padding:2px 6px;font-family:'JetBrains Mono',monospace;font-size:.85em;color:#C90019}
      .rp-doc pre code{background:none;color:inherit;padding:0}
      .rp-code-wrap{background:#0f172a;border-radius:12px;padding:20px 24px;overflow-x:auto;margin:16px 0}
      .rp-code-wrap code{color:#e2e8f0;font-family:'JetBrains Mono',monospace;font-size:.88rem;line-height:1.6}
      @media(max-width:900px){.rp-docs{grid-template-columns:minmax(0,1fr)}.rp-dnav{position:static;flex-direction:row;flex-wrap:wrap;gap:6px}.rp-dgroup{display:none}.rp-dlink{border:1px solid #f1e3e5}}
    </style><section class="section-white"><div class="site-container rp-docs"><nav class="rp-dnav" aria-label="Documentation">${nav}</nav><div>${body}</div></div></section>`,
    cta('Need Something That Is Not Here?', 'Tell us what you are trying to do and we will write it up — or arrange a walkthrough with the team.', [{ text: 'Contact Us', href: '/contact', primary: true }]),
  );
}
