import { html, mount, $, type Raw } from '../lib/html';
import { ic, type IconName } from '../lib/icons';
import { api } from '../lib/api';
import { isSignedIn } from '../lib/session';
import { brand } from '../layouts';
import { money } from '../lib/format';

const EMAIL = 'hello@zexcore.com.ng';
const root = (): HTMLElement => document.getElementById('app')!;

function setMeta(title: string, desc: string): void {
  document.title = title;
  document.querySelector('meta[name=description]')?.setAttribute('content', desc);
}

function shell(path: string, body: Raw): void {
  const links = [
    ['/product', 'Platform'], ['/architecture', 'Architecture'], ['/modules', 'Modules'],
    ['/solutions', 'Solutions'], ['/docs', 'Docs'], ['/security', 'Security'], ['/pricing', 'Pricing'],
  ];
  const link = (href: string, t: string) => html`<a href="${href}" data-link ${path === href ? 'aria-current="page"' : ''}>${t}</a>`;
  const signed = isSignedIn();
  mount(root(), html`<div class="site">
    <header class="site-nav"><div class="container">
      <a href="/" data-link aria-label="ZexCore home" class="site-brand">${brand()}</a>
      <nav class="site-links" aria-label="Main">${links.map(([href, label]) => link(href, label))}</nav>
      <div class="site-cta">
        ${signed ? html`<a class="btn btn-primary btn-sm" href="/app" data-link>Launch console ${ic('arrow-right', 'ico-sm')}</a>` : html`<a class="btn btn-ghost btn-sm hide-sm" href="/signin" data-link>Sign in</a><a class="btn btn-primary btn-sm" href="/signin" data-link>Launch console ${ic('arrow-right', 'ico-sm')}</a>`}
        <button class="btn btn-ghost btn-sm btn-icon burger" data-burger aria-label="Menu" aria-expanded="false">${ic('menu')}</button>
      </div></div>
      <div class="mobile-menu hidden" data-mm>${links.map(([href, label]) => html`<a href="${href}" data-link>${label}</a>`)}<a href="/signin" data-link>Sign in / Launch console</a></div>
    </header>
    <main id="main">${body}</main>
    <footer class="site-footer"><div class="container">
      <div class="foot-grid"><div>${brand()}<p style="margin-top:12px;max-width:320px;font-size:.9rem">The multi-tenant foundation for vertical SaaS. One core. Infinite possibilities.</p></div>
        <div><h4>Platform</h4><ul><li><a href="/architecture" data-link>Architecture</a></li><li><a href="/modules" data-link>Modules</a></li><li><a href="/solutions" data-link>Solutions</a></li><li><a href="/docs" data-link>Documentation</a></li></ul></div>
        <div><h4>Resources</h4><ul><li><a href="/security" data-link>Security</a></li><li><a href="/pricing" data-link>Pricing</a></li><li><a href="/contact" data-link>Contact</a></li><li><a href="mailto:${EMAIL}">${EMAIL}</a></li></ul></div>
        <div><h4>Legal</h4><ul><li><a href="/privacy" data-link>Privacy</a></li><li><a href="/terms" data-link>Terms</a></li></ul></div></div>
      <div class="foot-bottom"><span>© ${new Date().getFullYear()} ZexLabs. All rights reserved.</span><span>Built for teams building what comes next.</span></div></div></footer></div>`);
  $('[data-burger]')?.addEventListener('click', (e) => { const mm = $('[data-mm]')!; const open = mm.classList.toggle('hidden') === false; (e.currentTarget as HTMLElement).setAttribute('aria-expanded', String(open)); });
  window.scrollTo(0, 0);
}

const feature = (icon: IconName, t: string, p: string | Raw): Raw => html`<article class="feature"><span class="icon-tile">${ic(icon)}</span><h3>${t}</h3><p>${p}</p></article>`;
const pageHero = (eyebrow: string, title: string, copy: string): Raw => html`<section class="page-hero"><div class="container"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p class="lead">${copy}</p></div></section>`;

