/**
 * ZexCore Architecture Page
 * Matches reference design column 2:
 * - Top: Tenant Applications container with pills (Web Apps | Mobile Apps | Admin Console | API Clients)
 * - Stack Diagram: REQUEST FLOW (Upwards) on left, 4 colored tiered boxes, DEPENDENCY FLOW (Downwards) on right
 * - Request Lifecycle: 6 numbered cards (1-6) + Response Returned card
 * - Core Invariants: 5 horizontal cards (Tenant Isolation, RLS Enforcement, Modular, Deterministic, Apply Securely)
 * - Technology Stack: Badges row
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderArchitecturePage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('architecture')}

      <main>
        <!-- Page Header -->
        <section class="section-white page-intro-section">
          <div class="page-hero-backdrop" style="background-image: url('/heroes/hero-architecture.jpg');"></div>
          <div class="site-container">
            <div class="page-intro-header page-hero-content-col">
              <div class="section-eyebrow">SYSTEM SPECIFICATION</div>
              <h1 class="page-intro-title">Technical Architecture &amp; Invariants</h1>
              <p class="page-intro-desc">
                An exhaustive engineering breakdown of request lifecycles, database invariants, PostgreSQL Row-Level Security, and asynchronous message topology in ZexCore.
              </p>
            </div>
          </div>
        </section>

        <!-- ── CORE ARCHITECTURE DIAGRAM ────────────────────────── -->
        <section class="section-gray section-padded" style="padding: 48px 0 64px 0;">
          <div class="site-container">
            <div class="arch-diagram-wrapper">
              
              <!-- Top Box: Tenant Applications -->
              <div class="arch-apps-container">
                <div class="arch-apps-title">Tenant Applications</div>
                <div class="arch-apps-pills">
                  <span class="arch-app-pill">Web Apps</span>
                  <span class="arch-app-pill">Mobile Apps</span>
                  <span class="arch-app-pill">Admin Console</span>
                  <span class="arch-app-pill">API Clients</span>
                </div>
              </div>

              <!-- Main Flow Row: Left Arrow + 4 Stacked Boxes + Right Arrow -->
              <div class="arch-flow-layout">
                <!-- Left: Request Flow (Upwards) -->
                <div class="arch-flow-sidebar left">
                  <div class="arch-flow-label">REQUEST FLOW</div>
                  <div class="arch-flow-sublabel">(Upwards)</div>
                  <div class="arch-flow-arrow-up">&uarr;</div>
                </div>

                <!-- Center: 4 Stacked Layers -->
                <div class="arch-layers-stack">
                  <!-- Layer 1: Applications (Solid Red) -->
                  <div class="arch-layer-box layer-app">
                    <div class="layer-title">Applications</div>
                    <div class="layer-desc">API Services &amp; Central Console</div>
                  </div>

                  <!-- Layer 2: Industry Configuration Packs (Dark Red) -->
                  <div class="arch-layer-box layer-packs">
                    <div class="layer-title">Industry Configuration Packs</div>
                    <div class="layer-desc">Vertical Schemas &amp; Workflows</div>
                  </div>

                  <!-- Layer 3: Core Infrastructure (Deep Wine Red) -->
                  <div class="arch-layer-box layer-core">
                    <div class="layer-title">Core Infrastructure</div>
                    <div class="layer-desc">Tenancy | RBAC | EventBus | Audit</div>
                  </div>

                  <!-- Layer 4: PostgreSQL & Security Foundation (White/Light Gray with Border) -->
                  <div class="arch-layer-box layer-db">
                    <div class="layer-title">PostgreSQL &amp; Security Foundation</div>
                    <div class="layer-desc">Persistent Storage | RLS | Encryption</div>
                  </div>
                </div>

                <!-- Right: Dependency Flow (Downwards) -->
                <div class="arch-flow-sidebar right">
                  <div class="arch-flow-label">DEPENDENCY FLOW</div>
                  <div class="arch-flow-sublabel">(Downwards)</div>
                  <div class="arch-flow-arrow-down">&darr;</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- ── REQUEST LIFECYCLE ────────────────────────────────── -->
        <section class="section-white section-padded" style="padding: 64px 0;">
          <div class="site-container">
            <div class="section-header-block" style="text-align: left; margin-bottom: 36px;">
              <h2 class="section-title" style="text-align: left; font-size: 1.85rem;">Request Lifecycle</h2>
            </div>

            <!-- 6 Numbered Cards Grid -->
            <div class="lifecycle-grid">
              <!-- Step 1 -->
              <div class="lifecycle-card">
                <div class="lifecycle-num">1</div>
                <div class="lifecycle-body">
                  <h4 class="lifecycle-title">Request Received</h4>
                  <p class="lifecycle-desc">API gateway validates request and extracts tenant context.</p>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="lifecycle-card">
                <div class="lifecycle-num">2</div>
                <div class="lifecycle-body">
                  <h4 class="lifecycle-title">Tenant Resolved</h4>
                  <p class="lifecycle-desc">Tenant is identified and context is loaded (read).</p>
                </div>
              </div>

              <!-- Step 3 -->
              <div class="lifecycle-card">
                <div class="lifecycle-num">3</div>
                <div class="lifecycle-body">
                  <h4 class="lifecycle-title">Authorization</h4>
                  <p class="lifecycle-desc">RBAC and policy checks are enforced.</p>
                </div>
              </div>

              <!-- Step 4 -->
              <div class="lifecycle-card">
                <div class="lifecycle-num">4</div>
                <div class="lifecycle-body">
                  <h4 class="lifecycle-title">Database Transaction</h4>
                  <p class="lifecycle-desc">RLS policies and tenant context are applied.</p>
                </div>
              </div>

              <!-- Step 5 -->
              <div class="lifecycle-card">
                <div class="lifecycle-num">5</div>
                <div class="lifecycle-body">
                  <h4 class="lifecycle-title">Event Publication</h4>
                  <p class="lifecycle-desc">Domain events are published to EventBus.</p>
                </div>
              </div>

              <!-- Step 6 -->
              <div class="lifecycle-card">
                <div class="lifecycle-num">6</div>
                <div class="lifecycle-body">
                  <h4 class="lifecycle-title">Audit Logging</h4>
                  <p class="lifecycle-desc">Action is recorded for traceability.</p>
                </div>
              </div>
            </div>

            <!-- Response Returned Card -->
            <div class="lifecycle-response-card" style="margin-top: 20px;">
              <div class="lifecycle-num check-num">&check;</div>
              <div class="lifecycle-body">
                <h4 class="lifecycle-title">Response Returned</h4>
                <p class="lifecycle-desc">Result is returned to client, with proper isolation.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ── CORE INVARIANTS ──────────────────────────────────── -->
        <section class="section-gray section-padded" style="padding: 64px 0;">
          <div class="site-container">
            <div class="section-header-block" style="text-align: left; margin-bottom: 32px;">
              <h2 class="section-title" style="text-align: left; font-size: 1.85rem;">Core Invariants</h2>
            </div>

            <div class="invariants-row">
              <div class="invariant-card">
                <div class="invariant-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                </div>
                <h4 class="invariant-title">Strict Tenant Isolation</h4>
                <p class="invariant-desc">Guaranteed boundary enforcement preventing cross-tenant data bleed at all layers.</p>
              </div>

              <div class="invariant-card">
                <div class="invariant-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                  </svg>
                </div>
                <h4 class="invariant-title">Database-Enforced RLS</h4>
                <p class="invariant-desc">PostgreSQL 17 engine-native policies applied unconditionally to all queries.</p>
              </div>

              <div class="invariant-card">
                <div class="invariant-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                    <polyline points="2 17 12 22 22 17"/>
                    <polyline points="2 12 12 17 22 12"/>
                  </svg>
                </div>
                <h4 class="invariant-title">Explicit Module Boundaries</h4>
                <p class="invariant-desc">Formal npm package export maps with strict zero circular dependency enforcement.</p>
              </div>

              <div class="invariant-card">
                <div class="invariant-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <h4 class="invariant-title">Deterministic Rule Execution</h4>
                <p class="invariant-desc">Sandboxed AST evaluation ensuring predictable outcome without arbitrary JS execution.</p>
              </div>

              <div class="invariant-card">
                <div class="invariant-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </div>
                <h4 class="invariant-title">Asynchronous EventBus</h4>
                <p class="invariant-desc">Decoupled pub/sub topology guaranteeing reliable cross-module event dispatching.</p>
              </div>

              <div class="invariant-card">
                <div class="invariant-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h4 class="invariant-title">Cryptographic Protection</h4>
                <p class="invariant-desc">AES-256-GCM envelope encryption and blind indexing safeguarding sensitive records.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ── TECHNOLOGY STACK ────────────────────────────────── -->
        <section class="section-white" style="padding: 56px 0; border-top: 1px solid var(--border-default);">
          <div class="site-container">
            <div class="section-header-block" style="text-align: left; margin-bottom: 24px;">
              <h2 class="section-title" style="text-align: left; font-size: 1.5rem;">Technology Stack</h2>
            </div>

            <div class="arch-tech-badges-row">
              <span class="arch-tech-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                PostgreSQL 17
              </span>
              <span class="arch-tech-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                TypeScript
              </span>
              <span class="arch-tech-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                Node.js
              </span>
              <span class="arch-tech-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Fastify
              </span>
              <span class="arch-tech-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                pnpm
              </span>
              <span class="arch-tech-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                JWT
              </span>
              <span class="arch-tech-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                AES-256-GCM
              </span>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="section-gray final-cta-section" style="border-top: 1px solid var(--border-default);">
          <div class="site-container final-cta-inner">
            <h2 class="final-cta-headline">Inspect the Complete Module Contract</h2>
            <p class="final-cta-subtext">
              Review how ZexCore modules register schemas, REST endpoints, and EventBus listeners via formal lifecycle hooks.
            </p>
            <div class="final-cta-buttons">
              <a href="#/modules" class="btn btn-primary btn-lg">
                Explore Core Modules &rarr;
              </a>
              <a href="#/docs" class="btn btn-secondary btn-lg">
                View API Documentation
              </a>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
