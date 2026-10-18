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
      <span class="pricing-feature-label" style="color: ${enabled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.4)'};">${label}</span>
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
                      <span style="font-size:0.7rem; font-weight:700; color:#64748b; background:#f1f5f9; padding:2px 8px; border-radius:12px;">Evaluation</span>
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
                    ${pricingFeature(false, 'Custom domain')}
                    ${pricingFeature(false, 'CRM contact manager')}
                    ${pricingFeature(false, 'Appointment booking')}
                    ${pricingFeature(false, 'Automation rules')}
                  </div>
                </div>
              </div>

              <!-- 2. STARTER -->
              <div class="pricing-card" style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div class="pricing-card-top">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <div class="pricing-tier-label">STARTER</div>
                      <span style="font-size:0.7rem; font-weight:700; color:#15803d; background:#dcfce7; padding:2px 8px; border-radius:12px;">Solopreneurs</span>
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
                    ${pricingFeature(false, 'Client booking & appointments')}
                    ${pricingFeature(false, 'Automation event rules')}
                    ${pricingFeature(false, 'SMS & Email fallbacks')}
                  </div>
                </div>
              </div>

              <!-- 3. GROWTH (FEATURED) -->
              <div class="pricing-card pricing-card-featured" style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div class="pricing-featured-tag">MOST POPULAR</div>
                  <div class="pricing-card-top">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <div class="pricing-tier-label" style="color:#fff; opacity:0.85;">GROWTH</div>
                      <span style="font-size:0.7rem; font-weight:800; color:#fff; background:rgba(255,255,255,0.2); padding:2px 8px; border-radius:12px;">Growing Teams</span>
                    </div>
                    <div class="pricing-price-block">
                      <span class="pricing-currency" style="color:#fff;">$</span>
                      <span class="pricing-amount" data-monthly="49" data-annual="490" style="color:#fff;">49</span>
                      <span class="pricing-period" style="color:rgba(255,255,255,0.75);">/ mo</span>
                    </div>
                    <div style="font-size:0.75rem; font-weight:700; color:#fff; margin-top:8px;">Who it’s for:</div>
                    <p class="pricing-desc" style="margin-top:2px; color:rgba(255,255,255,0.85);">A growing business expanding booking, automations, and omnichannel outreach.</p>

                    <div style="background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.22); border-radius:6px; padding:10px; margin-top:14px; font-size:0.75rem;">
                      <div style="font-weight:700; color:rgba(255,255,255,0.9); margin-bottom:4px;">Main Limits:</div>
                      <div style="color:#fff; line-height:1.4;">Everything in Starter + booking &bull; rules &bull; SMS/email &bull; 10 users &bull; 10,000 contacts &bull; Audit Essentials</div>
                    </div>

                    <button class="btn" style="width:100%; justify-content:center; margin-top:18px; background:#fff; color:var(--primary); border-color:#fff; font-weight:800;" onclick="window.startStripeCheckout('growth')">
                      Upgrade to Growth &rarr;
                    </button>
                  </div>
                  <div class="pricing-features-list">
                    <div class="pricing-feature-section-title" style="color:rgba(255,255,255,0.65);">Included Features</div>
                    ${pricingFeatureFeatured(true, 'Everything in Starter')}
                    ${pricingFeatureFeatured(true, 'Client booking & slot deposits')}
                    ${pricingFeatureFeatured(true, 'Deterministic automation rules')}
                    ${pricingFeatureFeatured(true, 'SMS and Email notifications')}
                    ${pricingFeatureFeatured(true, '10 team users')}
                    ${pricingFeatureFeatured(true, '10,000 contacts')}
                    ${pricingFeatureFeatured(true, 'Audit Essentials included')}
                    ${pricingFeatureFeatured(false, 'White-label multi-tenant branding')}
                  </div>
                </div>
              </div>

              <!-- 4. AGENCY -->
              <div class="pricing-card" style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div class="pricing-card-top">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <div class="pricing-tier-label">AGENCY</div>
                      <span style="font-size:0.7rem; font-weight:700; color:#0369a1; background:#e0f2fe; padding:2px 8px; border-radius:12px;">Agencies &amp; Studios</span>
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
                      <div style="color:var(--text-main); line-height:1.4;">Up to 25 client workspaces &bull; full white-label &bull; Audit Basic per workspace</div>
                    </div>

                    <button class="btn btn-primary" style="width:100%; justify-content:center; margin-top:18px;" onclick="window.startStripeCheckout('agency')">
                      Deploy Agency &rarr;
                    </button>
                  </div>
                  <div class="pricing-features-list">
                    <div class="pricing-feature-section-title">Included Features</div>
                    ${pricingFeature(true, 'Everything in Growth')}
                    ${pricingFeature(true, 'Up to 25 client workspaces')}
                    ${pricingFeature(true, 'Complete white-label branding')}
                    ${pricingFeature(true, 'Audit Basic per workspace')}
                    ${pricingFeature(true, 'IoT Fleet & sensor telemetry hub')}
                    ${pricingFeature(true, 'Multi-tenant client switcher')}
                    ${pricingFeature(false, 'Enterprise SSO & custom SLA')}
                    ${pricingFeature(false, 'Dedicated hardened instance')}
                  </div>
                </div>
              </div>

              <!-- 5. ENTERPRISE -->
              <div class="pricing-card" style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div class="pricing-card-top">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <div class="pricing-tier-label">ENTERPRISE</div>
                      <span style="font-size:0.7rem; font-weight:700; color:#334155; background:#f1f5f9; padding:2px 8px; border-radius:12px;">High Volume</span>
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
                    ${pricingFeature(true, 'Single Sign-On (SSO / SAML)')}
                    ${pricingFeature(true, '99.9% uptime SLA guarantee')}
                    ${pricingFeature(true, 'Priority 24/7 technical support')}
                    ${pricingFeature(true, 'Audit Business package included')}
                    ${pricingFeature(true, 'Custom rate limits & scale')}
                    ${pricingFeature(false, 'Dedicated physical HSM instance')}
                    ${pricingFeature(false, 'Custom regulatory BAA agreements')}
                  </div>
                </div>
              </div>

              <!-- 6. DEDICATED / REGULATED -->
              <div class="pricing-card" style="display:flex; flex-direction:column; justify-content:space-between; border: 2px solid #a21caf;">
                <div>
                  <div class="pricing-card-top" style="background:#fdf4ff;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <div class="pricing-tier-label" style="color:#86198f;">DEDICATED / REGULATED</div>
                      <span style="font-size:0.7rem; font-weight:800; color:#86198f; background:#fae8ff; padding:2px 8px; border-radius:12px;">Sovereign Vault</span>
                    </div>
                    <div class="pricing-price-block">
                      <span style="font-size:0.9rem; font-weight:700; color:var(--text-secondary); margin-right:4px;">From</span>
                      <span class="pricing-currency" style="color:#86198f;">$</span>
                      <span class="pricing-amount" data-monthly="1500" data-annual="15000" style="color:#86198f;">1500</span>
                      <span class="pricing-period">/ mo</span>
                    </div>
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text-main); margin-top:8px;">Who it’s for:</div>
                    <p class="pricing-desc" style="margin-top:2px;">Clinics, medical facilities, and compliance-heavy sovereign clients.</p>

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
                    ${pricingFeature(true, 'Dedicated cloud instance')}
                    ${pricingFeature(true, 'Hardened infrastructure tier')}
                    ${pricingFeature(true, 'AES-256-GCM field encryption')}
                    ${pricingFeature(true, 'HMAC blind index query engine')}
                    ${pricingFeature(true, 'GDPR Article 17 Erasure Vault')}
                    ${pricingFeature(true, 'NDPR / HIPAA compliance readiness')}
                    ${pricingFeature(true, 'Signed agreements (BAA & DPA)')}
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
              <h2 class="section-title">Compare All 6 ZexCore Tiers</h2>
              <p class="section-desc" style="max-width:680px; margin:0 auto;">Technical capabilities, capacity limits, and operational commitments side-by-side.</p>
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
                  ${compRow6('Target User', 'Trying it out', 'Small business', 'Growing business', 'Agencies & Studios', 'Large orgs', 'Clinics & regulated')}

                  ${compSection('CAPACITY & WORKSPACES')}
                  ${compRow6('Workspaces / Tenancy', '1 workspace', '1 workspace', '1 workspace', 'Up to 25 workspaces', 'Custom limits', 'Dedicated instance')}
                  ${compRow6('Team Users', '1 user', '3 users', '10 users', 'Unlimited', 'Unlimited', 'Unlimited')}
                  ${compRow6('Contact Capacity', '—', '1,000 contacts', '10,000 contacts', '25,000 contacts', 'Custom limits', 'Unlimited')}
                  ${compRow6('Custom Domains', 'ZexCore subdomain', '1 custom domain', 'Custom domain', 'White-label domains', 'Multi-domain SSO', 'Isolated VPC / Domain')}

                  ${compSection('CORE MODULES & FEATURES')}
                  ${compRow6('CMS & Site Builder', true, true, true, true, true, true)}
                  ${compRow6('Basic CRM & Deal Tracking', false, true, true, true, true, true)}
                  ${compRow6('Client Booking & Scheduling', false, false, true, true, true, true)}
                  ${compRow6('Deterministic Automation Rules', false, false, true, true, true, true)}
                  ${compRow6('Omnichannel Alerts (SMS & Email)', false, false, true, true, true, true)}
                  ${compRow6('IoT Fleet Telemetry Hub', false, false, false, true, true, true)}
                  ${compRow6('White-Label Branding', false, false, false, true, true, true)}

                  ${compSection('SECURITY, AUDIT & COMPLIANCE')}
                  ${compRow6('Audit Package Level', 'Basic logs', 'Basic audit', 'Audit Essentials', 'Audit Basic (per ws)', 'Audit Business', 'Full Cryptographic Vault')}
                  ${compRow6('Field-Level AES-256 Encryption', false, false, false, false, true, true)}
                  ${compRow6('HMAC Blind Index Queries', false, false, false, false, false, true)}
                  ${compRow6('GDPR Art. 17 Key Erasure Vault', false, false, false, false, false, true)}
                  ${compRow6('Dedicated Cloud Instance', false, false, false, false, false, true)}
                  ${compRow6('Hardened Infrastructure Tier', false, false, false, false, false, true)}
                  ${compRow6('SSO & SAML Integration', false, false, false, false, true, true)}
                  ${compRow6('SLA & Signed Agreements', 'Community', 'Standard email', '48h email SLA', '24h priority SLA', '99.9% uptime SLA', 'Signed BAA, DPA & custom SLA')}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- FAQ -->
        <section class="section-white section-padded" style="padding:70px 0;">
          <div class="site-container">
            <div class="section-header-block" style="text-align:center; margin-bottom:36px;">
              <div class="section-eyebrow">FREQUENTLY ASKED</div>
              <h2 class="section-title">Licensing Questions Answered</h2>
            </div>
            <div class="faq-grid">
              ${faqItem('Can I start on the Free plan and upgrade later?', 'Yes! You can explore ZexCore on the Free plan with 1 workspace and CMS site builder. As soon as you need custom domains, CRM contacts, or automated bookings, you can upgrade instantly with zero downtime.')}
              ${faqItem('How does the yearly discount work?', 'Choosing annual billing gives you 2 full months free. For example, Starter is $190/year (instead of $228), and Growth is $490/year (instead of $588).')}
              ${faqItem('What does Audit Essentials include on the Growth tier?', 'Audit Essentials provides immutable cryptographic audit logs for user logins, appointment bookings, rule executions, and deal stage transitions, ensuring complete accountability.')}
              ${faqItem('How does Agency multi-workspace licensing work?', 'The Agency tier permits you to host up to 25 independent client workspaces with custom domains, full white-label branding, and dedicated Audit Basic logs for each client.')}
              ${faqItem('Why choose Dedicated / Regulated for healthcare and clinics?', 'The Dedicated / Regulated tier isolates your database on a single-tenant hardened instance with field-level AES-256-GCM encryption, blind indexing, and signed compliance agreements (BAA, NDPR, GDPR Article 17 erasure).')}
              ${faqItem('Can I pay via local payment methods?', 'Yes. Our checkout supports global credit/debit cards via Stripe, as well as instant Bank Transfer, USSD, and Mobile Money via Paystack and Flutterwave.')}
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