export function renderHome(): void {
  setMeta('ZexCore — One core. Infinite possibilities.', 'ZexCore is the multi-tenant backend foundation for vertical SaaS: identity, tenancy, dynamic data, events, automation and audit.');
  shell('/', html`
    <section class="hero zc-hero"><div class="container hero-grid">
      <div class="hero-copy">
        <span class="eyebrow"><span class="status-dot"></span> THE BACKEND FOUNDATION FOR VERTICAL SAAS</span>
        <h1>One core.<br><em>Infinite possibilities.</em></h1>
        <p class="lead">Build industry-specific software without rebuilding the foundation every time. ZexCore brings identity, tenancy, data, events, automation and audit into one extensible platform.</p>
        <div class="hero-actions"><a class="btn btn-primary btn-lg" href="/architecture" data-link>Explore the architecture ${ic('arrow-right', 'ico-sm')}</a><a class="btn btn-secondary btn-lg" href="/docs" data-link>Read the docs</a></div>
        <div class="hero-proof"><span>${ic('shield-check')} Tenant-aware by design</span><span>${ic('layers')} Extend with modules</span></div>
      </div>
      <div class="architecture-panel" aria-label="Illustration of ZexCore platform architecture">
        <div class="architecture-top"><span class="live-mark"></span><span>PLATFORM OVERVIEW</span><span class="mono-tag">CORE / 01</span></div>
        <div class="core-node"><span class="core-symbol">${ic('layers')}</span><div><strong>ZexCore</strong><small>Shared platform foundation</small></div><span class="core-state">CORE</span></div>
        <div class="core-lines"><i></i><i></i><i></i></div>
        <div class="core-capabilities">
          <div><span>${ic('key-round')}</span><b>Identity</b><small>Users & access</small></div>
          <div><span>${ic('building-2')}</span><b>Tenancy</b><small>Isolated workspaces</small></div>
          <div><span>${ic('database')}</span><b>Data engine</b><small>Flexible records</small></div>
          <div><span>${ic('workflow')}</span><b>Events</b><small>React to change</small></div>
          <div><span>${ic('zap')}</span><b>Automation</b><small>Run workflows</small></div>
          <div><span>${ic('history')}</span><b>Audit</b><small>Trace activity</small></div>
        </div>
        <div class="architecture-bottom"><span class="bottom-square"></span> MODULES + INDUSTRY PACKS <span class="bottom-arrow">↗</span></div>
      </div>
    </div></section>
    <section class="section zc-trust"><div class="container trust-strip"><span>ONE PLATFORM FOUNDATION</span><span>01 &nbsp; Identity</span><span>02 &nbsp; Tenant isolation</span><span>03 &nbsp; Dynamic data</span><span>04 &nbsp; Events & audit</span></div></section>
    <section class="section"><div class="container"><div class="section-head"><span class="eyebrow">THE CORE CAPABILITIES</span><h2>Build products, not the same plumbing.</h2><p>Start with the infrastructure every SaaS needs. Add only the capabilities your product calls for.</p></div>
      <div class="grid-3 zc-feature-grid">
        ${feature('key-round', 'Identity & access', 'A shared foundation for users, authentication and role-aware access across your product.')}
        ${feature('building-2', 'Multi-tenancy', 'Organise customers into tenants with clear boundaries and tenant-aware operations.')}
        ${feature('database', 'Dynamic data engine', 'Model the records your industry needs without hard-coding every vertical into the core.')}
        ${feature('workflow', 'Events', 'Make changes observable and let connected capabilities respond to meaningful events.')}
        ${feature('zap', 'Automation', 'Compose repeatable workflows that turn business events into useful actions.')}
        ${feature('history', 'Audit', 'Keep an understandable trail of important activity for operations and accountability.')}
      </div></div></section>
    <section class="section alt"><div class="container zc-split"><div><span class="eyebrow">A COMPOSABLE MODEL</span><h2>One core. Different products.</h2><p class="lead">Modules add reusable capabilities. Industry packs configure those capabilities for a particular market. Your team builds the product experience on top.</p><a class="text-link" href="/modules" data-link>Explore modules ${ic('arrow-right', 'ico-sm')}</a></div>
      <div class="stack-diagram"><div class="stack-layer stack-app"><small>YOUR PRODUCT</small><strong>Vertical SaaS experience</strong></div><div class="stack-layer stack-pack"><small>CONFIGURATION</small><strong>Industry packs</strong><span>Healthcare · Property · Retail · More</span></div><div class="stack-layer stack-module"><small>CAPABILITIES</small><strong>Reusable modules</strong><span>Workflows · Billing · Messaging</span></div><div class="stack-layer stack-core"><small>FOUNDATION</small><strong>${ic('layers')} ZexCore engine</strong><span>Identity · Tenancy · Data · Events · Audit</span></div></div></div></section>
    <section class="section"><div class="container"><div class="cta-band zc-cta"><div><span class="eyebrow">START WITH THE FOUNDATION</span><h2>Build your next vertical on a stronger core.</h2><p>Explore the architecture, understand the building blocks, and see how they fit together.</p></div><a class="btn btn-white btn-lg" href="/architecture" data-link>Explore ZexCore ${ic('arrow-right', 'ico-sm')}</a></div></div></section>`);
}

