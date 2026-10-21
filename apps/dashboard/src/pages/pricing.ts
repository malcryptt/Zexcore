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

function compSection(title: string): string {
  return `
    <tr class="comp-section-row">
      <td colspan="7" style="background:#f8fafc; font-weight:800; font-size:0.75rem; letter-spacing:0.06em; color:#475569; padding:12px 16px; border-bottom:1.5px solid var(--border-default); text-transform:uppercase;">${title}</td>
    </tr>
  `;
}

function compRow6(
  label: string,
  free: boolean | string,
  starter: boolean | string,
  growth: boolean | string,
  agency: boolean | string,
  enterprise: boolean | string,
  dedicated: boolean | string
): string {
  const cell = (v: boolean | string, featured = false) => {
    if (typeof v === 'boolean') {
      return `<td class="comp-td-tier ${featured ? 'comp-featured-col' : ''}" style="text-align:center; padding:12px 14px;">
        ${v ? `<span class="comp-check ${featured ? 'featured' : ''}" style="color:${featured ? '#e11d48' : '#16a34a'}; font-weight:800;">✓</span>` : `<span class="comp-dash" style="color:#94a3b8;">—</span>`}
      </td>`;
    }
    return `<td class="comp-td-tier ${featured ? 'comp-featured-col' : ''}" style="text-align:center; font-size:0.78rem; font-weight:700; color:${featured ? '#e11d48' : 'var(--text-main)'}; padding:12px 14px;">${v}</td>`;
  };
  return `
    <tr class="comp-data-row" style="border-bottom:1px solid #f1f5f9;">
      <td class="comp-td-feature" style="padding:12px 16px; font-weight:600; color:var(--text-main); font-size:0.82rem;">${label}</td>
      ${cell(free)}
      ${cell(starter)}
      ${cell(growth, true)}
      ${cell(agency)}
      ${cell(enterprise)}
      ${cell(dedicated)}
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
        <section class="page-intro-section" style="padding-bottom:56px;">
          <div class="page-hero-backdrop" style="background-image:url('/heroes/hero-pricing.jpg');"></div>
          <div class="site-container">
            <div class="page-intro-header page-hero-content-col" style="text-align:center; max-width:820px; margin:0 auto;">
              <div class="section-eyebrow">TRANSPARENT TIER LICENSING</div>
              <h1 class="page-intro-title" style="margin-bottom:16px;">
                Predictable Infrastructure.<br />
                <span class="text-brand">Engineered to Scale With You.</span>
              </h1>
              <p class="page-intro-desc" style="max-width:700px; margin:0 auto; font-size:1.05rem;">
                From solo founders testing ideas to growing clinics and multi-tenant agencies running mission-critical workloads. Zero hidden fees.
              </p>
            </div>
          </div>
        </section>

        <!-- BILLING TOGGLE -->
        <section style="background:var(--bg-page); padding:32px 0 16px;">
          <div class="site-container" style="display:flex; flex-direction:column; align-items:center; gap:8px;">
            <div class="billing-toggle-wrap" id="billing-toggle-wrap">
              <button class="billing-toggle-btn active" id="btn-billing-monthly" onclick="window.setPricingBilling('monthly')">Monthly</button>
              <button class="billing-toggle-btn" id="btn-billing-annual" onclick="window.setPricingBilling('annual')">
                Yearly <span class="billing-save-badge">Save 2 Months Free</span>
              </button>
            </div>
            <div class="billing-annual-note" id="billing-annual-note" style="display:none; color:var(--text-secondary); font-size:0.82rem; margin-top:4px;">
              Billed yearly — pay for 10 months and get 2 full months free. Cancel anytime.
            </div>
          </div>
        </section>

        <!-- 6-TIER PRICING GRID -->
        <section style="background:var(--bg-page); padding:32px 0 80px;">
          <div class="site-container">
            <div class="pricing-grid-3col">

              <!-- 1. FREE -->
              <div class="pricing-card" style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div class="pricing-card-top">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <div class="pricing-tier-label">FREE</div>
                      <span style="font-size:0.7rem; font-weight:700; color:#64748b; background:#f1f5f9; padding:2px 8px; border-radius:12px;">Free trial</span>
                    </div>
                    <div class="pricing-price-block">
                      <span class="pricing-currency">$</span>
                      <span class="pricing-amount" data-monthly="0" data-annual="0">0</span>
                      <span class="pricing-period">/ mo</span>
                    </div>
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text-main); margin-top:8px;">Who it’s for:</div>
                    <p class="pricing-desc" style="margin-top:2px;">Trying it out with basic CMS and ZexCore subdomain.</p>

                    <div style="background:#f8fafc; border:1px solid var(--border-default); border-radius:6px; padding:10px; margin-top:14px; font-size:0.75rem;">
                      <div style="font-weight:700; color:var(--text-secondary); margin-bottom:4px;">Main Limits:</div>
                      <div style="color:var(--text-main); line-height:1.4;">1 workspace &bull; CMS only &bull; ZexCore subdomain &bull; ZexCore branding &bull; 1 user</div>
                    </div>

                    <button class="btn btn-secondary" style="width:100%; justify-content:center; margin-top:18px;" onclick="window.startStripeCheckout('free')">
                      Get Started Free &rarr;
                    </button>
                  </div>
                  <div class="pricing-features-list">
                    <div class="pricing-feature-section-title">Included Features</div>
                    ${pricingFeature(true, '1 workspace')}
                    ${pricingFeature(true, 'CMS & site builder')}
                    ${pricingFeature(true, 'ZexCore subdomain')}
                    ${pricingFeature(true, '1 team user')}
                    ${pricingFeature(true, 'Audit Basic (5 posture checks & 7-day log)')}
                    ${pricingFeature(false, 'Custom domain')}
                    ${pricingFeature(false, 'CRM contact manager')}
                    ${pricingFeature(false, 'Appointment booking')}
                  </div>
                </div>
              </div>

              <!-- 2. STARTER -->
              <div class="pricing-card" style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div class="pricing-card-top">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <div class="pricing-tier-label">STARTER</div>
                      <span style="font-size:0.7rem; font-weight:700; color:#15803d; background:#dcfce7; padding:2px 8px; border-radius:12px;">Small business</span>
                    </div>
                    <div class="pricing-price-block">
                      <span class="pricing-currency">$</span>
                      <span class="pricing-amount" data-monthly="19" data-annual="190">19</span>
                      <span class="pricing-period">/ mo</span>
                    </div>
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text-main); margin-top:8px;">Who it’s for:</div>
                    <p class="pricing-desc" style="margin-top:2px;">One small business needing CMS plus a basic CRM pipeline.</p>

                    <div style="background:#f8fafc; border:1px solid var(--border-default); border-radius:6px; padding:10px; margin-top:14px; font-size:0.75rem;">
                      <div style="font-weight:700; color:var(--text-secondary); margin-bottom:4px;">Main Limits:</div>
                      <div style="color:var(--text-main); line-height:1.4;">CMS plus basic CRM &bull; 1 custom domain &bull; 3 users &bull; 1,000 contacts</div>
                    </div>

                    <button class="btn btn-secondary" style="width:100%; justify-content:center; margin-top:18px;" onclick="window.startStripeCheckout('starter')">
                      Start Starter &rarr;
                    </button>
                  </div>
                  <div class="pricing-features-list">
                    <div class="pricing-feature-section-title">Included Features</div>
                    ${pricingFeature(true, 'CMS plus basic CRM')}
                    ${pricingFeature(true, '1 custom domain')}
                    ${pricingFeature(true, '3 team users')}
                    ${pricingFeature(true, 'Up to 1,000 contacts')}
                    ${pricingFeature(true, 'Lead stage pipeline tracking')}
                    ${pricingFeature(true, 'Audit Basic (5 posture checks & 30-day log)')}
                    ${pricingFeature(false, 'Client booking & appointments')}
                    ${pricingFeature(false, 'Automation event rules')}
                  </div>
                </div>
              </div>

              <!-- 3. GROWTH (FEATURED) -->
              <div class="pricing-card pricing-card-featured" style="display:flex; flex-direction:column; justify-content:space-between; border: 2.5px solid var(--primary); box-shadow: 0 12px 32px rgba(229,9,32,0.12); position:relative;">
                <div>
                  <div class="pricing-featured-tag" style="background:var(--primary); color:#fff; font-weight:850; font-size:0.68rem; letter-spacing:0.08em; padding:6px; text-align:center;">MOST POPULAR</div>
                  <div class="pricing-card-top" style="background:#fff7f8;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <div class="pricing-tier-label" style="color:var(--primary); font-weight:850;">GROWTH</div>
                      <span style="font-size:0.7rem; font-weight:800; color:var(--primary); background:#fee2e2; padding:2px 8px; border-radius:12px; border:1px solid #fecaca;">Growing business</span>
                    </div>
                    <div class="pricing-price-block">
                      <span class="pricing-currency" style="color:var(--text-main); font-weight:800;">$</span>
                      <span class="pricing-amount" data-monthly="49" data-annual="490" style="color:var(--text-main); font-weight:850;">49</span>
                      <span class="pricing-period" style="color:var(--text-secondary);">/ mo</span>
                    </div>
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text-main); margin-top:8px;">Who it’s for:</div>
                    <p class="pricing-desc" style="margin-top:2px; color:var(--text-secondary);">A growing business expanding booking, automations, and omnichannel outreach.</p>

                    <div style="background:#ffffff; border:1.5px solid #fca5a5; border-radius:6px; padding:10px; margin-top:14px; font-size:0.75rem;">
                      <div style="font-weight:700; color:var(--primary); margin-bottom:4px;">Main Limits:</div>
                      <div style="color:var(--text-main); line-height:1.4;">Everything in Starter + booking &bull; rules &bull; SMS/email &bull; 10 users &bull; 10,000 contacts &bull; Audit Essentials</div>
                    </div>

                    <button class="btn btn-primary" style="width:100%; justify-content:center; margin-top:18px; font-weight:800;" onclick="window.startStripeCheckout('growth')">
                      Upgrade to Growth &rarr;
                    </button>
                  </div>
                  <div class="pricing-features-list">
                    <div class="pricing-feature-section-title" style="color:#64748b;">Included Features</div>
                    ${pricingFeature(true, 'Everything in Starter')}
                    ${pricingFeature(true, 'Client booking & slot deposits')}
                    ${pricingFeature(true, 'Deterministic automation rules')}
                    ${pricingFeature(true, 'SMS and Email notifications')}
                    ${pricingFeature(true, '10 team users')}
                    ${pricingFeature(true, '10,000 contacts')}
                    ${pricingFeature(true, 'Audit Essentials included (90 days)')}
                    ${pricingFeature(false, 'White-label multi-tenant branding')}
                  </div>
                </div>
              </div>

              <!-- 4. AGENCY -->
              <div class="pricing-card" style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div class="pricing-card-top">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <div class="pricing-tier-label">AGENCY</div>
                      <span style="font-size:0.7rem; font-weight:700; color:#0369a1; background:#e0f2fe; padding:2px 8px; border-radius:12px;">Agencies &amp; studios</span>
                    </div>
                    <div class="pricing-price-block">
                      <span class="pricing-currency">$</span>
                      <span class="pricing-amount" data-monthly="149" data-annual="1490">149</span>
                      <span class="pricing-period">/ mo</span>
                    </div>
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text-main); margin-top:8px;">Who it’s for:</div>
                    <p class="pricing-desc" style="margin-top:2px;">Agencies running ZexCore client workspaces with custom domains.</p>

                    <div style="background:#f8fafc; border:1px solid var(--border-default); border-radius:6px; padding:10px; margin-top:14px; font-size:0.75rem;">
                      <div style="font-weight:700; color:var(--text-secondary); margin-bottom:4px;">Main Limits:</div>
                      <div style="color:var(--text-main); line-height:1.4;">Up to 25 client workspaces &bull; white-label &bull; Audit Essentials per workspace &bull; 25,000 contacts total</div>
                    </div>

                    <button class="btn btn-primary" style="width:100%; justify-content:center; margin-top:18px;" onclick="window.startStripeCheckout('agency')">
                      Deploy Agency &rarr;
                    </button>
                  </div>
                  <div class="pricing-features-list">
                    <div class="pricing-feature-section-title">Included Features</div>
                    ${pricingFeature(true, 'Growth features across client workspaces')}
                    ${pricingFeature(true, 'Up to 25 client workspaces')}
                    ${pricingFeature(true, '25,000 contacts total (shared across workspaces)')}
                    ${pricingFeature(true, 'Complete white-label branding & domains')}
                    ${pricingFeature(true, 'Audit Essentials per workspace')}
                    ${pricingFeature(true, 'IoT Fleet & sensor telemetry hub')}
                    ${pricingFeature(true, 'Multi-tenant client switcher')}
                    ${pricingFeature(false, 'Enterprise SSO & custom SLA')}
                  </div>
                </div>
              </div>

              <!-- 5. ENTERPRISE -->
              <div class="pricing-card" style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div class="pricing-card-top">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <div class="pricing-tier-label">ENTERPRISE</div>
                      <span style="font-size:0.7rem; font-weight:700; color:#334155; background:#f1f5f9; padding:2px 8px; border-radius:12px;">Large organisations</span>
                    </div>
                    <div class="pricing-price-block">
                      <span style="font-size:0.9rem; font-weight:700; color:var(--text-secondary); margin-right:4px;">From</span>
                      <span class="pricing-currency">$</span>
                      <span class="pricing-amount" data-monthly="499" data-annual="4990">499</span>
                      <span class="pricing-period">/ mo</span>
                    </div>
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text-main); margin-top:8px;">Who it’s for:</div>
                    <p class="pricing-desc" style="margin-top:2px;">Larger organisations needing unlimited team scale, SSO, and SLAs.</p>

                    <div style="background:#f8fafc; border:1px solid var(--border-default); border-radius:6px; padding:10px; margin-top:14px; font-size:0.75rem;">
                      <div style="font-weight:700; color:var(--text-secondary); margin-bottom:4px;">Main Limits:</div>
                      <div style="color:var(--text-main); line-height:1.4;">Unlimited users &bull; SSO &bull; SLA &bull; priority support &bull; Audit Business &bull; custom limits</div>
                    </div>

                    <button class="btn btn-primary" style="width:100%; justify-content:center; margin-top:18px;" onclick="window.startStripeCheckout('enterprise')">
                      Subscribe Enterprise &rarr;
                    </button>
                  </div>
                  <div class="pricing-features-list">
                    <div class="pricing-feature-section-title">Included Features</div>
                    ${pricingFeature(true, 'Unlimited users & team seats')}
                    ${pricingFeature(true, 'Single Sign-On (SSO: Okta, Azure, Google)')}
                    ${pricingFeature(true, '99.9% uptime SLA guarantee')}
                    ${pricingFeature(true, 'Priority 24/7 technical support')}
                    ${pricingFeature(true, 'Audit Business (3-year retention & SIEM export)')}
                    ${pricingFeature(true, 'Database encryption-at-rest & in-transit')}
                    ${pricingFeature(true, 'Custom rate limits & scale')}
                    ${pricingFeature(false, 'Dedicated physical HSM instance')}
                  </div>
                </div>
              </div>

              <!-- 6. DEDICATED / REGULATED -->
              <div class="pricing-card" style="display:flex; flex-direction:column; justify-content:space-between; border: 2px solid #a21caf;">
                <div>
                  <div class="pricing-card-top" style="background:#fdf4ff;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <div class="pricing-tier-label" style="color:#86198f;">DEDICATED / REGULATED</div>
                      <span style="font-size:0.7rem; font-weight:800; color:#86198f; background:#fae8ff; padding:2px 8px; border-radius:12px;">Regulated organisations</span>
                    </div>
                    <div class="pricing-price-block">
                      <span style="font-size:0.9rem; font-weight:700; color:var(--text-secondary); margin-right:4px;">From</span>
                      <span class="pricing-currency" style="color:#86198f;">$</span>
                      <span class="pricing-amount" data-monthly="1500" data-annual="15000" style="color:#86198f;">1500</span>
                      <span class="pricing-period">/ mo</span>
                    </div>
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text-main); margin-top:8px;">Who it’s for:</div>
                    <p class="pricing-desc" style="margin-top:2px;">Clinics, hospitals, and compliance-heavy sovereign clients.</p>

                    <div style="background:#fff; border:1px solid #f5d0fe; border-radius:6px; padding:10px; margin-top:14px; font-size:0.75rem;">
                      <div style="font-weight:700; color:#86198f; margin-bottom:4px;">Main Limits:</div>
                      <div style="color:var(--text-main); line-height:1.4;">Dedicated instance &bull; hardened tier &bull; field encryption &bull; signed agreements</div>
                    </div>

                    <button class="btn btn-primary" style="width:100%; justify-content:center; margin-top:18px; background:#86198f; border-color:#86198f;" onclick="window.startStripeCheckout('dedicated')">
                      Deploy Regulated &rarr;
                    </button>
                  </div>
                  <div class="pricing-features-list">
                    <div class="pricing-feature-section-title">Included Features</div>
                    ${pricingFeature(true, 'Dedicated single-tenant cloud instance')}
                    ${pricingFeature(true, 'Hardened infrastructure tier')}
                    ${pricingFeature(true, 'Field-level AES-256-GCM encryption')}
                    ${pricingFeature(true, 'HMAC blind index query engine')}
                    ${pricingFeature(true, 'Data deletion tools (Cryptographic PII erasure)')}
                    ${pricingFeature(true, 'Cryptographic audit ledger & signed evidence packs')}
                    ${pricingFeature(true, 'Signed agreements (BAA, DPA & custom SLA)')}
                    ${pricingFeature(true, 'Dedicated compliance engineer')}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- FULL PLATFORM COMPARISON MATRIX -->
        <section class="section-tinted-red section-padded" style="padding:70px 0;">
          <div class="site-container">
            <div class="section-header-block" style="text-align:center; margin-bottom:36px;">
              <div class="section-eyebrow">DETAILED PLATFORM MATRIX</div>
              <h2 class="section-title">Compare plans</h2>
              <p class="section-desc" style="max-width:680px; margin:0 auto;">Technical capabilities and limits side-by-side.</p>
            </div>
            <div class="table-container-card" style="overflow-x:auto; background:#fff; border:1.5px solid var(--border-default); border-radius:var(--radius-lg); box-shadow:0 4px 16px rgba(0,0,0,0.04);">
              <table class="comparison-table" style="width:100%; border-collapse:collapse; min-width:880px;">
                <thead>
                  <tr style="background:#f8fafc; border-bottom:2px solid var(--border-default);">
                    <th style="padding:16px; text-align:left; font-size:0.8rem; color:#475569; font-weight:800; text-transform:uppercase;">Feature / Limit</th>
                    <th style="padding:16px 12px; text-align:center; font-size:0.8rem; color:#475569; font-weight:800;">Free</th>
                    <th style="padding:16px 12px; text-align:center; font-size:0.8rem; color:#475569; font-weight:800;">Starter</th>
                    <th style="padding:16px 12px; text-align:center; font-size:0.8rem; color:#e11d48; font-weight:800; background:#fff1f2;">Growth</th>
                    <th style="padding:16px 12px; text-align:center; font-size:0.8rem; color:#475569; font-weight:800;">Agency</th>
                    <th style="padding:16px 12px; text-align:center; font-size:0.8rem; color:#475569; font-weight:800;">Enterprise</th>
                    <th style="padding:16px 12px; text-align:center; font-size:0.8rem; color:#86198f; font-weight:800; background:#fdf4ff;">Dedicated</th>
                  </tr>
                </thead>
                <tbody>
                  ${compSection('OVERVIEW & PRICING')}
                  ${compRow6('Monthly Price', '$0', '$19', '$49', '$149', 'From $499', 'From $1,500')}
                  ${compRow6('Yearly Price (Save 2 Mo)', '$0', '$190/yr', '$490/yr', '$1,490/yr', 'From $4,990/yr', 'From $15,000/yr')}
                  ${compRow6('Target User', 'Trying it out', 'Small business', 'Growing business', 'Agencies & studios', 'Large orgs', 'Clinics & regulated')}

                  ${compSection('CAPACITY & WORKSPACES')}
                  ${compRow6('Workspaces / Tenancy', '1 workspace', '1 workspace', '1 workspace', 'Up to 25 workspaces', 'Custom limits', 'Dedicated instance')}
                  ${compRow6('Team Users', '1 user', '3 users', '10 users', 'Unlimited', 'Unlimited', 'Unlimited')}
                  ${compRow6('Contact Capacity', '—', '1,000 contacts', '10,000 contacts', '25,000 contacts total', 'Custom limits', 'Unlimited')}
                  ${compRow6('Custom Domains', 'ZexCore subdomain', '1 custom domain', '1 custom domain', 'Up to 25 custom domains', 'Unlimited custom domains', 'Isolated VPC / Domain')}
                  ${compRow6('Single Sign-On (SSO)', false, false, false, false, 'Google, Okta, Azure AD (SAML)', 'Dedicated IdP isolation & SAML')}

                  ${compSection('CORE MODULES & FEATURES')}
                  ${compRow6('CMS & Site Builder', true, true, true, true, true, true)}
                  ${compRow6('Basic CRM & Deal Tracking', false, true, true, true, true, true)}
                  ${compRow6('Client Booking & Scheduling', false, false, true, true, true, true)}
                  ${compRow6('Deterministic Automation Rules', false, false, true, true, true, true)}
                  ${compRow6('Omnichannel Alerts (SMS & Email)', false, false, true, true, true, true)}
                  ${compRow6('IoT Fleet Telemetry Hub', false, false, false, true, true, true)}
                  ${compRow6('White-Label Branding', false, false, false, true, true, true)}

                  ${compSection('SECURITY, AUDIT & DATA PRIVACY')}
                  ${compRow6('Audit Level', 'Audit Basic (7 days)', 'Audit Basic (30 days)', 'Audit Essentials (90 days)', 'Audit Essentials (per ws)', 'Audit Business (3 years & SIEM)', 'Cryptographic audit ledger')}
                  ${compRow6('Baseline Security Posture Checks', '5 locked checks', '5 locked checks', 'All checks + tunable', 'All checks + tunable', 'Custom rules + SIEM', 'Hardened zero-trust baseline')}
                  ${compRow6('Financial Gateway Reconciliation', false, false, 'Stripe, Paystack & MoMo', 'Per-workspace reconciliation', 'Multi-currency ledger sync', 'Immutable banking ledger & audit')}
                  ${compRow6('Tamper-Resistant Evidence Packs', false, false, 'Standard export', 'Client evidence export', 'Verifiable JSON/PDF bundles', 'Cryptographic block chain export')}
                  ${compRow6('Field-Level AES-256 Encryption', false, false, false, false, false, '✓ (AES-256-GCM field level)')}
                  ${compRow6('HMAC Blind Index Queries', false, false, false, false, false, true)}
                  ${compRow6('Data Deletion Tools', 'Standard delete', 'Standard delete', 'Standard delete & redaction', 'Workspace-level deletion tools', 'Role-gated deletion with audit trace', '✓ Cryptographic PII erasure & ledger proof')}
                  ${compRow6('Dedicated Cloud Instance', false, false, false, false, false, true)}
                  ${compRow6('Hardened Infrastructure Tier', false, false, false, false, false, true)}
                  ${compRow6('SLA & Support', 'Community', 'Standard email', '48h email SLA', '24h priority SLA', '99.9% uptime SLA', 'Signed BAA, DPA & custom SLA')}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- PLANS AND BILLING FAQ -->
        <section class="section-white section-padded" style="padding:70px 0;">
          <div class="site-container">
            <div class="section-header-block" style="text-align:center; margin-bottom:36px;">
              <div class="section-eyebrow">HELP &amp; POLICIES</div>
              <h2 class="section-title">Plans and billing</h2>
            </div>
            <div class="faq-grid">
              ${faqItem('What counts as a user?', 'A user is anyone you invite with login access to your workspace (administrators, operators, agents, clinical staff). Customers who visit your site, book appointments, or communicate via WhatsApp/SMS do not count toward your user limit.')}
              ${faqItem('What counts as a workspace?', 'A workspace is an isolated environment with its own database records, users, domains, and settings. On the Agency plan, you can create up to 25 separate workspaces for independent clients.')}
              ${faqItem('What happens if I exceed my limits?', 'You will receive an in-app notice when your workspace reaches 90% of contact or user limits. If you reach the limit, existing client bookings, CRM data, and workflows continue to function normally, but adding new contacts or users will prompt an upgrade. We do not charge surprise overage fees.')}
              ${faqItem('Can I cancel anytime?', 'Yes. You can cancel your subscription from your billing settings at any time. Your workspace remains fully active until the end of your prepaid billing period, and no further charges will be made.')}
              ${faqItem('Can I export my data?', 'Yes. You retain full ownership of your data. You can export contacts, deals, bookings, rules, and audit logs at any time in standard CSV and JSON formats.')}
              ${faqItem('What is your refund policy?', 'We do not offer refunds for partial subscription periods or unused time once billed. You can evaluate ZexCore on the Free plan or start on monthly billing before committing to an annual plan.')}
              ${faqItem('Are taxes included in the displayed price?', 'Displayed prices exclude local sales taxes, VAT, or GST. Where required by law, applicable VAT is calculated and displayed at checkout based on your country and tax registration.')}
              ${faqItem('What payment methods are supported?', 'For Nigerian clients (NGN), we accept Bank Transfer (via dedicated virtual accounts), USSD, and Nigerian Debit/Credit Cards (Verve, Mastercard, Visa) through Paystack. For international clients, we accept Visa, Mastercard, and American Express through Stripe. Mobile Money (M-Pesa, MTN, Airtel) is supported in Kenya, Ghana, and Côte d’Ivoire via Flutterwave.')}
              ${faqItem('How does the yearly discount work?', 'Choosing annual billing gives you 2 full months free. For example, Starter is $190/year (instead of $228), and Growth is $490/year (instead of $588).')}
              ${faqItem('What do the different audit levels include?', '<strong>7-day / 30-day activity logs:</strong> Recent user logins and record change timestamps.<br /><strong>Audit Essentials:</strong> 90-day immutable event trail for auth events, bookings, automation rule executions, and deal movements.<br /><strong>Audit Business:</strong> 3-year compliance retention with webhook streaming to SIEM tools (Splunk, Datadog).<br /><strong>Cryptographic Audit Ledger:</strong> Tamper-evident hash-chained append-only ledger with mathematical HMAC proof of non-repudiation.')}
              ${faqItem('How do data deletion tools work alongside an append-only audit log?', 'When data deletion is executed under GDPR Article 17 or NDPR, personal identifiable information (PII) in the database is cryptographically shredded or overwritten with redaction tokens (e.g. <code>[REDACTED]</code>). The append-only audit log records the <em>erasure event itself</em>—including who authorized it and a timestamp hash—without retaining any deleted personal data. This satisfies data subject erasure rights while preserving tamper-evident regulatory integrity.')}
              ${faqItem('How does upgrading work?', 'Upgrading applies new plan limits immediately to your workspace. Your existing active sessions and scheduled appointments continue without interruption.')}
            </div>
          </div>
        </section>

        <!-- ENTERPRISE & REGULATED PROCUREMENT -->
        <section class="section-tinted-red" style="padding:70px 0;">
          <div class="site-container">
            <div class="enterprise-contact-block">
              <div class="enterprise-contact-text">
                <div class="section-eyebrow">ENTERPRISE &amp; REGULATED PROCUREMENT</div>
                <h2 class="section-title" style="text-align:left; margin-bottom:12px;">Need Dedicated Enclaves or Custom Contracts?</h2>
                <p class="section-desc" style="text-align:left; max-width:560px;">For hospitals, clinical labs, and sovereign enterprises requiring single-tenant hardened infrastructure, dedicated clusters, and signed regulatory compliance agreements.</p>
                <div class="enterprise-contact-bullets">
                  <div class="enterprise-bullet">✓ Dedicated single-tenant cloud instance</div>
                  <div class="enterprise-bullet">✓ Custom 99.99% SLAs and uptime commitments</div>
                  <div class="enterprise-bullet">✓ Signed BAA, NDPR, and GDPR compliance agreements</div>
                  <div class="enterprise-bullet">✓ Hardware-isolated key destruction pipelines</div>
                  <div class="enterprise-bullet">✓ Direct Enterprise Desk: <a href="mailto:hello@zexcore.com.ng" style="color:var(--primary);font-weight:700;text-decoration:underline;">hello@zexcore.com.ng</a></div>
                </div>
              </div>
              <div class="enterprise-contact-form-card">
                <div style="font-size:0.9rem; font-weight:800; color:var(--text-main); margin-bottom:14px;">Schedule an Architecture Review</div>
                <div class="form-group">
                  <label class="form-label" for="contact-name">Full Name</label>
                  <input type="text" id="contact-name" class="input" placeholder="Dr. Bello Adebayo" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="contact-email">Work Email</label>
                  <input type="email" id="contact-email" class="input" placeholder="bello@apexclinic.ng" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="contact-company">Organization &amp; Industry</label>
                  <input type="text" id="contact-company" class="input" placeholder="Apex Specialist Hospital — Healthcare" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="contact-message">Deployment Requirements</label>
                  <textarea class="textarea" id="contact-message" placeholder="Specify tenant scale, patient data residency, or compliance requirements..." style="min-height:85px;"></textarea>
                </div>
                <button class="btn btn-primary" id="btn-pricing-contact-submit" style="width:100%; justify-content:center; padding:11px;" onclick="if(window.showToast){ window.showToast('Briefing request submitted! An infrastructure engineer will contact you.', 'success'); }">
                  Request Regulated Briefing &rarr;
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
