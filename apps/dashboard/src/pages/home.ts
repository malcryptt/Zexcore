/**
 * ZexCore Enterprise Homepage
 * Editorial Red-and-White Design System | Authentic Photography & Technical Architecture
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderHomePage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('home')}

      <main>
        <!-- ── HERO SECTION ─────────────────────────────────────────────── -->
        <section class="hero-split-section">
          <div class="site-container hero-split-inner">
            <div class="hero-copy-col">
              <div class="eyebrow-badge">
                <span class="eyebrow-dot"></span>
                ENTERPRISE INFRASTRUCTURE PLATFORM
              </div>
              <h1 class="hero-headline">
                One Core.<br />
                <span class="text-brand">Infinite Possibilities.</span>
              </h1>
              <p class="hero-subtext">
                ZexCore is the multi-tenant backend engine and operating system for vertical SaaS applications &mdash; providing shared, battle-tested infrastructure for identity, hard data isolation, deterministic automation, and cryptographic compliance.
              </p>
              <div class="hero-actions-row">
                <a href="#/console" class="btn btn-primary btn-lg" id="btn-hero-launch">
                  Launch Console &rarr;
                </a>
                <a href="#/architecture" class="btn btn-secondary btn-lg" id="btn-hero-arch">
                  Explore Architecture
                </a>
              </div>

              <!-- Technical Metric Badges -->
              <div class="hero-metrics-grid">
                <div class="metric-item">
                  <div class="metric-val">100%</div>
                  <div class="metric-lbl">RLS Isolation</div>
                </div>
                <div class="metric-item">
                  <div class="metric-val">&lt; 1ms</div>
                  <div class="metric-lbl">AST Rule Eval</div>
                </div>
                <div class="metric-item">
                  <div class="metric-val">AES-256</div>
                  <div class="metric-lbl">Envelope Vault</div>
                </div>
                <div class="metric-item">
                  <div class="metric-val">Postgres 17</div>
                  <div class="metric-lbl">Engine Native</div>
                </div>
              </div>
            </div>

            <div class="hero-visual-col">
              <div class="hero-image-frame">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                  alt="Enterprise engineering team collaborating on multi-tenant infrastructure"
                  class="hero-photo"
                  loading="eager"
                />
                <div class="hero-image-overlay">
                  <div class="overlay-header">
                    <span class="status-indicator-dot"></span>
                    <span>ZexCore Kernel Runtime &mdash; Active</span>
                  </div>
                  <div class="overlay-code">
                    <code>SET LOCAL app.current_tenant_id = 'tenant_prod_us_east';</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── PLATFORM FOUNDATION (EDITORIAL SPLIT) ─────────────────────── -->
        <section class="section-gray section-padded">
          <div class="site-container">
            <div class="section-header-block">
              <div class="section-eyebrow">FOUNDATIONAL CAPABILITIES</div>
              <h2 class="section-title">The Operating System for Vertical SaaS</h2>
              <p class="section-desc">
                Building multi-tenant enterprise software repeatedly leads to fragile data boundaries and fragmented logic. ZexCore provides hardened, shared infrastructure so engineering teams focus purely on vertical domain workflows.
              </p>
            </div>

            <!-- Asymmetric Editorial Grid -->
            <div class="capabilities-editorial-grid">
              <!-- Item 1: Multi-Tenancy (Wide Card) -->
              <div class="cap-card cap-card-wide">
                <div class="cap-card-content">
                  <div class="cap-badge">DATABASE-ENFORCED ISOLATION</div>
                  <h3 class="cap-title">Multi-Tenant Row-Level Security</h3>
                  <p class="cap-desc">
                    Tenant isolation is executed directly inside the PostgreSQL 17 database engine using native Row-Level Security. Every transactional session executes with <code>SET LOCAL app.current_tenant_id</code>. Tables mandate composite keys <code>(tenant_id, id)</code> preventing cross-tenant foreign key traversal.
                  </p>
                  <div class="tech-spec-pills">
                    <span class="tech-pill">FORCE ROW LEVEL SECURITY</span>
                    <span class="tech-pill">Composite Foreign Keys</span>
                    <span class="tech-pill">NOSUPERUSER Application Role</span>
                  </div>
                </div>
                <div class="cap-card-code">
                  <pre><code>CREATE POLICY tenant_isolation_policy
ON devices FOR ALL
TO zexcore_app
USING (tenant_id = current_setting('app.current_tenant_id', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));</code></pre>
                </div>
              </div>

              <!-- Item 2: Deterministic Rules Engine -->
              <div class="cap-card">
                <div class="cap-badge">SAFE AUTOMATION</div>
                <h3 class="cap-title">Deterministic AST Engine</h3>
                <p class="cap-desc">
                  Tenant rules and formula calculations execute through a sandboxed Abstract Syntax Tree interpreter with zero JavaScript <code>eval</code>. Strict 10,000-instruction ceiling and 50ms execution timeouts prevent denial-of-service vulnerabilities.
                </p>
                <div class="card-footer-action">
                  <a href="#/platform#rules" class="inline-link">Explore Rules Pipeline &rarr;</a>
                </div>
              </div>

              <!-- Item 3: Cryptographic Vault -->
              <div class="cap-card">
                <div class="cap-badge">SECURITY &amp; PRIVACY</div>
                <h3 class="cap-title">Cryptographic Envelope Vault</h3>
                <p class="cap-desc">
                  Automated AES-256-GCM envelope encryption with unique tenant data keys. Deterministic HMAC-SHA256 blind indexing enables exact-match queries without decrypting sensitive customer records in memory.
                </p>
                <div class="card-footer-action">
                  <a href="#/security#crypto" class="inline-link">View Crypto Model &rarr;</a>
                </div>
              </div>

              <!-- Item 4: Asynchronous EventBus -->
              <div class="cap-card">
                <div class="cap-badge">EVENT-DRIVEN ARCHITECTURE</div>
                <h3 class="cap-title">Core EventBus Broker</h3>
                <p class="cap-desc">
                  Decoupled publish-subscribe broker connecting IoT device telemetry ingest, CRM sales stage updates, and compliance triggers in real time without creating tight module dependencies.
                </p>
                <div class="card-footer-action">
                  <a href="#/architecture#bus" class="inline-link">Inspect Event Mesh &rarr;</a>
                </div>
              </div>

              <!-- Item 5: Immutable Audit Ledger -->
              <div class="cap-card">
                <div class="cap-badge">COMPLIANCE &amp; TRACEABILITY</div>
                <h3 class="cap-title">Hash-Chained Audit Trail</h3>
                <p class="cap-desc">
                  Every state mutation is recorded in an append-only ledger with cryptographic SHA-256 hash chaining. Database permissions strictly revoke <code>UPDATE</code> and <code>DELETE</code> rights on the audit table.
                </p>
                <div class="card-footer-action">
                  <a href="#/security#audit" class="inline-link">Review Audit Security &rarr;</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── ARCHITECTURE SHOWCASE HIERARCHY ──────────────────────────── -->
        <section class="section-white section-padded" id="architecture-preview">
          <div class="site-container">
            <div class="section-header-block">
              <div class="section-eyebrow">SYSTEM TOPOLOGY</div>
              <h2 class="section-title">Strict Architectural Hierarchy</h2>
              <p class="section-desc">
                ZexCore enforces a clean four-tier boundary. The micro-kernel handles foundation services, reusable modules provide domain logic, industry packs declare manifests, and tenant apps stay completely isolated.
              </p>
            </div>

            <!-- Connected Architecture Diagram Component -->
            <div class="arch-hierarchy-diagram">
              <div class="arch-tier-box tier-tenant">
                <div class="tier-label">TIER 4 &mdash; TENANT APPLICATIONS</div>
                <div class="tier-content-row">
                  <div class="tier-node">Acme Industrial Web App</div>
                  <div class="tier-node">Globex Depot Console</div>
                  <div class="tier-node">Soylent Compliance Portal</div>
                  <div class="tier-node">Third-Party API Clients</div>
                </div>
              </div>

              <div class="arch-connector-line">
                <div class="connector-arrow">&darr; Configured by Industry Manifests</div>
              </div>

              <div class="arch-tier-box tier-packs">
                <div class="tier-label">TIER 3 &mdash; INDUSTRY CONFIGURATION PACKS</div>
                <div class="tier-content-row">
                  <div class="tier-node active-pack">packs/industrial-iot</div>
                  <div class="tier-node active-pack">packs/logistics-fleet</div>
                  <div class="tier-node active-pack">packs/enterprise-crm</div>
                  <div class="tier-node active-pack">packs/regulated-vault</div>
                </div>
              </div>

              <div class="arch-connector-line">
                <div class="connector-arrow">&darr; Composed of Modular Workspace Packages</div>
              </div>

              <div class="arch-tier-box tier-modules">
                <div class="tier-label">TIER 2 &mdash; REUSABLE DOMAIN MODULES</div>
                <div class="tier-content-row">
                  <div class="tier-node">@zexcore/module-iot</div>
                  <div class="tier-node">@zexcore/rules</div>
                  <div class="tier-node">@zexcore/module-crm</div>
                  <div class="tier-node">@zexcore/compliance</div>
                </div>
              </div>

              <div class="arch-connector-line">
                <div class="connector-arrow">&darr; Built on Core Runtime Micro-Kernel</div>
              </div>

              <div class="arch-tier-box tier-core">
                <div class="tier-label">TIER 1 &mdash; ZEXCORE CORE INFRASTRUCTURE (@zexcore/core)</div>
                <div class="tier-content-row">
                  <div class="tier-node highlight-node">PostgreSQL 17 RLS Engine</div>
                  <div class="tier-node highlight-node">Identity &amp; RBAC</div>
                  <div class="tier-node highlight-node">Core EventBus Broker</div>
                  <div class="tier-node highlight-node">Hash-Chained Audit Ledger</div>
                </div>
              </div>
            </div>

            <div class="arch-cta-center">
              <a href="#/architecture" class="btn btn-secondary">
                View Full Technical Architecture &amp; Data Flows &rarr;
              </a>
            </div>
          </div>
        </section>

        <!-- ── REAL VERTICAL INDUSTRY SOLUTIONS ─────────────────────────── -->
        <section class="section-gray section-padded">
          <div class="site-container">
            <div class="section-header-block">
              <div class="section-eyebrow">VERTICAL USE CASES</div>
              <h2 class="section-title">Engineered for High-Stakes Industries</h2>
              <p class="section-desc">
                From manufacturing automation to refrigerated cold-chains, ZexCore packs configure capabilities without rewriting or destabilizing the foundational core engine.
              </p>
            </div>

            <div class="solutions-showcase-grid">
              <!-- Solution 1: Industrial IoT -->
              <div class="solution-card">
                <div class="solution-img-wrapper">
                  <img
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
                    alt="Industrial robotics and manufacturing equipment"
                    class="solution-img"
                    loading="lazy"
                  />
                  <div class="solution-tag">PACK: INDUSTRIAL-IOT</div>
                </div>
                <div class="solution-body">
                  <h3 class="solution-title">Industrial IoT &amp; Telemetry</h3>
                  <p class="solution-text">
                    Token-authenticated edge sensor ingestion (<code>X-Device-Token</code>), time-series storage, threshold alerting, and bidirectional remote command execution for manufacturing lines.
                  </p>
                  <div class="solution-metrics">
                    <span><strong>10,000+</strong> msgs/sec ingest</span>
                    <span><strong>SHA-256</strong> token auth</span>
                  </div>
                </div>
              </div>

              <!-- Solution 2: Cold-Chain Logistics -->
              <div class="solution-card">
                <div class="solution-img-wrapper">
                  <img
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
                    alt="Modern logistics distribution warehouse"
                    class="solution-img"
                    loading="lazy"
                  />
                  <div class="solution-tag">PACK: LOGISTICS-FLEET</div>
                </div>
                <div class="solution-body">
                  <h3 class="solution-title">Logistics &amp; Cold-Chain Fleet</h3>
                  <p class="solution-text">
                    Multi-facility depot tracking, temperature threshold alerts for pharmaceuticals and perishables, vehicle telemetry dispatch, and cross-depot handoff records.
                  </p>
                  <div class="solution-metrics">
                    <span><strong>-4.2&deg;C</strong> chiller tracking</span>
                    <span><strong>GPS / Temp</strong> fusion</span>
                  </div>
                </div>
              </div>

              <!-- Solution 3: Regulated Data Vault -->
              <div class="solution-card">
                <div class="solution-img-wrapper">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
                    alt="Secure enterprise server racks and data center"
                    class="solution-img"
                    loading="lazy"
                  />
                  <div class="solution-tag">PACK: REGULATED-VAULT</div>
                </div>
                <div class="solution-body">
                  <h3 class="solution-title">Cryptographic Compliance Vault</h3>
                  <p class="solution-text">
                    GDPR Article 17 Right-to-be-Forgotten erasure pipeline, verifiable consent ledger with lawful basis tracking, and AES-256-GCM envelope encryption.
                  </p>
                  <div class="solution-metrics">
                    <span><strong>AES-256-GCM</strong> envelope</span>
                    <span><strong>1-Click</strong> GDPR erasure</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="arch-cta-center">
              <a href="#/solutions" class="btn btn-secondary">
                Explore All Industry Configuration Packs &rarr;
              </a>
            </div>
          </div>
        </section>

        <!-- ── SECURITY CALLOUT ─────────────────────────────────────────── -->
        <section class="section-white section-padded">
          <div class="site-container">
            <div class="security-feature-banner">
              <div class="security-banner-content">
                <div class="section-eyebrow">VERIFIED SECURITY INVARIANTS</div>
                <h2 class="security-banner-title">Zero Cross-Tenant Leakage Guarantee</h2>
                <p class="security-banner-desc">
                  We don't rely on software developer discipline or <code>where tenant_id = x</code> clauses in application code. Tenant isolation is enforced mathematically at the database session level using PostgreSQL Row-Level Security and composite keys.
                </p>
                <div class="security-badges-row">
                  <div class="sec-badge-item">
                    <span class="sec-icon">&check;</span>
                    <span>FORCE ROW LEVEL SECURITY</span>
                  </div>
                  <div class="sec-badge-item">
                    <span class="sec-icon">&check;</span>
                    <span>REVOKE UPDATE, DELETE on Audit</span>
                  </div>
                  <div class="sec-badge-item">
                    <span class="sec-icon">&check;</span>
                    <span>Zero JavaScript eval Execution</span>
                  </div>
                  <div class="sec-badge-item">
                    <span class="sec-icon">&check;</span>
                    <span>SSRF Private Range Filtering</span>
                  </div>
                </div>
              </div>
              <div class="security-banner-action">
                <a href="#/security" class="btn btn-primary btn-lg">
                  Read Enterprise Security Whitepaper &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- ── FINAL CALL TO ACTION ─────────────────────────────────────── -->
        <section class="section-gray final-cta-section">
          <div class="site-container final-cta-inner">
            <h2 class="final-cta-headline">Ready to Deploy Your Multi-Tenant SaaS?</h2>
            <p class="final-cta-subtext">
              Experience ZexCore Control live with pre-authenticated demo tenants across industrial IoT, deterministic rules, CRM, and cryptographic compliance vaults.
            </p>
            <div class="final-cta-buttons">
              <a href="#/console" class="btn btn-primary btn-lg">
                Launch Control Console &rarr;
              </a>
              <a href="#/docs" class="btn btn-secondary btn-lg">
                Read Developer Documentation
              </a>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