export function renderProduct(): void {
  setMeta('Platform — ZexCore', 'Explore the ZexCore backend platform and its shared capabilities.');
  shell('/product', html`${pageHero('THE PLATFORM', 'The foundation beneath your SaaS.', 'ZexCore brings common backend capabilities together so teams can focus on the product and the people it serves.')}
    <section class="section"><div class="container grid-2">
      ${feature('key-round', 'Identity', 'A consistent foundation for accounts, authentication and access control.')}
      ${feature('building-2', 'Tenancy', 'Tenant-aware boundaries help keep each customer workspace distinct.')}
      ${feature('database', 'Dynamic data', 'A flexible data layer for products with different domain models.')}
      ${feature('workflow', 'Events', 'Represent meaningful changes so other parts of a system can respond.')}
      ${feature('zap', 'Automation', 'Connect triggers and actions into repeatable operational workflows.')}
      ${feature('history', 'Audit', 'Make important activity traceable and easier to investigate.')}
    </div></section><section class="section alt"><div class="container"><div class="section-head"><h2>Designed to be extended</h2><p>Modules add capabilities; packs configure a tenant for an industry. Keep the foundation consistent while your products evolve.</p><a class="btn btn-primary" href="/modules" data-link>Explore modules ${ic('arrow-right', 'ico-sm')}</a></div></div></section>`);
}

export function renderArchitecture(): void {
  setMeta('Architecture — ZexCore', 'Understand the ZexCore architecture: identity, tenancy, dynamic data, events, automation and audit.');
  shell('/architecture', html`${pageHero('ARCHITECTURE', 'A shared core. Clear boundaries.', 'ZexCore is designed as a reusable backend engine for multi-tenant vertical SaaS. Its core services establish the foundation; modules and industry packs extend it.')}
    <section class="section"><div class="container"><div class="architecture-panel architecture-wide"><div class="architecture-top"><span class="live-mark"></span><span>LOGICAL PLATFORM MODEL</span><span class="mono-tag">ZEXCORE / ARCH</span></div>
      <div class="arch-layer"><small>PRODUCT LAYER</small><strong>Vertical SaaS applications</strong><p>Experiences and workflows tailored to each market</p></div><div class="arch-connector">${ic('arrow-down')}</div>
      <div class="arch-layer arch-accent"><small>COMPOSITION LAYER</small><strong>Industry packs & modules</strong><p>Reusable capabilities, configured for each tenant</p></div><div class="arch-connector">${ic('arrow-down')}</div>
      <div class="arch-core-grid"><div><small>IDENTITY</small><b>${ic('key-round')} Users & access</b></div><div><small>TENANCY</small><b>${ic('building-2')} Tenant boundaries</b></div><div><small>DATA</small><b>${ic('database')} Dynamic records</b></div><div><small>EVENTS</small><b>${ic('workflow')} Change signals</b></div><div><small>AUTOMATION</small><b>${ic('zap')} Workflow execution</b></div><div><small>AUDIT</small><b>${ic('history')} Activity trail</b></div></div>
    </div></div></section>
    <section class="section alt"><div class="container grid-2">${feature('shield-check','Boundaries first','Tenant context should be part of the way requests and data operations are handled, not an afterthought.')}${feature('layers','Composable by design','Keep shared platform concerns separate from industry-specific behaviour.')}${feature('activity','Event-aware','Let domain changes become signals that other capabilities can use.')}${feature('history','Traceable operations','Make important actions easier to follow during support, debugging and review.')}</div></section>`);
}

