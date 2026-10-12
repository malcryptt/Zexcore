/**
 * ZexCore Modules Page
 * Dedicated Documentation of All Implemented Core Modules
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderModulesPage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('modules')}

      <main>
        <!-- Page Header -->
        <section class="section-white page-intro-section">
          <div class="site-container">
            <div class="page-intro-header">
              <div class="section-eyebrow">MODULAR DOMAIN ENGINES</div>
              <h1 class="page-intro-title">Platform Modules</h1>
              <p class="page-intro-desc">
                ZexCore modules are isolated pnpm workspace packages that register database schemas, REST endpoints, EventBus listeners, and capabilities through a formal lifecycle contract.
              </p>
            </div>
          </div>
        </section>

        <!-- Module 1: @zexcore/core -->
        <section class="section-gray section-padded" id="core">
          <div class="site-container module-detail-card">
            <div class="module-header-row">
              <div>
                <span class="module-chip"><span class="dot"></span>CORE MICRO-KERNEL</span>
                <h2 class="module-title">@zexcore/core</h2>
                <div class="module-tagline">Foundational Tenancy, RBAC, Database RLS, and EventBus Broker</div>
              </div>
              <div class="module-badge-box">
                <span class="tech-badge">Dependency: Root</span>
                <span class="tech-badge">Exports: "."</span>
              </div>
            </div>

            <div class="module-body-grid">
              <div class="module-col">
                <h4 class="subhead">Verified Capabilities</h4>
                <ul class="module-feat-list">
                  <li><strong>Tenancy Resolution:</strong> Subdomain &amp; header context extraction bound to <code>AsyncLocalStorage</code>.</li>
                  <li><strong>PostgreSQL 17 RLS:</strong> Connection session binding via <code>SET LOCAL app.current_tenant_id</code>.</li>
                  <li><strong>Capability Authorization:</strong> Granular capability checks on tenant memberships.</li>
                  <li><strong>Core EventBus:</strong> In-process asynchronous pub-sub broker.</li>
                  <li><strong>Immutable Audit Trail:</strong> Append-only SHA-256 hash-chained mutation ledger.</li>
                </ul>
              </div>

              <div class="module-col">
                <h4 class="subhead">REST Endpoints &amp; Routes</h4>
                <div class="endpoint-list">
                  <div class="endpoint-row"><span class="method-get">GET</span><code>/api/tenants/current</code> &mdash; Resolve active tenant context</div>
                  <div class="endpoint-row"><span class="method-post">POST</span><code>/api/auth/token</code> &mdash; Authenticate user &amp; generate JWT</div>
                  <div class="endpoint-row"><span class="method-get">GET</span><code>/api/audit/logs</code> &mdash; Query tenant-scoped audit trail</div>
                  <div class="endpoint-row"><span class="method-get">GET</span><code>/health</code> &mdash; Runtime health &amp; module status check</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Module 2: @zexcore/module-iot -->
        <section class="section-white section-padded" id="iot">
          <div class="site-container module-detail-card">
            <div class="module-header-row">
              <div>
                <span class="module-chip"><span class="dot"></span>EDGE &amp; TELEMETRY</span>
                <h2 class="module-title">@zexcore/module-iot</h2>
                <div class="module-tagline">Hardware Fleet Management, Ingest Gateway, and Command Dispatch</div>
              </div>
              <div class="module-badge-box">
                <span class="tech-badge">Depends on: @zexcore/core</span>
              </div>
            </div>

            <div class="module-body-grid">
              <div class="module-col">
                <h4 class="subhead">Verified Capabilities</h4>
                <ul class="module-feat-list">
                  <li><strong>Token Authentication:</strong> Single-use secret token generation with SHA-256 hashing (<code>X-Device-Token</code>).</li>
                  <li><strong>Telemetry Ingest:</strong> High-throughput time-series metrics recording (temperature, humidity, voltage).</li>
                  <li><strong>Threshold Events:</strong> Emits <code>iot.telemetry.received</code> on EventBus triggering automated rules.</li>
                  <li><strong>Command Dispatch:</strong> Bidirectional control plane dispatching instructions to edge nodes.</li>
                </ul>
              </div>

              <div class="module-col">
                <h4 class="subhead">REST Endpoints &amp; Routes</h4>
                <div class="endpoint-list">
                  <div class="endpoint-row"><span class="method-post">POST</span><code>/api/iot/devices</code> &mdash; Register edge hardware node</div>
                  <div class="endpoint-row"><span class="method-post">POST</span><code>/api/iot/telemetry</code> &mdash; Ingest sensor readings via token</div>
                  <div class="endpoint-row"><span class="method-get">GET</span><code>/api/iot/devices/:id/telemetry</code> &mdash; Time-series history</div>
                  <div class="endpoint-row"><span class="method-post">POST</span><code>/api/iot/devices/:id/commands</code> &mdash; Dispatch control command</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Module 3: @zexcore/rules -->
        <section class="section-gray section-padded" id="rules">
          <div class="site-container module-detail-card">
            <div class="module-header-row">
              <div>
                <span class="module-chip"><span class="dot"></span>DETERMINISTIC AUTOMATION</span>
                <h2 class="module-title">@zexcore/rules</h2>
                <div class="module-tagline">Safe AST Interpreter &amp; AI Authoring Assistant with Human Gate</div>
              </div>
              <div class="module-badge-box">
                <span class="tech-badge">Depends on: @zexcore/core</span>
              </div>
            </div>

            <div class="module-body-grid">
              <div class="module-col">
                <h4 class="subhead">Verified Capabilities</h4>
                <ul class="module-feat-list">
                  <li><strong>Zero Arbitrary Code:</strong> Prohibits JS <code>eval</code> and <code>new Function</code>. Uses an AST visitor.</li>
                  <li><strong>Safety Invariants:</strong> Max 10,000 instruction steps and 50ms execution ceiling.</li>
                  <li><strong>EventBus Subscriptions:</strong> Listens to any platform topic and triggers automated side-effects.</li>
                  <li><strong>AI Authoring Pipeline:</strong> Natural language generation via Gemini API with mandatory <code>approved: false</code> gate.</li>
                </ul>
              </div>

              <div class="module-col">
                <h4 class="subhead">REST Endpoints &amp; Routes</h4>
                <div class="endpoint-list">
                  <div class="endpoint-row"><span class="method-get">GET</span><code>/api/rules</code> &mdash; List tenant rules and approval status</div>
                  <div class="endpoint-row"><span class="method-post">POST</span><code>/api/rules</code> &mdash; Create rule definition</div>
                  <div class="endpoint-row"><span class="method-post">POST</span><code>/api/rules/ai-generate</code> &mdash; LLM draft generation</div>
                  <div class="endpoint-row"><span class="method-post">POST</span><code>/api/rules/:id/approve</code> &mdash; Human approval safety gate</div>
                  <div class="endpoint-row"><span class="method-post">POST</span><code>/api/rules/evaluate</code> &mdash; Test AST against mock payload</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Module 4: @zexcore/module-crm -->
        <section class="section-white section-padded" id="crm">
          <div class="site-container module-detail-card">
            <div class="module-header-row">
              <div>
                <span class="module-chip"><span class="dot"></span>SALES &amp; RELATIONSHIPS</span>
                <h2 class="module-title">@zexcore/module-crm</h2>
                <div class="module-tagline">Multi-Currency Sales Pipelines, Kanban Stages, and Lead Governance</div>
              </div>
              <div class="module-badge-box">
                <span class="tech-badge">Depends on: @zexcore/core</span>
              </div>
            </div>

            <div class="module-body-grid">
              <div class="module-col">
                <h4 class="subhead">Verified Capabilities</h4>
                <ul class="module-feat-list">
                  <li><strong>Multi-Tenant Sales Pipeline:</strong> Tenant-isolated leads, contacts, accounts, and deal stages.</li>
                  <li><strong>Multi-Currency Support:</strong> Normalized deal value analytics across global currencies.</li>
                  <li><strong>Lifecycle Transitions:</strong> Moving leads between stages emits <code>crm.lead.stage_changed</code>.</li>
                  <li><strong>Audit-Logged Activities:</strong> Every call, email, and meeting logged to immutable audit ledger.</li>
                </ul>
              </div>

              <div class="module-col">
                <h4 class="subhead">REST Endpoints &amp; Routes</h4>
                <div class="endpoint-list">
                  <div class="endpoint-row"><span class="method-get">GET</span><code>/api/crm/leads</code> &mdash; Query pipeline opportunities</div>
                  <div class="endpoint-row"><span class="method-post">POST</span><code>/api/crm/leads</code> &mdash; Create new sales deal</div>
                  <div class="endpoint-row"><span class="method-patch">PATCH</span><code>/api/crm/leads/:id/stage</code> &mdash; Advance Kanban stage</div>
                  <div class="endpoint-row"><span class="method-get">GET</span><code>/api/crm/contacts</code> &mdash; List tenant-isolated contacts</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Module 5: @zexcore/compliance -->
        <section class="section-gray section-padded" id="compliance">
          <div class="site-container module-detail-card">
            <div class="module-header-row">
              <div>
                <span class="module-chip"><span class="dot"></span>CRYPTOGRAPHIC PRIVACY</span>
                <h2 class="module-title">@zexcore/compliance</h2>
                <div class="module-tagline">AES-256-GCM Envelope Encryption, HMAC Blind Indexes, and GDPR Erasure</div>
              </div>
              <div class="module-badge-box">
                <span class="tech-badge">Depends on: @zexcore/core</span>
              </div>
            </div>

            <div class="module-body-grid">
              <div class="module-col">
                <h4 class="subhead">Verified Capabilities</h4>
                <ul class="module-feat-list">
                  <li><strong>Envelope Encryption:</strong> AES-256-GCM cipher with per-tenant data keys (<code>enc:v1:&lt;iv&gt;:&lt;tag&gt;:&lt;data&gt;</code>).</li>
                  <li><strong>HMAC Blind Indexing:</strong> Deterministic HMAC-SHA256 hash enabling exact queries on encrypted fields.</li>
                  <li><strong>Consent Ledger:</strong> Verifiable consent grants with lawful basis and timestamp tracking.</li>
                  <li><strong>Right to be Forgotten:</strong> Automated GDPR Article 17 subject pseudonymization (<code>[REDACTED]</code>).</li>
                </ul>
              </div>

              <div class="module-col">
                <h4 class="subhead">REST Endpoints &amp; Routes</h4>
                <div class="endpoint-list">
                  <div class="endpoint-row"><span class="method-post">POST</span><code>/api/compliance/encrypt</code> &mdash; AES-256-GCM envelope encrypt</div>
                  <div class="endpoint-row"><span class="method-post">POST</span><code>/api/compliance/decrypt</code> &mdash; Decrypt ciphertext payload</div>
                  <div class="endpoint-row"><span class="method-get">GET</span><code>/api/compliance/consents</code> &mdash; Query GDPR consent ledger</div>
                  <div class="endpoint-row"><span class="method-post">POST</span><code>/api/compliance/erasure</code> &mdash; Execute subject erasure</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Interactive Control Console CTA -->
        <section class="section-white final-cta-section">
          <div class="site-container final-cta-inner">
            <h2 class="final-cta-headline">Interact with All 5 Modules in the Console</h2>
            <p class="final-cta-subtext">
              Test live telemetry ingest, evaluate rules in real time, advance Kanban deals, and test cryptographic envelope encryption in ZexCore Control.
            </p>
            <div class="final-cta-buttons">
              <a href="#/console" class="btn btn-primary btn-lg">
                Launch Control Console &rarr;
              </a>
              <a href="#/docs" class="btn btn-secondary btn-lg">
                View Developer API Docs
              </a>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
