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
    titleHtml: 'Accelerate<br />Industrial<br /><span class="hz-hero-red">Intelligence.</span>',
    subtext: 'The sovereign multi-tenant operating system for vertical SaaS — power grids, industrial IoT telemetry, deterministic rules automation, and cryptographic compliance vaults.',
    image: '/heroes/hero-arrow-real.jpg',
    alt: 'Industrial chevron composite: smart city, power grid, welding, port logistics, high-speed rail',
    primaryCtaText: 'Launch Console →',
    primaryCtaHref: '#/console',
    secondaryCtaText: 'Explore Solutions',
    secondaryCtaHref: '#/solutions',
  },
  {
    badge: 'POSTGRESQL 17 ROW-LEVEL SECURITY',
    titleHtml: '<span class="hz-hero-red">Sovereign<br />Multi-Tenancy.<br />Zero Leakage.</span>',
    subtext: 'Enforced mathematically at the PostgreSQL session level using Row-Level Security, composite primary keys, and transaction-isolated database connections. No reliance on software developer discipline.',
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
    subtext: 'Compile conditional business logic into secure Abstract Syntax Tree graphs. Trigger real-time alert pipelines and dispatch state machines across the EventBus mesh with predictable microsecond execution.',
    image: '/solutions/automation.jpg',
    alt: 'Industrial robotic manufacturing automation with deterministic execution',
    primaryCtaText: 'Test Rules Engine →',
    primaryCtaHref: '#/console',
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
             FLAGSHIP HUAWEI-STYLE HERO BANNER
             ═══════════════════════════════════════════════════════════════ -->
        <!-- ═══ FULL-WIDTH HUAWEI-STYLE HERO: SEAMLESS FADED BACKDROP + RIGHT COPY ═══ -->
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

              <p class="hz-hero-desc hz-anim-fade-up" style="animation-delay: 0.28s" id="hero-slide-desc">${defaultSlide.subtext}</p>

              <div class="hz-hero-actions hz-anim-fade-up" style="animation-delay: 0.4s" id="hero-slide-actions">
                <a href="${defaultSlide.primaryCtaHref}" class="hz-btn-primary" id="btn-hero-primary">${defaultSlide.primaryCtaText}</a>
                <a href="${defaultSlide.secondaryCtaHref}" class="hz-btn-outline" id="btn-hero-secondary">${defaultSlide.secondaryCtaText}</a>
                <a href="#/docs#what-is-zexcore" class="hz-btn-ghost" id="btn-hero-what-is-zexcore">What ZexCore is All About &rarr;</a>
              </div>
            </div>
          </div>

        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             4 METRIC CARDS ROW UNDER HERO
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-white" style="padding: 32px 0 48px 0; border-bottom: 1px solid var(--border-subtle);">
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
                  <div class="metric-sub-lbl">Row-Level Security</div>
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
                  <div class="metric-sub-lbl">Rules Engine</div>
                </div>
              </div>

              <div class="hero-metric-card">
                <div class="metric-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <div class="metric-big-val">AES-256-GCM</div>
                  <div class="metric-sub-lbl">Encryption</div>
                </div>
              </div>

              <div class="hero-metric-card">
                <div class="metric-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                    <polyline points="2 17 12 22 22 17"/>
                    <polyline points="2 12 12 17 22 12"/>
                  </svg>
                </div>
                <div>
                  <div class="metric-big-val">5 Modules</div>
                  <div class="metric-sub-lbl">EventBus Mesh</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             UP IN 10 MINUTES — FIRST-RUN ONBOARDING SHOWCASE
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-tinted-red section-padded" style="padding: 88px 0 96px;">
          <div class="site-container">

            <div style="text-align:center;">
              <div class="section-eyebrow">FIRST-RUN EXPERIENCE</div>
              <h2 class="section-title" style="max-width:640px; margin:0 auto 16px;">
                A great first <span class="text-brand">ten minutes.</span>
              </h2>
              <p class="section-desc" style="max-width:560px; margin:0 auto 60px;">
                A business signs up, answers one question, and sees a working site already set up for their field — sample listing, enquiry form, and a follow-up ready to go. No blank screens. No manual.
              </p>
            </div>

            <!-- 4-Step Flow -->
            <div class="onboard-steps-row">

              <div class="onboard-step">
                <div class="onboard-step-num">01</div>
                <div class="onboard-step-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
                <h3 class="onboard-step-title">One question</h3>
                <p class="onboard-step-desc">Answer "what do you do?" — clinic, property, salon, logistics. ZexCore picks the right starter setup for your industry automatically.</p>
              </div>

              <div class="onboard-step-connector"></div>

              <div class="onboard-step">
                <div class="onboard-step-num">02</div>
                <div class="onboard-step-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                </div>
                <h3 class="onboard-step-title">Working site, instantly</h3>
                <p class="onboard-step-desc">A finished sample site with realistic example content — listings, services, prices — that looks like their business. Edit it. It feels made for them.</p>
              </div>

              <div class="onboard-step-connector"></div>

              <div class="onboard-step">
                <div class="onboard-step-num">03</div>
                <div class="onboard-step-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11 16.8a19.5 19.5 0 0 1-5-5 19.79 19.79 0 0 1-4.12-8.78A2 2 0 0 1 3.88 1H7a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91A16 16 0 0 0 14 14.91l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <h3 class="onboard-step-title">Enquiries flow in</h3>
                <p class="onboard-step-desc">Enquiry form and WhatsApp follow-up pre-configured. A lead on WhatsApp with a quick reply is worth far more than one sitting in an email inbox.</p>
              </div>

              <div class="onboard-step-connector"></div>

              <div class="onboard-step">
                <div class="onboard-step-num">04</div>
                <div class="onboard-step-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </div>
                <h3 class="onboard-step-title">See what's working</h3>
                <p class="onboard-step-desc">A simple dashboard: enquiries in, which became customers. That justifies paying monthly — and earns loyalty better than any feature list.</p>
              </div>

            </div>

            <!-- Checklist strip -->
            <div class="onboard-checklist-strip">
              <div class="onboard-checklist-label">Short guided checklist on first login:</div>
              <div class="onboard-checklist-items">
                <div class="onboard-check-item"><span class="onboard-check-icon">✓</span> Add your logo</div>
                <div class="onboard-check-item"><span class="onboard-check-icon">✓</span> Add your first listing or service</div>
                <div class="onboard-check-item"><span class="onboard-check-icon">✓</span> Share the link</div>
                <div class="onboard-check-item onboard-check-item--undo"><span class="onboard-check-icon onboard-check-icon--soft">↺</span> Undo everything &amp; start over — always safe to experiment</div>
              </div>
            </div>

            <!-- 3 value-prop runner-up strips -->
            <div class="onboard-value-strips">

              <div class="onboard-value-card">
                <div class="onboard-value-icon" style="background:#25D366;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.997 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.878-1.42A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.52 2 11.997 2z"/></svg>
                </div>
                <div class="onboard-value-body">
                  <h4 class="onboard-value-title">WhatsApp for enquiries &amp; follow-ups</h4>
                  <p class="onboard-value-desc">Your market lives on WhatsApp. Leads arrive there, get a quick automated reply, and a personal follow-up — all without leaving the app they're already on.</p>
                </div>
              </div>

              <div class="onboard-value-card">
                <div class="onboard-value-icon" style="background:var(--primary);">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><polyline points="7 10 10 7 13 10 17 6"/></svg>
                </div>
                <div class="onboard-value-body">
                  <h4 class="onboard-value-title">A simple "what's working" dashboard</h4>
                  <p class="onboard-value-desc">Enquiries received, which became customers, response time. Seeing the numbers turns a business owner into a loyal subscriber — not features.</p>
                </div>
              </div>

              <div class="onboard-value-card">
                <div class="onboard-value-icon" style="background:#2563EB;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </div>
                <div class="onboard-value-body">
                  <h4 class="onboard-value-title">Easy backup &amp; "download all my data"</h4>
                  <p class="onboard-value-desc">One-click export of everything. Builds trust with clinics and businesses abroad who worry about data ownership — and makes leaving feel safe enough they never do.</p>
                </div>
              </div>

            </div>

          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════
             "WHAT'S NEW" SECTION (MATCHING HUAWEI REFERENCE DESIGN)
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-white section-padded whats-new-section" style="padding: 72px 0 84px 0; border-bottom: 1px solid #f3e5e8;">
          <div class="site-container">
            <!-- Header with Red Underline Accent Bar -->
            <div class="whats-new-header text-center">
              <h2 class="whats-new-title">What's New</h2>
              <div class="whats-new-red-bar"></div>
              <p class="whats-new-subtitle">
                Explore recently certified enterprise capabilities, sovereign runtime modules, and vertical industry packs.
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
                  <p class="whats-new-card-desc">
                    Hardware-isolated single-use token rotation, high-frequency time-series telemetry ingestion, and sub-millisecond metric anomaly thresholds.
                  </p>
                  <a href="#/modules" class="whats-new-card-link">Learn More &rarr;</a>
                </div>
              </div>

              <!-- 2. Deterministic Rules -->
              <div class="whats-new-card">
                <div class="whats-new-img-wrap">
                  <img src="/solutions/automation.jpg" alt="Automated robotic manufacturing" class="whats-new-img" loading="lazy" />
                  <span class="whats-new-category">AUTOMATION</span>
                </div>
                <div class="whats-new-content">
                  <h3 class="whats-new-card-title">Zero-Eval AST Workflow Evaluation</h3>
                  <p class="whats-new-card-desc">
                    Deterministic condition graphs and action dispatchers with zero JavaScript eval risk. Evaluates state machines and triggers in microseconds.
                  </p>
                  <a href="#/modules" class="whats-new-card-link">Learn More &rarr;</a>
                </div>
              </div>

              <!-- 3. Sovereign CRM -->
              <div class="whats-new-card">
                <div class="whats-new-img-wrap">
                  <img src="/solutions/sales.jpg" alt="Enterprise CRM and sales pipeline" class="whats-new-img" loading="lazy" />
                  <span class="whats-new-category">CRM &amp; PIPELINE</span>
                </div>
                <div class="whats-new-content">
                  <h3 class="whats-new-card-title">Composite Key Tenant Isolation</h3>
                  <p class="whats-new-card-desc">
                    Enterprise deal pipelines, contact ledgers, and stage transitions enforced with composite foreign-key invariants preventing cross-tenant leakage.
                  </p>
                  <a href="#/modules" class="whats-new-card-link">Learn More &rarr;</a>
                </div>
              </div>

              <!-- 4. Cryptographic Compliance -->
              <div class="whats-new-card">
                <div class="whats-new-img-wrap">
                  <img src="/solutions/compliance.jpg" alt="Cryptographic data vault and compliance" class="whats-new-img" loading="lazy" />
                  <span class="whats-new-category">COMPLIANCE VAULT</span>
                </div>
                <div class="whats-new-content">
                  <h3 class="whats-new-card-title">GDPR Article 17 Cryptographic Erasure</h3>
                  <p class="whats-new-card-desc">
                    Right-to-be-Forgotten pipeline with key destruction, HMAC blind indexing for searchable encrypted PII, and immutable append-only audit trails.
                  </p>
                  <a href="#/security" class="whats-new-card-link">Learn More &rarr;</a>
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
                <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 34px; max-width: 490px;">
                  Build for scale, definition, and workflow execution &mdash; ZexCore delivers the enterprise foundation your vertical SaaS needs to operate securely without architectural compromises.
                </p>
                <a href="#/architecture" class="btn btn-primary btn-lg">
                  Learn More About Our Architecture &rarr;
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
                <p style="font-size: 1.02rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 32px; max-width: 500px;">
                  From industrial IoT to healthcare and financial operations, ZexCore gives you the foundation to build, scale, and operate industry-specific applications with confidence.
                </p>
                <a href="#/solutions" class="btn btn-outline btn-lg">
                  Explore Solutions &rarr;
                </a>
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