export function renderModules(): void {
  setMeta('Modules — ZexCore', 'Learn how reusable modules extend the ZexCore platform.');
  shell('/modules', html`${pageHero('MODULES', 'Add capabilities without rebuilding the core.', 'Modules extend the shared foundation with reusable product capabilities. Combine what you need and keep industry-specific configuration in packs.')}
    <section class="section"><div class="container grid-3">
      ${feature('key-round','Identity & access','Common account, role and permission capabilities for multi-user products.')}
      ${feature('database','Data models','Reusable domain structures and records that support your product workflows.')}
      ${feature('workflow','Events & integrations','Connect changes in one capability to actions in another.')}
      ${feature('zap','Automation','Coordinate routine work through trigger-and-action workflows.')}
      ${feature('credit-card','Billing','A place for product teams to integrate subscription and payment capabilities when needed.')}
      ${feature('message-square','Communications','Build customer and operational messaging into the wider product experience.')}
    </div></section><section class="section alt"><div class="container zc-split"><div><span class="eyebrow">CONFIGURE, DON'T FORK</span><h2>Industry packs shape the experience.</h2><p class="lead">A pack brings together module choices and configuration for a tenant's market, while the underlying platform stays consistent.</p></div><div class="pack-list"><div>${ic('stethoscope')} <span><b>Healthcare</b><small>Patient and practice workflows</small></span></div><div>${ic('building-2')} <span><b>Property</b><small>Listings, tenants and operations</small></span></div><div>${ic('shopping-bag')} <span><b>Retail & commerce</b><small>Catalog and order workflows</small></span></div><div>${ic('package')} <span><b>Your industry</b><small>Configure around your domain</small></span></div></div></div></section>`);
}

export function renderSolutions(): void {
  setMeta('Solutions — ZexCore', 'Explore how a shared backend foundation can support different vertical SaaS products.');
  shell('/solutions', html`${pageHero('SOLUTIONS', 'Different industries. A common foundation.', 'Build a product around the rules of your market without starting from zero on identity, tenancy, data and operational plumbing.')}
    <section class="section"><div class="container grid-3">
      ${feature('stethoscope','Healthcare software','Shape workflows for practices, care teams and patient-facing services while keeping tenant boundaries clear.')}
      ${feature('building-2','Property platforms','Build tools for property operators, agents and tenant relationships on a shared backend foundation.')}
      ${feature('shopping-bag','Commerce platforms','Create vertical commerce experiences with reusable data, events and operational workflows.')}
      ${feature('truck','Field operations','Support teams, jobs and status changes with tenant-aware records and event-driven actions.')}
      ${feature('users','Professional services','Build industry-specific workspaces around clients, teams and repeatable processes.')}
      ${feature('package','Your vertical','Use modules and packs to reflect the domain model and workflows your market needs.')}
    </div></section><section class="section alt"><div class="container"><div class="section-head"><h2>The product is yours to shape.</h2><p>ZexCore provides the foundation. Your application defines the customer experience, business rules and industry-specific workflows.</p><a class="btn btn-primary" href="/contact" data-link>Talk to the team ${ic('arrow-right','ico-sm')}</a></div></div></section>`);
}

