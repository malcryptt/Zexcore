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
    titleHtml: 'Accelerate<br />Industrial<br /><span class="huawei-hero-red">Intelligence.</span>',
    subtext: 'The sovereign multi-tenant operating system for vertical SaaS — power grids, industrial IoT telemetry, deterministic rules automation, and cryptographic compliance vaults.',
    image: '/hero-industrial-chevron.jpg',
    alt: 'Industrial intelligence chevron showing smart cities, energy grids, robotics welding, and high-speed rail',
    primaryCtaText: 'Launch Console →',
    primaryCtaHref: '#/console',
    secondaryCtaText: 'Explore Solutions',
    secondaryCtaHref: '#/solutions',
  },
  {
    badge: 'POSTGRESQL 17 ROW-LEVEL SECURITY',
    titleHtml: '<span class="huawei-hero-red">Sovereign<br />Multi-Tenancy.<br />Zero Leakage.</span>',
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
    titleHtml: 'Deterministic<br />Rules &amp; Automation.<br /><span class="huawei-hero-red">&lt; 1ms Latency.</span>',
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
        <section class="huawei-flagship-hero" id="home-flagship-hero">
          <div id="hero-half-backdrop" class="huawei-half-backdrop" style="display: none; opacity: 0;"></div>
          <div class="site-container">
            <div class="huawei-hero-grid">
              
              <!-- Left Visual: Industrial Chevron Showcase (Active on Slide 0) -->
              <div class="huawei-hero-visual-col" id="hero-chevron-col">
                <div class="huawei-chevron-frame">
                  <img
                    id="hero-slide-img"
                    src="${defaultSlide.image}"
                    alt="${defaultSlide.alt}"
                    class="huawei-chevron-img"
                    loading="eager"
                  />
                  <div class="huawei-chevron-overlay-glow"></div>
                </div>
              </div>

              <!-- Right Copy: Enterprise Headline & Actions -->
              <div class="huawei-hero-copy-col">
                <div class="huawei-brand-geometric-symbol">
                  <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
                    <polygon points="4,4 16,16 4,28" fill="#E50920" />
                    <polygon points="14,4 26,16 14,28" fill="#17191D" />
                  </svg>
                </div>

                <h1 class="huawei-hero-title" id="hero-slide-title">
                  ${defaultSlide.titleHtml}
                </h1>

                <p class="huawei-hero-desc" id="hero-slide-desc">
                  ${defaultSlide.subtext}
                </p>

                <div class="huawei-hero-actions" id="hero-slide-actions">
                  <a href="${defaultSlide.primaryCtaHref}" class="btn btn-primary btn-lg" id="btn-hero-primary">
                    ${defaultSlide.primaryCtaText}
                  </a>
                  <a href="${defaultSlide.secondaryCtaHref}" class="btn btn-outline btn-lg" id="btn-hero-secondary">
                    ${defaultSlide.secondaryCtaText}
                  </a>
                </div>
              </div>

            </div>

            <!-- Slide Pagination Indicators Matching Huawei Reference -->
            <div class="huawei-slider-indicators" aria-label="Hero carousel pagination">
              <button class="huawei-slide-pill active" data-slide-index="0" aria-label="Go to slide 1"></button>
              <button class="huawei-slide-pill" data-slide-index="1" aria-label="Go to slide 2"></button>
              <button class="huawei-slide-pill" data-slide-index="2" aria-label="Go to slide 3"></button>
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
             "WHAT'S NEW" SECTION (MATCHING HUAWEI REFERENCE DESIGN)
             ═══════════════════════════════════════════════════════════════ -->
        <section class="section-gray section-padded whats-new-section" style="padding: 72px 0 84px 0;">
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
        <section class="section-white section-padded" style="padding: 80px 0;">
          <div class="site-container">
            <div class="multi-tenant-split-grid">
              <!-- Left Column: Copy & Button -->
              <div class="multi-tenant-copy">
                <div class="hero-eyebrow-pill" style="margin-bottom: 16px;">
                  <span class="hero-eyebrow-dot"></span>
                  SOVEREIGN PLATFORM ARCHITECTURE
                </div>
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
        <section class="section-gray section-padded" style="padding: 80px 0;">
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
                <div class="hero-eyebrow-pill" style="margin-bottom: 16px;">
                  <span class="hero-eyebrow-dot"></span>
                  PRODUCTION-GRADE FOUNDATION
                </div>
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
        <section class="section-white section-padded" style="padding: 56px 0 68px 0; border-top: 1px solid var(--border-default);">
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
  const pills = document.querySelectorAll<HTMLButtonElement>('.huawei-slide-pill');
  if (!pills.length) return;

  let currentSlide = 0;
  let autoTimer: ReturnType<typeof setInterval> | null = null;

  function setSlide(index: number) {
    if (index < 0 || index >= heroSlides.length) return;
    currentSlide = index;
    const slide = heroSlides[index];

    // Update active pill
    pills.forEach((p, idx) => {
      p.classList.toggle('active', idx === index);
    });

    // Update DOM elements with smooth transition
    const img = document.getElementById('hero-slide-img') as HTMLImageElement | null;
    const chevronCol = document.getElementById('hero-chevron-col');
    const halfBackdrop = document.getElementById('hero-half-backdrop');
    const badgeText = document.getElementById('hero-badge-text');
    const title = document.getElementById('hero-slide-title');
    const desc = document.getElementById('hero-slide-desc');
    const btnPrimary = document.getElementById('btn-hero-primary') as HTMLAnchorElement | null;
    const btnSecondary = document.getElementById('btn-hero-secondary') as HTMLAnchorElement | null;

    if (index === 0) {
      // Slide 0: Accelerate slide remains the classic chevron frame
      if (halfBackdrop) {
        halfBackdrop.style.opacity = '0';
        setTimeout(() => { halfBackdrop.style.display = 'none'; }, 200);
      }
      if (chevronCol) {
        chevronCol.style.display = 'block';
        chevronCol.style.visibility = 'visible';
        chevronCol.style.opacity = '1';
      }
      if (img) {
        img.src = slide.image;
        img.alt = slide.alt;
      }
    } else {
      // Slides 1 & 2: Occupies left half of hero section, fading smoothly into right
      if (chevronCol) {
        chevronCol.style.opacity = '0';
        chevronCol.style.visibility = 'hidden';
      }
      if (halfBackdrop) {
        halfBackdrop.style.display = 'block';
        halfBackdrop.style.backgroundImage = `url('${slide.image}')`;
        setTimeout(() => { halfBackdrop.style.opacity = '1'; }, 50);
      }
    }

    if (badgeText) badgeText.textContent = slide.badge;
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
  }

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const idx = parseInt(pill.getAttribute('data-slide-index') || '0', 10);
      setSlide(idx);
      resetAutoTimer();
    });
  });

  function resetAutoTimer() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      const next = (currentSlide + 1) % heroSlides.length;
      setSlide(next);
    }, 6000);
  }

  resetAutoTimer();
}
