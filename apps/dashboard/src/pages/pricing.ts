/**
 * ZexCore Pricing Page
 * Enterprise Infrastructure Platform — Tier-Based Licensing
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

function pricingFeature(enabled: boolean, label: string): string {
  return `
    <div class="pricing-feature-row">
      <span class="pricing-check ${enabled ? 'enabled' : 'disabled'}">
        ${enabled ? '✓' : '—'}
      </span>
      <span class="pricing-feature-label ${enabled ? '' : 'muted'}">${label}</span>
    </div>
  `;
}

function pricingFeatureFeatured(enabled: boolean, label: string): string {
  return `
    <div class="pricing-feature-row">
      <span class="pricing-check-featured ${enabled ? 'enabled' : 'disabled'}">
        ${enabled ? '✓' : '—'}
      </span>
      <span class="pricing-feature-label" style="color: ${enabled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)'};">${label}</span>
    </div>
  `;
}

function compSection(title: string): string {
  return `
    <tr class="comp-section-row">
      <td colspan="6">${title}</td>
    </tr>
  `;
}

function compRow5(
  label: string,
  starter: boolean | string,
  indie: boolean | string,
  growth: boolean | string,
  scale: boolean | string,
  enterprise: boolean | string
): string {
  const cell = (v: boolean | string, featured = false) => {
    if (typeof v === 'boolean') {
      return `<td class="comp-td-tier ${featured ? 'comp-featured-col' : ''}">
        ${v ? `<span class="comp-check ${featured ? 'featured' : ''}">✓</span>` : `<span class="comp-dash">—</span>`}
      </td>`;
    }
    return `<td class="comp-td-tier ${featured ? 'comp-featured-col' : ''}" style="font-size:0.8rem;font-weight:600;color:${featured ? 'var(--primary)' : 'var(--text-main)'};">${v}</td>`;
  };
  return `
    <tr class="comp-data-row">
      <td class="comp-td-feature">${label}</td>
      ${cell(starter)}
      ${cell(indie)}
      ${cell(growth, true)}
      ${cell(scale)}
      ${cell(enterprise)}
    </tr>
  `;
}

function faqItem(question: string, answer: string): string {
  return `
    <div class="faq-item">
      <div class="faq-question">${question}</div>
      <div class="faq-answer">${answer}</div>
    </div>
  `;
}

export function renderPricingPage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('pricing')}
      <main>

        <!-- HERO -->
        <section class="page-intro-section" style="padding-bottom:72px;">
          <div class="page-hero-backdrop" style="background-image:url('/heroes/hero-pricing.jpg');"></div>
          <div class="site-container">
            <div class="page-intro-header page-hero-content-col">
              <div class="section-eyebrow">TRANSPARENT INFRASTRUCTURE LICENSING</div>
              <h1 class="page-intro-title" style="margin-bottom:18px;">
                One Core.<br />
                <span class="text-brand">Right-Sized Pricing.</span>
              </h1>
              <p class="page-intro-desc" style="max-width:680px;margin-bottom:0;">
                ZexCore licenses align to your operational scale — from solo builders shipping their first SaaS module, to enterprise organizations running mission-critical multi-tenant infrastructure.
              </p>
            </div>
          </div>
        </section>

        <!-- BILLING TOGGLE -->
        <section style="background:var(--bg-page);padding:40px 0 0;">
          <div class="site-container" style="display:flex;flex-direction:column;align-items:center;gap:8px;">
            <div class="billing-toggle-wrap" id="billing-toggle-wrap">
              <button class="billing-toggle-btn active" id="btn-billing-monthly" onclick="window.setPricingBilling('monthly')">Monthly</button>
              <button class="billing-toggle-btn" id="btn-billing-annual" onclick="window.setPricingBilling('annual')">
                Annual <span class="billing-save-badge">Save 10%</span>
              </button>
            </div>
            <div class="billing-annual-note" id="billing-annual-note" style="display:none;">
              Billed annually — 10% off every plan. Cancel anytime.
            </div>
          </div>
        </section>

        <!-- PRICING TIERS -->
        <section style="background:var(--bg-page);padding:40px 0 80px;">
          <div class="site-container">
            <div class="pricing-grid-2col">

              <!-- STARTER -->
              <div class="pricing-card">
                <div class="pricing-card-top">
                  <div class="pricing-tier-label">STARTER</div>
                  <div class="pricing-price-block">
                    <span class="pricing-currency">$</span>
                    <span class="pricing-amount" data-monthly="49" data-annual="44">49</span>
                    <span class="pricing-period">/ mo</span>
                  </div>
                  <p class="pricing-desc">Local development and evaluation. Great for learning ZexCore with core micro-kernel and deterministic rules.</p>
                  <button class="btn btn-secondary" style="width:100%;justify-content:center;margin-top:20px;" onclick="window.startStripeCheckout('starter')">Start Starter &rarr;</button>
                </div>
                <div class="pricing-features-list">
                  <div class="pricing-feature-section-title">Core Platform</div>
                  ${pricingFeature(true, '@zexcore/core micro-kernel')}
                  ${pricingFeature(true, 'Multi-tenant RLS (up to 5 tenants)')}
                  ${pricingFeature(true, 'Identity & RBAC engine')}
                  ${pricingFeature(true, 'Core EventBus broker')}
                  ${pricingFeature(true, 'Deterministic AST rule engine')}
                  ${pricingFeature(false, 'IoT telemetry ingestion module')}
                  ${pricingFeature(false, 'CRM sales pipeline module')}
                  ${pricingFeature(false, 'Compliance & GDPR vault')}
                  <div class="pricing-feature-section-title" style="margin-top:16px;">Infrastructure</div>
                  ${pricingFeature(true, 'Self-hosted deployment')}
                  ${pricingFeature(false, 'Managed cloud hosting')}
                  ${pricingFeature(false, 'Multi-region replication')}
                  ${pricingFeature(false, 'SLA uptime guarantee')}
                  <div class="pricing-feature-section-title" style="margin-top:16px;">Support</div>
                  ${pricingFeature(true, 'Community forum access')}
                  ${pricingFeature(false, 'Email support')}
                  ${pricingFeature(false, 'Dedicated support engineer')}
                </div>
              </div>

              <!-- INDIE -->
              <div class="pricing-card">
                <div class="pricing-card-top">
                  <div class="pricing-tier-label">INDIE</div>
                  <div class="pricing-price-block">
                    <span class="pricing-currency">$</span>
                    <span class="pricing-amount" data-monthly="149" data-annual="134">149</span>
                    <span class="pricing-period">/ mo</span>
                  </div>
                  <p class="pricing-desc">Solo builders and small teams shipping their first production SaaS product with IoT fleet telemetry.</p>
                  <button class="btn btn-secondary" style="width:100%;justify-content:center;margin-top:20px;" onclick="window.startStripeCheckout('indie')">Unlock Indie &rarr;</button>
                </div>
                <div class="pricing-features-list">
                  <div class="pricing-feature-section-title">Core Platform</div>
                  ${pricingFeature(true, '@zexcore/core micro-kernel')}
                  ${pricingFeature(true, 'Multi-tenant RLS (up to 25 tenants)')}
                  ${pricingFeature(true, 'Identity & RBAC engine')}
                  ${pricingFeature(true, 'Core EventBus broker')}
                  ${pricingFeature(true, 'Deterministic AST rule engine')}
                  ${pricingFeature(true, 'IoT telemetry ingestion module')}
                  ${pricingFeature(false, 'CRM sales pipeline module')}
                  ${pricingFeature(false, 'Compliance & GDPR vault')}
                  <div class="pricing-feature-section-title" style="margin-top:16px;">Infrastructure</div>
                  ${pricingFeature(true, 'Self-hosted deployment')}
                  ${pricingFeature(true, 'Managed cloud hosting (shared)')}
                  ${pricingFeature(false, 'Multi-region replication')}
                  ${pricingFeature(false, 'SLA uptime guarantee')}
                  <div class="pricing-feature-section-title" style="margin-top:16px;">Support</div>
                  ${pricingFeature(true, 'Community forum access')}
                  ${pricingFeature(true, 'Email support (72h SLA)')}
                  ${pricingFeature(false, 'Dedicated support engineer')}
                </div>
              </div>

              <!-- GROWTH (FEATURED) -->
              <div class="pricing-card pricing-card-featured">
                <div class="pricing-featured-tag">MOST POPULAR</div>
                <div class="pricing-card-top">
                  <div class="pricing-tier-label" style="color:#fff;opacity:0.7;">GROWTH</div>
                  <div class="pricing-price-block">
                    <span class="pricing-currency" style="color:#fff;">$</span>
                    <span class="pricing-amount" data-monthly="499" data-annual="449" style="color:#fff;">499</span>
                    <span class="pricing-period" style="color:rgba(255,255,255,0.7);">/ mo</span>
                  </div>
                  <p class="pricing-desc" style="color:rgba(255,255,255,0.8);">Teams scaling their SaaS product with full CRM sales pipelines, IoT telemetry, and automated triggers.</p>
                  <button class="btn" style="width:100%;justify-content:center;margin-top:20px;background:#fff;color:var(--primary);border-color:#fff;font-weight:700;" onclick="window.startStripeCheckout('growth')">Upgrade to Growth &rarr;</button>
                </div>
                <div class="pricing-features-list">
                  <div class="pricing-feature-section-title" style="color:rgba(255,255,255,0.6);">Core Platform</div>
                  ${pricingFeatureFeatured(true, '@zexcore/core micro-kernel')}
                  ${pricingFeatureFeatured(true, 'Unlimited multi-tenant RLS')}
                  ${pricingFeatureFeatured(true, 'Identity, RBAC & SSO-ready')}
                  ${pricingFeatureFeatured(true, 'Core EventBus broker')}
                  ${pricingFeatureFeatured(true, 'Deterministic AST rule engine')}
                  ${pricingFeatureFeatured(true, 'IoT telemetry ingestion module')}
                  ${pricingFeatureFeatured(true, 'CRM sales pipeline module')}
                  ${pricingFeatureFeatured(false, 'Compliance & GDPR vault')}
                  <div class="pricing-feature-section-title" style="margin-top:16px;color:rgba(255,255,255,0.6);">Infrastructure</div>
                  ${pricingFeatureFeatured(true, 'Self-hosted or managed cloud')}
                  ${pricingFeatureFeatured(true, 'Managed PostgreSQL 17 cluster')}
                  ${pricingFeatureFeatured(false, 'Multi-region replication')}
                  ${pricingFeatureFeatured(false, 'SLA uptime guarantee')}
                  <div class="pricing-feature-section-title" style="margin-top:16px;color:rgba(255,255,255,0.6);">Support</div>
                  ${pricingFeatureFeatured(true, 'Priority email support')}
                  ${pricingFeatureFeatured(true, '48h response SLA')}
                  ${pricingFeatureFeatured(false, 'Dedicated support engineer')}
                </div>
              </div>

              <!-- SCALE -->
              <div class="pricing-card">
                <div class="pricing-card-top">
                  <div class="pricing-tier-label">SCALE</div>
                  <div class="pricing-price-block">
                    <span class="pricing-currency">$</span>
                    <span class="pricing-amount" data-monthly="1299" data-annual="1169">1299</span>
                    <span class="pricing-period">/ mo</span>
                  </div>
                  <p class="pricing-desc">Production SaaS companies needing complete compliance vault, GDPR erasure, and multi-region infrastructure.</p>
                  <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:20px;" onclick="window.startStripeCheckout('scale')">Unlock Scale &rarr;</button>
                </div>
                <div class="pricing-features-list">
                  <div class="pricing-feature-section-title">Core Platform</div>
                  ${pricingFeature(true, '@zexcore/core micro-kernel')}
                  ${pricingFeature(true, 'Unlimited multi-tenant RLS')}
                  ${pricingFeature(true, 'Identity, RBAC & SSO')}
                  ${pricingFeature(true, 'Core EventBus broker')}
                  ${pricingFeature(true, 'Deterministic AST rule engine')}
                  ${pricingFeature(true, 'IoT telemetry ingestion module')}
                  ${pricingFeature(true, 'CRM sales pipeline module')}
                  ${pricingFeature(true, 'Compliance & GDPR vault')}
                  <div class="pricing-feature-section-title" style="margin-top:16px;">Infrastructure</div>
                  ${pricingFeature(true, 'Self-hosted or managed cloud')}
                  ${pricingFeature(true, 'Dedicated PostgreSQL 17 cluster')}
                  ${pricingFeature(true, 'Multi-region active replication')}
                  ${pricingFeature(true, '99.9% uptime SLA')}
                  <div class="pricing-feature-section-title" style="margin-top:16px;">Support</div>
                  ${pricingFeature(true, 'Priority email support')}
                  ${pricingFeature(true, '24h critical response SLA')}
                  ${pricingFeature(false, 'Dedicated support engineer')}
                </div>
              </div>

              <!-- ENTERPRISE — full width -->
              <div class="pricing-card pricing-card-enterprise">
                <div class="pricing-card-top" style="display:flex;gap:40px;align-items:flex-start;flex-wrap:wrap;">
                  <div style="flex:1;min-width:220px;">
                    <div class="pricing-tier-label">ENTERPRISE</div>
                    <div class="pricing-price-block">
                      <span class="pricing-currency">$</span>
                      <span class="pricing-amount" data-monthly="3500" data-annual="3150">3500</span>
                      <span class="pricing-period">/ mo</span>
                    </div>
                    <p class="pricing-desc">Dedicated infrastructure, compliance vault, multi-region active-active, and 99.99% SLA. For regulated industries.</p>
                    <button class="btn btn-primary" style="margin-top:20px;padding:11px 28px;" onclick="window.startStripeCheckout('enterprise')">Subscribe Enterprise &rarr;</button>
                  </div>
                  <div style="flex:2;min-width:280px;display:grid;grid-template-columns:repeat(3,1fr);gap:0 24px;">
                    <div>
                      <div class="pricing-feature-section-title">Core Platform</div>
                      ${pricingFeature(true, 'Full @zexcore/core micro-kernel')}
                      ${pricingFeature(true, 'Unlimited multi-tenant RLS')}
                      ${pricingFeature(true, 'Identity, RBAC, SSO & SAML')}
                      ${pricingFeature(true, 'Core EventBus broker')}
                      ${pricingFeature(true, 'Deterministic AST rule engine')}
                      ${pricingFeature(true, 'IoT telemetry ingestion module')}
                      ${pricingFeature(true, 'CRM sales pipeline module')}
                      ${pricingFeature(true, 'Compliance & GDPR vault')}
                    </div>
                    <div>
                      <div class="pricing-feature-section-title">Infrastructure</div>
                      ${pricingFeature(true, 'Self-hosted or managed cloud')}
                      ${pricingFeature(true, 'Dedicated managed cluster')}
                      ${pricingFeature(true, 'Multi-region active replication')}
                      ${pricingFeature(true, '99.99% uptime SLA')}
                      ${pricingFeature(true, 'Point-in-time recovery')}
                      ${pricingFeature(true, 'Custom network isolation')}
                    </div>
                    <div>
                      <div class="pricing-feature-section-title">Support & Compliance</div>
                      ${pricingFeature(true, 'Dedicated support engineer')}
                      ${pricingFeature(true, '4h critical response SLA')}
                      ${pricingFeature(true, 'Onboarding & arch review')}
                      ${pricingFeature(true, 'SOC 2 Type II docs')}
                      ${pricingFeature(true, 'Custom SLAs & contracts')}
                      ${pricingFeature(true, 'Multi-region active-active')}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- COMPARISON TABLE -->
        <section class="section-tinted-red section-padded" style="padding:80px 0;">
          <div class="site-container">
            <div class="section-header-block">
              <div class="section-eyebrow">DETAILED COMPARISON</div>
              <h2 class="section-title">Full Platform Feature Matrix</h2>
              <p class="section-desc">Every technical capability, infrastructure component, and support commitment — side by side.</p>
            </div>
            <div class="table-container-card" style="overflow-x:auto;">
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th class="comp-th-feature">Feature</th>
                    <th class="comp-th-tier">Starter</th>
                    <th class="comp-th-tier">Indie</th>
                    <th class="comp-th-tier comp-th-featured">Growth</th>
                    <th class="comp-th-tier">Scale</th>
                    <th class="comp-th-tier">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  ${compSection('TENANCY & ISOLATION')}
                  ${compRow5('Multi-tenant RLS enforcement', 'Up to 5', 'Up to 25', 'Unlimited', 'Unlimited', 'Unlimited')}
                  ${compRow5('PostgreSQL composite key invariants', true, true, true, true, true)}
                  ${compRow5('Session-bound SET LOCAL context', true, true, true, true, true)}
                  ${compRow5('NOSUPERUSER application role', true, true, true, true, true)}
                  ${compRow5('Cross-tenant foreign key prevention', true, true, true, true, true)}
                  ${compSection('CORE MODULES')}
                  ${compRow5('@zexcore/core micro-kernel', true, true, true, true, true)}
                  ${compRow5('@zexcore/module-iot telemetry', false, true, true, true, true)}
                  ${compRow5('@zexcore/rules deterministic engine', true, true, true, true, true)}
                  ${compRow5('@zexcore/module-crm pipeline', false, false, true, true, true)}
                  ${compRow5('@zexcore/compliance GDPR vault', false, false, false, true, true)}
                  ${compSection('SECURITY & COMPLIANCE')}
                  ${compRow5('AES-256-GCM envelope encryption', false, false, true, true, true)}
                  ${compRow5('HMAC-SHA256 blind index querying', false, false, true, true, true)}
                  ${compRow5('Append-only audit ledger', true, true, true, true, true)}
                  ${compRow5('GDPR Article 17 erasure pipeline', false, false, false, true, true)}
                  ${compRow5('SSRF private range filtering', true, true, true, true, true)}
                  ${compSection('INFRASTRUCTURE')}
                  ${compRow5('Self-hosted deployment', true, true, true, true, true)}
                  ${compRow5('Managed cloud hosting', false, 'Shared', true, true, true)}
                  ${compRow5('Dedicated managed cluster', false, false, false, true, true)}
                  ${compRow5('Multi-region active replication', false, false, false, true, true)}
                  ${compRow5('Backup & point-in-time recovery', false, false, true, true, true)}
                  ${compRow5('99.99% uptime SLA', false, false, false, false, true)}
                  ${compSection('SUPPORT & ONBOARDING')}
                  ${compRow5('Community forum', true, true, true, true, true)}
                  ${compRow5('Email support', false, '72h SLA', '48h SLA', '24h SLA', '4h SLA')}
                  ${compRow5('Dedicated support engineer', false, false, false, false, true)}
                  ${compRow5('Architecture review session', false, false, false, false, true)}
                  ${compRow5('Custom integration assistance', false, false, false, false, true)}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- FAQ -->
        <section class="section-white section-padded" style="padding:80px 0;">
          <div class="site-container">
            <div class="section-header-block">
              <div class="section-eyebrow">FREQUENTLY ASKED</div>
              <h2 class="section-title">Licensing Questions Answered</h2>
            </div>
            <div class="faq-grid">
              ${faqItem('How is ZexCore licensed?', 'ZexCore is licensed per platform tier, not per user or per tenant. You pay for the infrastructure and module capabilities you need — not for the number of end users or tenants your customers bring to your SaaS product.')}
              ${faqItem('Can I self-host on any tier?', 'Yes. All tiers support self-hosted deployment on your own infrastructure. The Indie tier and above additionally offer managed cloud hosting where ZexCore operates the PostgreSQL cluster, security patching, backups, and failover on your behalf.')}
              ${faqItem('What counts as a "tenant" in ZexCore?', 'A tenant is any isolated organizational unit mapped to its own RLS context. Starter supports up to 5, Indie up to 25, while Growth, Scale, and Enterprise support unlimited tenants.')}
              ${faqItem('How does the annual discount work?', 'Switching to annual billing gives you 10% off every plan. You are billed once per year for the full period. All sales are final — no refunds are issued for unused time.')}
              ${faqItem('Is there a free trial for Growth or Scale?', 'Yes. You can trial the Growth or Scale tiers for 30 days — full access to all modules and managed hosting — with no credit card required. Enterprise trials are available on request with a 30-minute architecture call.')}
              ${faqItem('Can I use ZexCore modules independently?', 'The @zexcore/core micro-kernel is mandatory as it provides the tenancy, identity, and audit foundations. Domain modules (@zexcore/module-iot, @zexcore/module-crm, @zexcore/compliance) can be composed independently on top of it.')}
            </div>
          </div>
        </section>

        <!-- ENTERPRISE CTA -->
        <section class="section-tinted-red" style="padding:80px 0;">
          <div class="site-container">
            <div class="enterprise-contact-block">
              <div class="enterprise-contact-text">
                <div class="section-eyebrow">ENTERPRISE PROCUREMENT</div>
                <h2 class="section-title" style="text-align:left;margin-bottom:12px;">Need a Custom Deployment?</h2>
                <p class="section-desc" style="text-align:left;max-width:560px;">For regulated industries — pharmaceutical, energy, manufacturing, fintech — we offer tailored infrastructure contracts, dedicated cluster deployments, and compliance audit support.</p>
                <div class="enterprise-contact-bullets">
                  <div class="enterprise-bullet">✓ Custom SLAs and uptime commitments</div>
                  <div class="enterprise-bullet">✓ SOC 2 Type II readiness documentation</div>
                  <div class="enterprise-bullet">✓ Dedicated PostgreSQL cluster</div>
                  <div class="enterprise-bullet">✓ Multi-region active-active replication</div>
                </div>
              </div>
              <div class="enterprise-contact-form-card">
                <div style="font-size:0.85rem;font-weight:700;color:var(--text-main);margin-bottom:16px;">Talk to an Infrastructure Engineer</div>
                <div class="form-group">
                  <label class="form-label" for="contact-name">Full Name</label>
                  <input type="text" id="contact-name" class="input" placeholder="Jane Smith" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="contact-email">Work Email</label>
                  <input type="email" id="contact-email" class="input" placeholder="jane@company.com" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="contact-company">Company & Industry</label>
                  <input type="text" id="contact-company" class="input" placeholder="Acme Industrial — Manufacturing" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="contact-message">Deployment Requirements</label>
                  <textarea class="textarea" id="contact-message" placeholder="Describe your tenant scale, compliance requirements, or infrastructure constraints..." style="min-height:90px;"></textarea>
                </div>
                <button class="btn btn-primary" id="btn-pricing-contact-submit" style="width:100%;justify-content:center;padding:11px;">Request Enterprise Briefing →</button>
              </div>
            </div>
          </div>
        </section>

      </main>
      ${renderFooter()}
    </div>
  `;
}