export function renderDocs(): void {
  setMeta('Docs — ZexCore', 'Documentation overview for the ZexCore platform.');
  shell('/docs', html`${pageHero('DOCUMENTATION', 'Understand the building blocks.', 'Start with the platform model, then explore how identity, tenancy, data and extensible capabilities fit into a vertical SaaS architecture.')}
    <section class="section"><div class="container grid-2">
      <a class="doc-card" href="/architecture" data-link><span class="doc-index">01 / PLATFORM</span><h3>Architecture overview ${ic('arrow-right','ico-sm')}</h3><p>See how the core, modules and industry packs relate to one another.</p></a>
      <a class="doc-card" href="/modules" data-link><span class="doc-index">02 / EXTENSIBILITY</span><h3>Modules and packs ${ic('arrow-right','ico-sm')}</h3><p>Understand the difference between reusable capabilities and tenant configuration.</p></a>
      <a class="doc-card" href="/security" data-link><span class="doc-index">03 / TRUST</span><h3>Security model ${ic('arrow-right','ico-sm')}</h3><p>Review the platform's stated approach to tenant isolation, access and audit.</p></a>
      <a class="doc-card" href="/contact" data-link><span class="doc-index">04 / SUPPORT</span><h3>Talk to the team ${ic('arrow-right','ico-sm')}</h3><p>Ask questions about architecture, integrations or your intended use case.</p></a>
    </div><p class="container muted small" style="margin-top:22px">This is the documentation entry point. Detailed API reference and implementation guides should be added as they are verified against the current backend.</p></section>`);
}

export async function renderPricing(): Promise<void> {
  setMeta('Pricing — ZexCore', 'Explore ZexCore platform plans.');
  shell('/pricing', html`${pageHero('PRICING', 'A foundation that can grow with you.', 'Explore the available plans for building and operating on ZexCore. Plan details are loaded from the service.')}
    <section class="section"><div class="container"><div class="price-grid" id="pg"><div class="skel" style="height:200px"></div><div class="skel" style="height:200px"></div><div class="skel" style="height:200px"></div></div></div></section>`);
  try {
    const r = await api<{ currencyRates: { NGN_PER_USD: number }; plans: { tier: string; monthlyUsd: number; annualUsd: number }[] }>('/api/billing/plans', { auth: false });
    const blurb: Record<string, string> = { starter: 'For teams getting started.', growth: 'For products gaining traction.', agency: 'For teams building across multiple tenants.', enterprise: 'For larger deployments and advanced needs.', dedicated: 'Dedicated infrastructure and a named support contact.' };
    mount($('#pg')!, html`<div class="card price-card"><h3>Free</h3><div class="amt">${money(0)}</div><p class="muted small">to get started</p><p class="muted">Explore the platform and start shaping your workspace.</p><a class="btn btn-secondary btn-block" href="/signin" data-link>Launch console</a></div>
      ${r.plans.map((p) => html`<div class="card price-card"><h3 style="text-transform:capitalize">${p.tier}</h3><div class="amt">${money(Math.round(p.monthlyUsd * r.currencyRates.NGN_PER_USD * 100))}<span class="muted small" style="font-weight:500"> / month</span></div><p class="muted small">or ${money(Math.round(p.annualUsd * r.currencyRates.NGN_PER_USD * 100))} billed yearly</p><p class="muted">${blurb[p.tier] ?? ''}</p><a class="btn btn-primary btn-block" href="/signin" data-link>Choose ${p.tier}</a></div>`)`);
  } catch { mount($('#pg')!, html`<div class="alert alert-warn">${ic('triangle-alert', 'ico-sm')} Plans could not be loaded right now. Please refresh, or email ${EMAIL}.</div>`); }
}

