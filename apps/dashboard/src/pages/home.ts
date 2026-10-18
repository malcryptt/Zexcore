/**
 * ZexCore Enterprise Homepage — Huawei Flagship Style
 * Features:
 * - Dynamic Industrial Chevron Hero Showcase with interactive slider indicators
 * - 4 Enterprise Metric Invariants (100% RLS, < 1ms, AES-256-GCM, 5 Modules)
 * - "What's New" section with red accent bar and 4 domain showcase cards
 * - 3-tier sovereign isometric stack architecture diagram
 * - Industrial plant vertical SaaS showcase and trust badges
 * - Strict Red & White enterprise design system
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export interface HeroSlide {
  badge: string;
  titleHtml: string;
  subtext: string;
  image: string;
  alt: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
}

export const heroSlides: HeroSlide[] = [
  {
    badge: 'MISSION-CRITICAL VERTICAL SAAS',
    titleHtml: 'Accelerate<br />Vertical SaaS.<br /><span class="hz-hero-red">Live in 10 Minutes.</span>',
    subtext: 'The sovereign multi-tenant platform for vertical SaaS. Turnkey industry packs, automated WhatsApp customer workflows, and PostgreSQL 17 isolation out of the box.',
    image: '/heroes/hero-arrow-real.jpg',
    alt: 'Industrial chevron composite: smart city, power grid, welding, port logistics, high-speed rail',
    primaryCtaText: 'Launch Console Free →',
    primaryCtaHref: '#/console',
    secondaryCtaText: 'Explore Modules',
    secondaryCtaHref: '#/modules',
  },
  {
    badge: 'POSTGRESQL 17 ROW-LEVEL SECURITY',
    titleHtml: '<span class="hz-hero-red">Sovereign<br />Multi-Tenancy.<br />Zero Data Leaks.</span>',
    subtext: 'Enforced mathematically at the PostgreSQL session level using Row-Level Security, composite primary keys, and transaction-isolated database connections. Never rely on manual code discipline.',
    image: '/refinery.jpg',
    alt: 'Industrial plant and refinery operations powered by sovereign multi-tenancy',
    primaryCtaText: 'Security Architecture →',
    primaryCtaHref: '#/security',
    secondaryCtaText: 'Technical Whitepaper',
    secondaryCtaHref: '#/architecture',
  },
  {
    badge: 'AST ENGINE • ZERO JAVASCRIPT EVAL',
    titleHtml: 'Deterministic<br />Rules &amp; Automation.<br /><span class="hz-hero-red">&lt; 1ms Latency.</span>',
    subtext: 'Compile business logic and alert pipelines into secure Abstract Syntax Tree graphs with zero eval vulnerability. Lightning-fast edge triggers and omnichannel customer dispatch.',
    image: '/solutions/automation.jpg',
    alt: 'Industrial robotic manufacturing automation with deterministic execution',
    primaryCtaText: 'Open Rules Studio →',
    primaryCtaHref: '#/console/rules',
    secondaryCtaText: 'Developer Documentation',
    secondaryCtaHref: '#/docs',
  },
];

export function renderHomePage(): string {
  const defaultSlide = heroSlides[0];

  return `
    <div class="page-wrapper">
      ${renderNavbar('home')}

      <main>
        <!-- ═══════════════════════════════════════════════════════════════
             FLAGSHIP HERO BANNER (CLEAN & HIGH CONTRAST)
             ═══════════════════════════════════════════════════════════════ -->
        <section class="hz-hero" id="home-flagship-hero">

          <!-- Left-Half Blended Backdrop Image with Soft Gradient Mask -->
          <div class="hz-hero-backdrop" id="hero-backdrop-wrap">
            <img
              id="hero-slide-img"
              src="${defaultSlide.image}"
              alt="${defaultSlide.alt}"
              class="hz-hero-arrow-img"
              loading="eager"
            />
          </div>

          <!-- Content Column: sits over the right half on continuous background -->
          <div class="site-container hz-hero-site-container">
            <div class="hz-hero-copy">
              <!-- Geometric play-arrow brand mark -->
              <div class="hz-brand-mark hz-anim-fade-up" style="animation-delay: 0.05s">
                <svg width="42" height="36" viewBox="0 0 42 36" fill="none">
                  <polygon points="0,0 18,18 0,36" fill="#E50920"/>
                  <polygon points="16,0 34,18 16,36" fill="#0f172a" opacity="0.75"/>
                </svg>
              </div>

              <h1 class="hz-hero-title hz-anim-fade-up" style="animation-delay: 0.15s" id="hero-slide-title">${defaultSlide.titleHtml}</h1>

              <p class="hz-hero-desc hz-anim-fade-up" style="animation-delay: 0.28s; font-size: 1.12rem; line-height: 1.65; color: #334155;" id="hero-slide-desc">${defaultSlide.subtext}</p>

              <div class="hz-hero-actions hz-anim-fade-up" style="animation-delay: 0.4s" id="hero-slide-actions">
                <a href="${defaultSlide.primaryCtaHref}" class="hz-btn-primary" id="btn-hero-primary" style="font-weight: 800; box-shadow: 0 4px 16px rgba(229, 9, 32, 0.35);">${defaultSlide.primaryCtaText}</a>
                <a href="${defaultSlide.secondaryCtaHref}" class="hz-btn-outline" id="btn-hero-secondary" style="font-weight: 700;">${defaultSlide.secondaryCtaText}</a>
                <a href="#onboarding-walkthrough" class="hz-btn-ghost" id="btn-hero-what-is-zexcore">10-Minute Walkthrough &darr;</a>
              </div>
            </div>
          </div>

        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             4 METRIC CARDS ROW UNDER HERO (HIGH CONTRAST & ACCESSIBLE)
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-white" style="padding: 36px 0 48px 0; border-bottom: 1px solid var(--border-subtle);">
          <div class="site-container">
            <div class="hero-metrics-4col">
              <div class="hero-metric-card">
                <div class="metric-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <div class="metric-big-val">100% RLS</div>
                  <div class="metric-sub-lbl" style="font-weight: 600; color: #334155;">Zero Data Leakage</div>
                </div>
              </div>

              <div class="hero-metric-card">
                <div class="metric-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div>
                  <div class="metric-big-val">&lt; 1ms</div>
                  <div class="metric-sub-lbl" style="font-weight: 600; color: #334155;">Real-Time AST Latency</div>
                </div>
              </div>

              <div class="hero-metric-card">
                <div class="metric-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <div class="metric-big-val">10 Minutes</div>
                  <div class="metric-sub-lbl" style="font-weight: 600; color: #334155;">Instant Setup to Live</div>
                </div>
              </div>

              <div class="hero-metric-card">
                <div class="metric-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                </div>
                <div>
                  <div class="metric-big-val">WhatsApp</div>
                  <div class="metric-sub-lbl" style="font-weight: 600; color: #334155;">Leads &amp; MoMo Built-in</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             UP IN 10 MINUTES — ENHANCED VISUAL ONBOARDING WALKTHROUGH
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-tinted-red section-padded" id="onboarding-walkthrough" style="padding: 84px 0 96px;">
          <div class="site-container">

            <div style="text-align:center; max-width: 720px; margin: 0 auto 52px auto;">
              <h2 class="section-title" style="margin-bottom: 14px; font-size: 2.3rem;">
                Up and running in <span class="text-brand">ten minutes.</span>
              </h2>
              <p class="section-desc" style="font-size: 1.05rem; color: #334155; margin: 0; line-height: 1.65;">
                No empty screens. No month-long implementation hurdles. Answer one question to spin up a fully functioning vertical SaaS instance with realistic catalog data and automated WhatsApp lead capture.
              </p>
            </div>

            <!-- 3-Step Visual Cards Grid -->
            <div class="onboard-v2-grid">

              <!-- Step 1: Industry Blueprint -->
              <div class="onboard-v2-card">
                <div class="onboard-step-label">STEP 01</div>
                <h3 class="onboard-v2-title">Select Your Industry Blueprint</h3>
                <p class="onboard-v2-desc">
                  Choose your vertical — clinic, logistics, property, or field services. ZexCore deploys pre-configured PostgreSQL schemas, state machines, and RLS policies tailored to your domain.
                </p>
                <div class="onboard-v2-mockup">
                  <div class="onboard-v2-mockup-header">
                    <span>Industry Blueprint Preset</span>
                    <div class="onboard-v2-dots"><span></span><span></span><span></span></div>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 6px; font-size: 0.8rem; font-weight: 700; color: #991b1b;">
                      <span>Healthcare Clinic &amp; Diagnostics</span>
                      <span style="font-size: 0.7rem; background: #e50920; color: #fff; padding: 2px 6px; border-radius: 4px;">ACTIVE</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8rem; color: #475569;">
                      <span>Logistics Fleet &amp; Telemetry</span>
                      <span style="font-size: 0.7rem; color: #94a3b8;">Preset</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8rem; color: #475569;">
                      <span>Real Estate &amp; Property CRM</span>
                      <span style="font-size: 0.7rem; color: #94a3b8;">Preset</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 2: Instant Working Showcase -->
              <div class="onboard-v2-card">
                <div class="onboard-step-label">STEP 02</div>
                <h3 class="onboard-v2-title">Instant Live Customer Portal</h3>
                <p class="onboard-v2-desc">
                  Immediately receive a live customer-facing portal loaded with realistic sample listings, booking calendars, and service fees. Fully editable and branded to your business.
                </p>
                <div class="onboard-v2-mockup">
                  <div class="onboard-v2-mockup-header">
                    <span>https://clinic.zexcore.app</span>
                    <div class="onboard-v2-dots"><span></span><span></span><span></span></div>
                  </div>
                  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                      <div style="font-size: 0.82rem; font-weight: 800; color: #0f172a;">Metropolitan Medical Center</div>
                      <span style="font-size: 0.68rem; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">LIVE</span>
                    </div>
                    <div style="font-size: 0.76rem; color: #64748b; margin-bottom: 8px;">Cardiology Consultation &bull; Dr. Mensah</div>
                    <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 6px; border-top: 1px dashed #e2e8f0;">
                      <span style="font-size: 0.78rem; font-weight: 750; color: #0f172a;">$120.00 deposit</span>
                      <span style="font-size: 0.72rem; font-weight: 700; color: #e50920;">Book Online &rarr;</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 3: Direct WhatsApp Leads -->
              <div class="onboard-v2-card">
                <div class="onboard-step-label">STEP 03</div>
                <h3 class="onboard-v2-title">WhatsApp Leads &amp; Instant Deposits</h3>
                <p class="onboard-v2-desc">
                  Customer bookings dispatch automated notifications directly to your WhatsApp. Accept deposits via Mobile Money or Stripe without customer friction.
                </p>
                <div class="onboard-v2-mockup">
                  <div class="onboard-v2-mockup-header">
                    <span style="color: #15803d; font-weight: 700;">WhatsApp Business Webhook</span>
                  </div>
                  <div style="background: #dcf8c6; border: 1px solid #bbf7d0; border-radius: 8px 8px 0 8px; padding: 10px; margin-left: 12px;">
                    <div style="font-size: 0.78rem; font-weight: 700; color: #14532d; margin-bottom: 4px;">New Patient Appointment #482</div>
                    <div style="font-size: 0.74rem; color: #166534; line-height: 1.4;">
                      Dr. Mensah &bull; Today, 14:30<br/>
                      Deposit paid via MoMo: <strong>$50.00</strong>
                    </div>
                    <div style="font-size: 0.65rem; color: #15803d; text-align: right; margin-top: 4px;">Delivered &bull; Just now</div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Standout Call-to-Action Bar -->
            <div class="onboard-v2-cta-bar">
              <div class="onboard-v2-cta-copy">
                <h3>Experience the 10-minute setup firsthand</h3>
                <p>Launch your isolated tenant environment with sample catalog data in less time than making coffee.</p>
              </div>
              <div class="onboard-v2-cta-actions">
                <a href="#/console" class="btn btn-primary btn-lg" style="box-shadow: 0 4px 16px rgba(229, 9, 32, 0.35); font-weight: 800;">
                  Launch Console Free &rarr;
                </a>
                <a href="#/docs#quickstart" class="btn btn-secondary btn-lg" style="font-weight: 600;">
                  View Quickstart Guide
                </a>
              </div>
            </div>

          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             "WHAT'S NEW" / MODULES SECTION WITH STANDOUT ACTION BUTTONS
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-white section-padded whats-new-section" style="padding: 76px 0 88px 0; border-bottom: 1px solid #f3e5e8;">
          <div class="site-container">
            <!-- Header with Red Underline Accent Bar -->
            <div class="whats-new-header text-center">
              <h2 class="whats-new-title" style="font-size: 2.25rem;">Explore Platform Modules</h2>
              <div class="whats-new-red-bar"></div>
              <p class="whats-new-subtitle" style="font-size: 1.05rem; color: #334155; max-width: 680px; margin: 0 auto 48px auto;">
                Engineered for scale, security, and velocity. Click any module below to open its dedicated interactive console workspace.
              </p>
            </div>

            <!-- 4-Card Enterprise Showcase Grid -->
            <div class="whats-new-cards-grid">
              
              <!-- 1. Industrial IoT -->
              <div class="whats-new-card">
                <div class="whats-new-img-wrap">
                  <img src="/solutions/iot.jpg" alt="Industrial IoT device telemetry" class="whats-new-img" loading="lazy" />
                  <span class="whats-new-category">IOT FLEET</span>
                </div>
                <div class="whats-new-content">
                  <h3 class="whats-new-card-title">Edge Device Fleet &amp; Telemetry Stream</h3>
                  <p class="whats-new-card-desc" style="color: #475569;">
                    Hardware-isolated single-use token rotation, high-frequency time-series telemetry ingestion, and sub-millisecond anomaly thresholds.
                  </p>
                  <a href="#/console/iot" class="btn btn-primary btn-sm" style="margin-top: auto; justify-content: center; font-weight: 750; box-shadow: 0 4px 12px rgba(229, 9, 32, 0.25);">
                    Open IoT Console &rarr;
                  </a>
                </div>
              </div>

              <!-- 2. Deterministic Rules -->
              <div class="whats-new-card">
                <div class="whats-new-img-wrap">
                  <img src="/solutions/automation.jpg" alt="Automated robotic manufacturing" class="whats-new-img" loading="lazy" />
                  <span class="whats-new-category">AUTOMATION</span>
                </div>
                <div class="whats-new-content">
                  <h3 class="whats-new-card-title">Zero-Eval AST Workflow Engine</h3>
                  <p class="whats-new-card-desc" style="color: #475569;">
                    Deterministic condition graphs and action dispatchers with zero JavaScript eval risk. Evaluates state machines and triggers in microseconds.
                  </p>
                  <a href="#/console/rules" class="btn btn-primary btn-sm" style="margin-top: auto; justify-content: center; font-weight: 750; box-shadow: 0 4px 12px rgba(229, 9, 32, 0.25);">
                    Open Rules Studio &rarr;
                  </a>
                </div>
              </div>

              <!-- 3. Sovereign CRM -->
              <div class="whats-new-card">
                <div class="whats-new-img-wrap">
                  <img src="/solutions/sales.jpg" alt="Enterprise CRM and sales pipeline" class="whats-new-img" loading="lazy" />
                  <span class="whats-new-category">CRM &amp; WHATSAPP</span>
                </div>
                <div class="whats-new-content">
                  <h3 class="whats-new-card-title">WhatsApp CRM &amp; Deal Flow</h3>
                  <p class="whats-new-card-desc" style="color: #475569;">
                    Live customer conversations, Paystack/MoMo deposit collections, and composite-key tenant data isolation preventing cross-tenant leakage.
                  </p>
                  <a href="#/console/crm" class="btn btn-primary btn-sm" style="margin-top: auto; justify-content: center; font-weight: 750; box-shadow: 0 4px 12px rgba(229, 9, 32, 0.25);">
                    Open WhatsApp CRM &rarr;
                  </a>
                </div>
              </div>

              <!-- 4. Cryptographic Compliance -->
              <div class="whats-new-card">
                <div class="whats-new-img-wrap">
                  <img src="/solutions/compliance.jpg" alt="Cryptographic data vault and compliance" class="whats-new-img" loading="lazy" />
                  <span class="whats-new-category">COMPLIANCE VAULT</span>
                </div>
                <div class="whats-new-content">
                  <h3 class="whats-new-card-title">GDPR Cryptographic Vault</h3>
                  <p class="whats-new-card-desc" style="color: #475569;">
                    Right-to-be-Forgotten pipeline with key destruction, HMAC blind indexing for searchable encrypted PII, and immutable append-only audit trails.
                  </p>
                  <a href="#/console/compliance" class="btn btn-primary btn-sm" style="margin-top: auto; justify-content: center; font-weight: 750; box-shadow: 0 4px 12px rgba(229, 9, 32, 0.25);">
                    Open Compliance Vault &rarr;
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             SECTION 3: ENGINEERED FOR STRICT SOVEREIGN MULTI-TENANCY
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-tinted-red section-padded" style="padding: 80px 0;">
          <div class="site-container">
            <div class="multi-tenant-split-grid">
              <!-- Left Column: Copy & Button -->
              <div class="multi-tenant-copy">
                <h2 class="section-title" style="text-align: left; font-size: 2.35rem; font-weight: 850; letter-spacing: -0.04em; margin-bottom: 18px; line-height: 1.15;">
                  Engineered for Strict Sovereign Multi-Tenancy
                </h2>
                <p style="font-size: 1.05rem; color: #334155; line-height: 1.7; margin-bottom: 34px; max-width: 490px;">
                  Build for scale, definition, and workflow execution &mdash; ZexCore delivers the enterprise foundation your vertical SaaS needs to operate securely without architectural compromises.
                </p>
                <a href="#/architecture" class="btn btn-primary btn-lg" style="box-shadow: 0 4px 16px rgba(229, 9, 32, 0.32); font-weight: 800;">
                  Explore Sovereign Architecture &rarr;
                </a>
              </div>

              <!-- Right Column: Unified 3D Isometric Stack Diagram matching Reference Design -->
              <div class="stack-illustration-col">
                <div class="platform-stack-diagram-card">
                  <svg viewBox="0 0 660 410" class="platform-stack-svg-unified" aria-label="ZexCore 3-tier sovereign platform architecture stack">
                    <defs>
                      <linearGradient id="slabFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="100%" stop-color="#fff8f9"/>
                      </linearGradient>
                      <linearGradient id="facetLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#fddce0"/>
                        <stop offset="100%" stop-color="#f8bec6"/>
                      </linearGradient>
                      <linearGradient id="facetRight" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#fce8eb"/>
                        <stop offset="100%" stop-color="#f9cbd1"/>
                      </linearGradient>
                      <filter id="stack3DShadow" x="-20%" y="-20%" width="150%" height="160%">
                        <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#a60c1c" flood-opacity="0.14"/>
                      </filter>
                      <filter id="glowNode" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#e50920" flood-opacity="0.55"/>
                      </filter>
                    </defs>

                    <!-- ── LAYER 3 (BASE): ZexCore Core ── -->
                    <g filter="url(#stack3DShadow)">
                      <polygon points="50,230 200,282 200,300 50,248" fill="url(#facetLeft)" stroke="#E50920" stroke-width="1.2"/>
                      <polygon points="200,282 350,230 350,248 200,300" fill="url(#facetRight)" stroke="#E50920" stroke-width="1.2"/>
                      <polygon points="200,178 350,230 200,282 50,230" fill="url(#slabFaceGrad)" stroke="#E50920" stroke-width="2.2"/>
                    </g>
                    <line x1="350" y1="230" x2="420" y2="230" stroke="#E50920" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="420" cy="230" r="4.5" fill="#E50920" filter="url(#glowNode)"/>
                    <text x="438" y="226" font-family="Inter, -apple-system, sans-serif" font-weight="750" font-size="15" fill="#17191D">ZexCore Core</text>
                    <text x="438" y="246" font-family="Inter, -apple-system, sans-serif" font-weight="500" font-size="12.5" fill="#626D7E">Multi-tenant infrastructure</text>

                    <!-- ── LAYER 2 (MIDDLE): Reusable Modules ── -->
                    <g filter="url(#stack3DShadow)">
                      <polygon points="75,175 200,219 200,235 75,191" fill="url(#facetLeft)" stroke="#E50920" stroke-width="1.2"/>
                      <polygon points="200,219 325,175 325,191 200,235" fill="url(#facetRight)" stroke="#E50920" stroke-width="1.2"/>
                      <polygon points="200,131 325,175 200,219 75,175" fill="url(#slabFaceGrad)" stroke="#E50920" stroke-width="2"/>
                    </g>
                    <line x1="325" y1="175" x2="420" y2="175" stroke="#E50920" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="420" cy="175" r="4.5" fill="#E50920" filter="url(#glowNode)"/>
                    <text x="438" y="171" font-family="Inter, -apple-system, sans-serif" font-weight="750" font-size="15" fill="#17191D">Reusable Modules</text>
                    <text x="438" y="191" font-family="Inter, -apple-system, sans-serif" font-weight="500" font-size="12.5" fill="#626D7E">Core platform capabilities</text>

                    <!-- ── LAYER 1 (TOP): Industry Packs ── -->
                    <g filter="url(#stack3DShadow)">
                      <polygon points="100,120 200,158 200,173 100,135" fill="url(#facetLeft)" stroke="#E50920" stroke-width="1.2"/>
                      <polygon points="200,158 300,120 300,135 200,173" fill="url(#facetRight)" stroke="#E50920" stroke-width="1.2"/>
                      <polygon points="200,82 300,120 200,158 100,120" fill="url(#slabFaceGrad)" stroke="#E50920" stroke-width="2"/>
                      <image href="/zexcore-logo-icon.png" x="178" y="98" width="44" height="44" preserveAspectRatio="xMidYMid meet"/>
                    </g>
                    <line x1="300" y1="120" x2="420" y2="120" stroke="#E50920" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="420" cy="120" r="4.5" fill="#E50920" filter="url(#glowNode)"/>
                    <text x="438" y="116" font-family="Inter, -apple-system, sans-serif" font-weight="750" font-size="15" fill="#17191D">Industry Packs</text>
                    <text x="438" y="136" font-family="Inter, -apple-system, sans-serif" font-weight="500" font-size="12.5" fill="#626D7E">Vertical configurations</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             SECTION 4: POWERING THE NEXT GENERATION OF VERTICAL SAAS
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-white section-padded" style="padding: 80px 0; border-bottom: 1px solid #f3e5e8;">
          <div class="site-container">
            <div class="powering-saas-grid">
              <!-- Left Column: Industrial Plant Photo -->
              <div class="powering-photo-col">
                <div class="powering-photo-frame">
                  <img
                    src="/refinery.jpg"
                    alt="Engineer in hardhat working on vertical SaaS automation in an industrial plant"
                    class="powering-photo-img"
                    loading="lazy"
                  />
                </div>
              </div>

              <!-- Right Column: Copy & Explore Button -->
              <div class="powering-copy-col">
                <h2 class="section-title" style="text-align: left; font-size: 2.2rem; font-weight: 850; letter-spacing: -0.04em; margin-bottom: 20px;">
                  Powering the next generation of vertical SaaS
                </h2>
                <p style="font-size: 1.05rem; color: #334155; line-height: 1.7; margin-bottom: 32px; max-width: 500px;">
                  From industrial IoT to healthcare and financial operations, ZexCore gives you the foundation to build, scale, and operate industry-specific applications with confidence.
                </p>
                <div style="display: flex; gap: 14px; flex-wrap: wrap;">
                  <a href="#/solutions" class="btn btn-primary btn-lg" style="box-shadow: 0 4px 16px rgba(229, 9, 32, 0.32); font-weight: 800;">
                    Explore Solutions &rarr;
                  </a>
                  <a href="#/console" class="btn btn-secondary btn-lg" style="font-weight: 600;">
                    Launch Console &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             SECTION 5: TRUSTED BY FORWARD-THINKING TEAMS
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-ambient-red section-padded" style="padding: 56px 0 68px 0;">
          <div class="site-container">
            <div class="trust-bar-header" style="text-align: center; margin-bottom: 32px;">
              <span class="trust-bar-title" style="font-size: 0.98rem; font-weight: 750; color: var(--text-main); letter-spacing: 0.02em;">
                Trusted by forward-thinking engineering teams
              </span>
            </div>

            <div class="trust-badges-row">
              <div class="trust-badge-card">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <span>Build Faster</span>
              </div>

              <div class="trust-badge-card">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Scale Securely</span>
              </div>

              <div class="trust-badge-card">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>Stay Compliant</span>
              </div>

              <div class="trust-badge-card">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span>Unlock Possibilities</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             SECTION 6: HIGH-IMPACT FINAL CONVERSION BANNER
             ═══════════════════════════════════════════════════════════════ -->
        <section class="home-final-cta-section">
          <div class="site-container">
            <div class="home-final-cta-inner">
              <h2 class="home-final-cta-title">Build Your Sovereign Vertical SaaS on ZexCore</h2>
              <p class="home-final-cta-desc">
                Deploy mathematically isolated multi-tenancy, real-time IoT telemetry, and direct WhatsApp customer pipelines today. Zero vendor lock-in. Full PostgreSQL data sovereignty.
              </p>
              <div class="home-final-cta-actions">
                <a href="#/console" class="btn btn-primary btn-lg" style="padding: 14px 32px; font-size: 1.05rem; font-weight: 800; box-shadow: 0 4px 18px rgba(229, 9, 32, 0.32);">
                  Launch Console Free &rarr;
                </a>
                <a href="#/pricing" class="btn btn-secondary btn-lg" style="padding: 14px 28px; font-size: 1.05rem; background: #ffffff; color: #17191d; border: 1.5px solid #d0d6de; font-weight: 700;">
                  View Sovereign Tiers
                </a>
              </div>
              <div class="home-final-cta-guarantees">
                <span class="home-final-guarantee-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e50920" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  PostgreSQL 17 Row-Level Security
                </span>
                <span class="home-final-guarantee-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e50920" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  AES-256-GCM Data Vault
                </span>
                <span class="home-final-guarantee-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e50920" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  No Credit Card Required
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}

/**
 * Attaches interactive carousel handlers for the flagship hero slider
 */
