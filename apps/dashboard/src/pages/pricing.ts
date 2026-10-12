/**
 * ZexCore Pricing Page
 * Enterprise Infrastructure Platform — Tier-Based Licensing
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderPricingPage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('pricing')}

      <main>
        <!-- ── PRICING HERO ─────────────────────────────────────────────── -->
        <section class="page-intro-section" style="padding-bottom: 72px;">
          <div class="site-container">
            <div class="pricing-hero-block">
              <div class="section-eyebrow">TRANSPARENT INFRASTRUCTURE LICENSING</div>
              <h1 class="page-intro-title" style="max-width: 820px; margin-bottom: 18px;">
                One Core.<br />
                <span class="text-brand">Right-Sized Pricing.</span>
              </h1>
              <p class="page-intro-desc" style="max-width: 680px; margin-bottom: 36px;">
                ZexCore licenses align to your operational scale — from early-stage product teams shipping their first vertical SaaS module, to enterprise organizations running mission-critical multi-tenant infrastructure across multiple regions.
              </p>
              <div class="pricing-trust-row">
                <div class="trust-fact">
                  <strong>No per-seat fees</strong>
                  <span>License by platform tier</span>
                </div>
                <div class="trust-divider"></div>
                <div class="trust-fact">
                  <strong>SLA-backed uptime</strong>
                  <span>99.99% on Enterprise</span>
                </div>
                <div class="trust-divider"></div>
                <div class="trust-fact">
                  <strong>Data sovereignty</strong>
                  <span>Self-hosted or managed</span>
                </div>
                <div class="trust-divider"></div>
                <div class="trust-fact">
                  <strong>PostgreSQL 17 RLS</strong>
                  <span>Hard tenant isolation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── PRICING TIERS ────────────────────────────────────────────── -->
        <section class="section-gray section-padded" style="padding: 72px 0;">
          <div class="site-container">
            <div class="pricing-grid">

              <!-- STARTER -->
              <div class="pricing-card">
                <div class="pricing-card-top">
                  <div class="pricing-tier-label">STARTER</div>
                  <div class="pricing-price-block">
                    <span class="pricing-currency">$</span>
                    <span class="pricing-amount">0</span>
                    <span class="pricing-period">/ mo</span>
                  </div>
                  <p class="pricing-desc">
                    Self-hosted. For teams evaluating ZexCore or shipping a single-tenant proof of concept.
                  </p>
                  <a href="#/signin" class="btn btn-secondary" style="width: 100%; justify-content: center; margin-top: 20px;" id="btn-pricing-start-starter">
                    Get Started Free
                  </a>
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
                  <div class="pricing-feature-section-title" style="margin-top: 16px;">Infrastructure</div>
                  ${pricingFeature(true, 'Self-hosted deployment')}
                  ${pricingFeature(false, 'Managed cloud hosting')}
                  ${pricingFeature(false, 'Multi-region replication')}
                  ${pricingFeature(false, 'SLA uptime guarantee')}
                  <div class="pricing-feature-section-title" style="margin-top: 16px;">Support</div>
                  ${pricingFeature(true, 'Community forum access')}
                  ${pricingFeature(false, 'Email support')}
                  ${pricingFeature(false, 'Dedicated support engineer')}
                </div>
              </div>

              <!-- SCALE (FEATURED) -->
              <div class="pricing-card pricing-card-featured">
                <div class="pricing-featured-tag">MOST POPULAR</div>
                <div class="pricing-card-top">
                  <div class="pricing-tier-label" style="color: #FFFFFF; opacity: 0.7;">SCALE</div>
                  <div class="pricing-price-block">
                    <span class="pricing-currency" style="color: #FFFFFF;">$</span>
                    <span class="pricing-amount" style="color: #FFFFFF;">1,200</span>
                    <span class="pricing-period" style="color: rgba(255,255,255,0.7);">/ mo</span>
                  </div>
                  <p class="pricing-desc" style="color: rgba(255,255,255,0.8);">
                    Managed or self-hosted. For product teams shipping production-grade vertical SaaS to real customers.
                  </p>
                  <a href="#/signin" class="btn" style="width: 100%; justify-content: center; margin-top: 20px; background: #FFFFFF; color: var(--primary); border-color: #FFFFFF; font-weight: 700;" id="btn-pricing-start-scale">
                    Start Scale Trial →
                  </a>
                </div>
                <div class="pricing-features-list">
                  <div class="pricing-feature-section-title" style="color: rgba(255,255,255,0.6);">Core Platform</div>
                  ${pricingFeatureFeatured(true, '@zexcore/core micro-kernel')}
                  ${pricingFeatureFeatured(true, 'Unlimited multi-tenant RLS')}
                  ${pricingFeatureFeatured(true, 'Identity, RBAC & SSO-ready')}
                  ${pricingFeatureFeatured(true, 'Core EventBus broker')}
                  ${pricingFeatureFeatured(true, 'Deterministic AST rule engine')}
                  ${pricingFeatureFeatured(true, 'IoT telemetry ingestion module')}
                  ${pricingFeatureFeatured(true, 'CRM sales pipeline module')}
                  ${pricingFeatureFeatured(false, 'Compliance & GDPR vault')}
                  <div class="pricing-feature-section-title" style="margin-top: 16px; color: rgba(255,255,255,0.6);">Infrastructure</div>
                  ${pricingFeatureFeatured(true, 'Self-hosted or managed cloud')}
                  ${pricingFeatureFeatured(true, 'Managed PostgreSQL 17 cluster')}
                  ${pricingFeatureFeatured(false, 'Multi-region replication')}
                  ${pricingFeatureFeatured(false, 'SLA uptime guarantee')}
                  <div class="pricing-feature-section-title" style="margin-top: 16px; color: rgba(255,255,255,0.6);">Support</div>
                  ${pricingFeatureFeatured(true, 'Priority email support')}
                  ${pricingFeatureFeatured(true, '48h response SLA')}
                  ${pricingFeatureFeatured(false, 'Dedicated support engineer')}
                </div>
              </div>

              <!-- ENTERPRISE -->
              <div class="pricing-card">
                <div class="pricing-card-top">
                  <div class="pricing-tier-label">ENTERPRISE</div>
                  <div class="pricing-price-block">
                    <span class="pricing-amount" style="font-size: 2rem; letter-spacing: -0.01em;">Custom</span>
                  </div>
                  <p class="pricing-desc">
                    Dedicated infrastructure, compliance vault, multi-region, and 99.99% SLA. For regulated industries at scale.
                  </p>
                  <a href="#/signin" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 20px;" id="btn-pricing-start-enterprise">
                    Contact Sales →
                  </a>
                </div>
                <div class="pricing-features-list">
                  <div class="pricing-feature-section-title">Core Platform</div>
                  ${pricingFeature(true, 'Full @zexcore/core micro-kernel')}
                  ${pricingFeature(true, 'Unlimited multi-tenant RLS')}
                  ${pricingFeature(true, 'Identity, RBAC, SSO & SAML')}
                  ${pricingFeature(true, 'Core EventBus broker')}
                  ${pricingFeature(true, 'Deterministic AST rule engine')}
                  ${pricingFeature(true, 'IoT telemetry ingestion module')}
                  ${pricingFeature(true, 'CRM sales pipeline module')}
                  ${pricingFeature(true, 'Compliance & GDPR vault')}
                  <div class="pricing-feature-section-title" style="margin-top: 16px;">Infrastructure</div>
                  ${pricingFeature(true, 'Self-hosted or managed cloud')}
                  ${pricingFeature(true, 'Dedicated managed cluster')}
                  ${pricingFeature(true, 'Multi-region active replication')}
                  ${pricingFeature(true, '99.99% uptime SLA')}
                  <div class="pricing-feature-section-title" style="margin-top: 16px;">Support</div>
                  ${pricingFeature(true, 'Dedicated support engineer')}
                  ${pricingFeature(true, '4h critical response SLA')}
                  ${pricingFeature(true, 'Onboarding & architecture review')}
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- ── COMPARISON TABLE ─────────────────────────────────────────── -->
        <section class="section-white section-padded" style="padding: 80px 0;">
          <div class="site-container">
            <div class="section-header-block">
              <div class="section-eyebrow">DETAILED COMPARISON</div>
              <h2 class="section-title">Full Platform Feature Matrix</h2>
              <p class="section-desc">Every technical capability, infrastructure component, and support commitment — side by side.</p>
            </div>

            <div class="table-container-card" style="overflow-x: auto;">
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th class="comp-th-feature">Feature</th>
                    <th class="comp-th-tier">Starter</th>
                    <th class="comp-th-tier comp-th-featured">Scale</th>
                    <th class="comp-th-tier">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  ${compSection('TENANCY & ISOLATION')}
                  ${compRow('Multi-tenant RLS enforcement', 'Up to 5', 'Unlimited', 'Unlimited')}
                  ${compRow('PostgreSQL composite key invariants', true, true, true)}
                  ${compRow('Session-bound SET LOCAL context', true, true, true)}
                  ${compRow('NOSUPERUSER application role', true, true, true)}
                  ${compRow('Cross-tenant foreign key prevention', true, true, true)}
                  ${compSection('CORE MODULES')}
                  ${compRow('@zexcore/core micro-kernel', true, true, true)}
                  ${compRow('@zexcore/module-iot telemetry', false, true, true)}
                  ${compRow('@zexcore/rules deterministic engine', true, true, true)}
                  ${compRow('@zexcore/module-crm pipeline', false, true, true)}
                  ${compRow('@zexcore/compliance GDPR vault', false, false, true)}
                  ${compSection('SECURITY & COMPLIANCE')}
                  ${compRow('AES-256-GCM envelope encryption', false, true, true)}
                  ${compRow('HMAC-SHA256 blind index querying', false, true, true)}
                  ${compRow('Append-only audit ledger', true, true, true)}
                  ${compRow('GDPR Article 17 erasure pipeline', false, false, true)}
                  ${compRow('SSRF private range filtering', true, true, true)}
                  ${compSection('INFRASTRUCTURE')}
                  ${compRow('Self-hosted deployment', true, true, true)}
                  ${compRow('Managed cloud hosting', false, true, true)}
                  ${compRow('Dedicated managed cluster', false, false, true)}
                  ${compRow('Multi-region active replication', false, false, true)}
                  ${compRow('Backup & point-in-time recovery', false, true, true)}
                  ${compRow('99.99% uptime SLA', false, false, true)}
                  ${compSection('SUPPORT & ONBOARDING')}
                  ${compRow('Community forum', true, true, true)}
                  ${compRow('Priority email support', false, true, true)}
                  ${compRow('Dedicated support engineer', false, false, true)}
                  ${compRow('Architecture review session', false, false, true)}
                  ${compRow('Custom integration assistance', false, false, true)}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- ── FAQ ─────────────────────────────────────────────────────── -->
        <section class="section-gray section-padded" style="padding: 80px 0;">
          <div class="site-container">
            <div class="section-header-block">
              <div class="section-eyebrow">FREQUENTLY ASKED</div>
              <h2 class="section-title">Licensing Questions Answered</h2>
            </div>

            <div class="faq-grid">
              ${faqItem(
                'How is ZexCore licensed?',
                'ZexCore is licensed per platform tier, not per user or per tenant. You pay for the infrastructure and module capabilities you need — not for the number of end users or tenants your customers bring to your SaaS product.'
              )}
              ${faqItem(
                'Can I self-host on any tier?',
                'Yes. All tiers support self-hosted deployment on your own infrastructure. The Scale and Enterprise tiers additionally offer managed cloud hosting where ZexCore operates the PostgreSQL cluster, security patching, backups, and failover on your behalf.'
              )}
              ${faqItem(
                'What counts as a "tenant" in ZexCore?',
                'A tenant is any isolated organizational unit mapped to its own RLS context — typically a customer of your vertical SaaS product. The Starter tier supports up to 5 tenants, while Scale and Enterprise support unlimited tenants.'
              )}
              ${faqItem(
                'How does the GDPR Compliance Vault work?',
                'The compliance module provides AES-256-GCM envelope encryption, HMAC blind-index querying, consent ledger management with lawful basis tracking, and one-click GDPR Article 17 Right to be Forgotten execution — including audit ledger entries and anonymization pipelines.'
              )}
              ${faqItem(
                'Is there a free trial for Scale?',
                'Yes. You can trial the Scale tier for 30 days — full access to all Scale-tier modules and managed hosting — with no credit card required. Enterprise trials are available on request with a 30-minute architecture call.'
              )}
              ${faqItem(
                'Can I use ZexCore modules independently?',
                'The @zexcore/core micro-kernel is mandatory as it provides the tenancy, identity, and audit foundations. Domain modules (@zexcore/module-iot, @zexcore/module-crm, @zexcore/compliance) can be composed independently on top of it.'
              )}
            </div>
          </div>
        </section>

        <!-- ── ENTERPRISE CTA ───────────────────────────────────────────── -->
        <section class="section-white" style="padding: 80px 0; border-top: 1px solid var(--border-default);">
          <div class="site-container">
            <div class="enterprise-contact-block">
              <div class="enterprise-contact-text">
                <div class="section-eyebrow">ENTERPRISE PROCUREMENT</div>
                <h2 class="section-title" style="text-align: left; margin-bottom: 12px;">
                  Need a Custom Deployment?
                </h2>
                <p class="section-desc" style="text-align: left; max-width: 560px;">
                  For regulated industries — pharmaceutical, energy, manufacturing, fintech — we offer tailored infrastructure contracts, dedicated cluster deployments, compliance audit support, and architecture review sessions.
                </p>
                <div class="enterprise-contact-bullets">
                  <div class="enterprise-bullet">✓ Custom SLAs and uptime commitments</div>
                  <div class="enterprise-bullet">✓ SOC 2 Type II readiness documentation</div>
                  <div class="enterprise-bullet">✓ Dedicated Fastify + PostgreSQL cluster</div>
                  <div class="enterprise-bullet">✓ Multi-region active-active replication</div>
                </div>
              </div>
              <div class="enterprise-contact-form-card">
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 16px;">
                  Talk to an Infrastructure Engineer
                </div>
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
                  <textarea class="textarea" id="contact-message" placeholder="Describe your tenant scale, compliance requirements, or infrastructure constraints..." style="min-height: 90px;"></textarea>
                </div>
                <button class="btn btn-primary" id="btn-pricing-contact-submit" style="width: 100%; justify-content: center; padding: 11px;">
                  Request Enterprise Briefing →
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}

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
      <td colspan="4">${title}</td>
    </tr>
  `;
}

function compRow(label: string, starter: boolean | string, scale: boolean | string, enterprise: boolean | string): string {
  const cell = (v: boolean | string, featured = false) => {
    if (typeof v === 'boolean') {
      return `<td class="comp-td-tier ${featured ? 'comp-featured-col' : ''}">
        ${v
          ? `<span class="comp-check ${featured ? 'featured' : ''}">✓</span>`
          : `<span class="comp-dash">—</span>`}
      </td>`;
    }
    return `<td class="comp-td-tier ${featured ? 'comp-featured-col' : ''}" style="font-size: 0.8rem; font-weight: 600; color: ${featured ? 'var(--primary)' : 'var(--text-main)'};">${v}</td>`;
  };
  return `
    <tr class="comp-data-row">
      <td class="comp-td-feature">${label}</td>
      ${cell(starter)}
      ${cell(scale, true)}
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