export function renderSecurity(): void {
  setMeta('Security — ZexCore', 'Understand ZexCore security principles and tenant isolation.');
  shell('/security', html`${pageHero('SECURITY', 'Trust starts with clear boundaries.', 'Multi-tenant systems need deliberate separation, least privilege and a reliable way to understand important activity.')}
    <section class="section"><div class="container grid-2">
      ${feature('building-2','Tenant isolation','Tenant boundaries should be enforced throughout the data access path, not left to UI conventions alone.')}
      ${feature('key-round','Identity & access','Authentication and role-aware permissions help ensure users can access only the capabilities intended for them.')}
      ${feature('database','Data protection','Use restricted database access, careful tenant scoping and secure handling of customer data.')}
      ${feature('history','Auditability','Important actions should leave a trace that supports investigation and accountability.')}
      ${feature('shield-check','Operational security','Keep credentials private, validate integrations and review access as products evolve.')}
      ${feature('mail','Responsible disclosure',html`Found a vulnerability? Contact <a href="mailto:${EMAIL}" style="color:var(--primary);font-weight:600">${EMAIL}</a>.`)}
    </div><p class="container muted small" style="margin-top:24px">Security descriptions are platform principles, not a claim of third-party certification. Verify implementation and deployment controls before relying on them for compliance.</p></section>`);
}

export function renderContact(): void {
  setMeta('Contact — ZexCore', 'Talk to the ZexCore team about your platform needs.');
  shell('/contact', html`${pageHero('CONTACT', 'Let’s talk about what you’re building.', 'Questions about the platform, a potential integration or your use case? Get in touch with the ZexCore team.')}
    <section class="section"><div class="container grid-2">
      <div class="card card-pad stack"><span class="icon-tile">${ic('mail')}</span><h3>Email the team</h3><p class="muted">Share what you're building and where the platform could help.</p><a class="btn btn-primary" href="mailto:${EMAIL}">${EMAIL}</a></div>
      <div class="card card-pad stack"><span class="icon-tile">${ic('map-pin')}</span><h3>Built by ZexLabs</h3><p class="muted">Based in Akure, Nigeria, building software foundations for teams with ambitious product ideas.</p></div></div></section>`);
}

function legal(path: string, title: string, body: Raw): void {
  setMeta(`${title} — ZexCore`, `${title} for ZexCore.`);
  shell(path, html`<section class="page-hero"><div class="container"><h1>${title}</h1></div></section><section class="section"><div class="container prose">${body}</div></section>`);
}

export function renderPrivacy(): void {
  legal('/privacy', 'Privacy Policy', html`
    <p class="muted">Draft for review. Last updated 25 October 2026.</p>
    <h2>What we collect</h2><p>Account details and information you provide while using ZexCore, including workspace and platform usage data needed to operate the service.</p>
    <h2>How we use it</h2><p>To provide, maintain and secure the service. We do not sell personal data.</p>
    <h2>Your rights</h2><p>You can ask us to access, correct or delete your data. Email ${EMAIL}.</p><h2>Contact</h2><p>${EMAIL}</p>`);
}
export function renderTerms(): void {
  legal('/terms', 'Terms of Service', html`
    <p class="muted">Draft for review. Last updated 25 October 2026.</p>
    <h2>The service</h2><p>ZexCore provides backend platform capabilities for teams building software products.</p>
    <h2>Your account</h2><p>Keep your credentials safe and ensure that use of the service complies with applicable law and your organisation's policies.</p>
    <h2>Acceptable use</h2><p>Do not use ZexCore for unlawful activity or to compromise the service or other users.</p><h2>Contact</h2><p>${EMAIL}</p>`);
}

export function renderNotFound(): void {
  setMeta('Page not found — ZexCore', 'That page does not exist.');
  shell('', html`<section class="section"><div class="container" style="text-align:center;max-width:520px"><span class="icon-tile" style="margin:0 auto 16px;background:var(--primary-tint);color:var(--primary)">${ic('search')}</span><h1 style="font-size:2rem">We can’t find that page</h1><p class="muted" style="margin:10px 0 24px">The link may be wrong or the page may have moved.</p><a class="btn btn-primary" href="/" data-link>Back to home</a></div></section>`);
}