export function setupHomePageEvents(): void {
  const heroEl = document.getElementById('home-flagship-hero');
  if (!heroEl) return;

  let currentSlide = 0;

  // Clear any existing timer to avoid multiple stacked timers across views
  if ((window as any).__zexcore_hero_timer) {
    clearInterval((window as any).__zexcore_hero_timer);
    (window as any).__zexcore_hero_timer = null;
  }

  function setSlide(index: number) {
    if (index < 0 || index >= heroSlides.length) return;
    currentSlide = index;
    const slide = heroSlides[index];

    const img = document.getElementById('hero-slide-img') as HTMLImageElement | null;
    const copy = document.querySelector('.hz-hero-copy') as HTMLElement | null;
    const title = document.getElementById('hero-slide-title');
    const desc = document.getElementById('hero-slide-desc');
    const btnPrimary = document.getElementById('btn-hero-primary') as HTMLAnchorElement | null;
    const btnSecondary = document.getElementById('btn-hero-secondary') as HTMLAnchorElement | null;

    // Crossfade: start fade out
    if (img) {
      img.style.opacity = '0';
      img.style.transform = 'scale(1.03)';
    }
    if (copy) {
      copy.style.opacity = '0';
      copy.style.transform = 'translateY(6px)';
    }

    setTimeout(() => {
      if (img) {
        img.src = slide.image;
        img.alt = slide.alt;
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
      }

      if (title) title.innerHTML = slide.titleHtml;
      if (desc) desc.textContent = slide.subtext;

      if (btnPrimary) {
        btnPrimary.textContent = slide.primaryCtaText;
        btnPrimary.href = slide.primaryCtaHref;
      }
      if (btnSecondary) {
        btnSecondary.textContent = slide.secondaryCtaText;
        btnSecondary.href = slide.secondaryCtaHref;
      }

      if (copy) {
        copy.style.opacity = '1';
        copy.style.transform = 'translateY(0)';
      }
    }, 220);
  }

  // Continuous 6-second autoscroll interval, irrespective of touch or clicks
  (window as any).__zexcore_hero_timer = setInterval(() => {
    const next = (currentSlide + 1) % heroSlides.length;
    setSlide(next);
  }, 6000);
}

