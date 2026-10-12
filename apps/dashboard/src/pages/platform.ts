/**
 * ZexCore Platform & Capabilities Page
 * Enterprise Red & White Design System
 * 8 Core Platform Engines Architecture Breakdown
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderPlatformPage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('platform')}

      <main>
        <!-- Page Header -->
        <section class="section-white page-intro-section">
          <div class="page-hero-backdrop" style="background-image: url('/heroes/hero-platform.jpg');"></div>
          <div class="site-container">
            <div class="page-intro-header page-hero-content-col">
              <div class="section-eyebrow">THE OPERATING SYSTEM FOR VERTICAL SAAS</div>
              <h1 class="page-intro-title">Complete Platform Architecture</h1>
              <p class="page-intro-desc">
                ZexCore provides eight foundational infrastructure engines. Each subsystem is engineered for strict multi-tenancy, predictable latency, and zero cross-tenant contamination.
              </p>
            </div>
          </div>
        </section>

        <!-- ── 8 PLATFORM ENGINES GRID ───────────────────────────── -->
        <section class="section-gray section-padded" style="padding: 48px 0 80px 0;">
          <div class="site-container">
            <div class="platform-engines-grid">

              <!-- Engine 1 -->
              <div class="engine-card">
                <div class="engine-card-header">
                  <div class="engine-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="3" y1="9" x2="21" y2="9"/>
                      <line x1="9" y1="21" x2="9" y2="9"/>
                    </svg>
                  </div>
                  <div>
                    <div class="engine-eyebrow">FOUNDATION 01</div>
                    <h3 class="engine-title">Sovereign Tenancy Engine</h3>
                  </div>
                </div>
                <p class="engine-desc">
                  Every inbound HTTP request and background worker job is bound to Node.js <code>AsyncLocalStorage</code>, ensuring complete isolation with zero thread-bleed.
                </p>
                <div class="engine-meta-tags">
                  <span class="engine-tag">AsyncLocalStorage</span>
                  <span class="engine-tag">Fastify Hook</span>
                </div>
              </div>

              <!-- Engine 2 -->
              <div class="engine-card">
                <div class="engine-card-header">
                  <div class="engine-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                      <ellipse cx="12" cy="5" rx="9" ry="3"/>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                    </svg>
                  </div>
                  <div>
                    <div class="engine-eyebrow">FOUNDATION 02</div>
                    <h3 class="engine-title">PostgreSQL Row-Level Security</h3>
                  </div>
                </div>
                <p class="engine-desc">
                  Hardware-enforced isolation directly inside the PostgreSQL 17 query engine via session-bound <code>SET LOCAL app.current_tenant_id</code> and non-superuser roles.
                </p>
                <div class="engine-meta-tags">
                  <span class="engine-tag">Postgres 17</span>
                  <span class="engine-tag">FORCE RLS</span>
                </div>
              </div>

              <!-- Engine 3 -->
              <div class="engine-card">
                <div class="engine-card-header">
                  <div class="engine-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                  <div>
                    <div class="engine-eyebrow">FOUNDATION 03</div>
                    <h3 class="engine-title">Deterministic Rules Engine</h3>
                  </div>
                </div>
                <p class="engine-desc">
                  Safely evaluate complex tenant-authored formulas with an Abstract Syntax Tree interpreter. Strict instruction caps and 50ms timeouts prevent DoS.
                </p>
                <div class="engine-meta-tags">
                  <span class="engine-tag">Safe AST</span>
                  <span class="engine-tag">&lt; 1ms Eval</span>
                </div>
              </div>

              <!-- Engine 4 -->
              <div class="engine-card">
                <div class="engine-card-header">
                  <div class="engine-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                      <polyline points="2 17 12 22 22 17"/>
                      <polyline points="2 12 12 17 22 12"/>
                    </svg>
                  </div>
                  <div>
                    <div class="engine-eyebrow">FOUNDATION 04</div>
                    <h3 class="engine-title">Asynchronous EventBus Mesh</h3>
                  </div>
                </div>
                <p class="engine-desc">
                  Decoupled publish-subscribe broker interconnecting domain modules (IoT telemetry, CRM pipeline, and audit logging) without tight compile-time coupling.
                </p>
                <div class="engine-meta-tags">
                  <span class="engine-tag">Pub / Sub</span>
                  <span class="engine-tag">Decoupled</span>
                </div>
              </div>

              <!-- Engine 5 -->
              <div class="engine-card">
                <div class="engine-card-header">
                  <div class="engine-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div>
                    <div class="engine-eyebrow">FOUNDATION 05</div>
                    <h3 class="engine-title">Cryptographic Privacy Vault</h3>
                  </div>
                </div>
                <p class="engine-desc">
                  AES-256-GCM envelope encryption with per-tenant data encryption keys and HMAC-SHA256 blind indexing for encrypted exact-match record lookups.
                </p>
                <div class="engine-meta-tags">
                  <span class="engine-tag">AES-256-GCM</span>
                  <span class="engine-tag">Blind Index</span>
                </div>
              </div>

              <!-- Engine 6 -->
              <div class="engine-card">
                <div class="engine-card-header">
                  <div class="engine-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <div>
                    <div class="engine-eyebrow">FOUNDATION 06</div>
                    <h3 class="engine-title">Immutable Audit Ledger</h3>
                  </div>
                </div>
                <p class="engine-desc">
                  Every state change generates an append-only entry with cryptographic SHA-256 hash chaining. Database permissions revoke <code>UPDATE</code> and <code>DELETE</code>.
                </p>
                <div class="engine-meta-tags">
                  <span class="engine-tag">SHA-256 Hash Chain</span>
                  <span class="engine-tag">Non-Repudiation</span>
                </div>
              </div>

              <!-- Engine 7 -->
              <div class="engine-card">
                <div class="engine-card-header">
                  <div class="engine-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                      <line x1="12" y1="20" x2="12.01" y2="20"/>
                    </svg>
                  </div>
                  <div>
                    <div class="engine-eyebrow">FOUNDATION 07</div>
                    <h3 class="engine-title">Edge IoT Telemetry Ingestion</h3>
                  </div>
                </div>
                <p class="engine-desc">
                  High-throughput sensor ingestion with device token authentication, time-series metrics capture, and instantaneous threshold rule dispatch.
                </p>
                <div class="engine-meta-tags">
                  <span class="engine-tag">10k+ msgs/s</span>
                  <span class="engine-tag">Token Auth</span>
                </div>
              </div>

              <!-- Engine 8 -->
              <div class="engine-card">
                <div class="engine-card-header">
                  <div class="engine-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <div class="engine-eyebrow">FOUNDATION 08</div>
                    <h3 class="engine-title">Vertical CRM &amp; Pipeline Engine</h3>
                  </div>
                </div>
                <p class="engine-desc">
                  Multi-currency opportunity pipeline tracking, stage transitions, tenant-scoped contacts, and automated follow-up triggers out of the box.
                </p>
                <div class="engine-meta-tags">
                  <span class="engine-tag">Multi-Currency</span>
                  <span class="engine-tag">Pipeline Stages</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="section-white final-cta-section" style="border-top: 1px solid var(--border-default);">
          <div class="site-container final-cta-inner">
            <h2 class="final-cta-headline">Explore the Architecture Details</h2>
            <p class="final-cta-subtext">
              Inspect database schemas, request lifecycle diagrams, and formal invariants across all tiers.
            </p>
            <div class="final-cta-buttons">
              <a href="#/architecture" class="btn btn-primary btn-lg">
                View Architecture Specification &rarr;
              </a>
              <a href="#/console" class="btn btn-secondary btn-lg">
                Launch Control Console
              </a>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
