/**
 * ZexCore Platform & Capabilities Page
 * Complete Technical Deep Dive into the 8 Core Pillars
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
          <div class="site-container">
            <div class="page-intro-header">
              <div class="section-eyebrow">THE OPERATING SYSTEM FOR VERTICAL SAAS</div>
              <h1 class="page-intro-title">Complete Platform Architecture</h1>
              <p class="page-intro-desc">
                ZexCore provides eight foundational infrastructure engines. Each subsystem is engineered for strict multi-tenancy, predictable latency, and zero cross-tenant contamination.
              </p>
            </div>
          </div>
        </section>

        <!-- Hero Photo & Specs Split -->
        <section class="section-gray section-padded">
          <div class="site-container split-feature-row">
            <div class="split-col-text">
              <div class="cap-badge">ENGINEERING DISCIPLINE</div>
              <h2 class="split-heading">Engineered as Shared Infrastructure, Not a Monolith</h2>
              <p class="split-p">
                Most vertical SaaS startups begin by hardcoding tenant boundaries into standard ORMs, inevitably suffering data leaks, schema migration lock-in, and fragile permission checks.
              </p>
              <p class="split-p">
                ZexCore separates the runtime into a micro-kernel with well-defined lifecycle contracts. The core handles tenancy, authorization, dynamic fields, events, and audit logs. All domain capabilities live in standalone workspace modules.
              </p>
              <div class="spec-list-block">
                <div class="spec-row">
                  <span class="spec-label">Runtime Engine:</span>
                  <span class="spec-val">Node.js 22 LTS / Fastify 5</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Database Layer:</span>
                  <span class="spec-val">PostgreSQL 17 Native RLS + Drizzle ORM</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Context Propagation:</span>
                  <span class="spec-val">AsyncLocalStorage (Zero Thread Bleed)</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Cryptography:</span>
                  <span class="spec-val">AES-256-GCM + HMAC-SHA256 Blind Index</span>
                </div>
              </div>
            </div>
            <div class="split-col-visual">
              <div class="framed-photo-box">
                <img
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80"
                  alt="Enterprise data center server racks running multi-tenant backend"
                  class="framed-photo"
                  loading="lazy"
                />
                <div class="photo-caption-bar">
                  <span>Multi-Tenant Cluster Node &mdash; US-East Primary</span>
                  <span class="status-indicator-dot"></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── THE 8 PILLARS DETAIL ──────────────────────────────────────── -->
        <section class="section-white section-padded">
          <div class="site-container">
            <div class="section-header-block">
              <div class="section-eyebrow">CORE CAPABILITIES</div>
              <h2 class="section-title">The Eight Foundational Pillars</h2>
              <p class="section-desc">
                Every vertical application built on ZexCore inherits these eight systems without requiring bespoke implementation or maintenance.
              </p>
            </div>

            <div class="pillars-deep-grid">
              <!-- Pillar 1: Identity & Access -->
              <div class="pillar-card" id="identity">
                <div class="pillar-num">01</div>
                <h3 class="pillar-title">Identity &amp; Capability-Based RBAC</h3>
                <p class="pillar-desc">
                  Authentication resolves Bearer JWT tokens to a verified <code>User</code> and active tenant <code>Membership</code>. Authorization checks capabilities (e.g. <code>records:create</code>, <code>iot:control</code>) rather than coarse static roles, enabling dynamic tenant-level permission customization.
                </p>
                <div class="pillar-code-snippet">
                  <code>user.hasCapability('iot:devices:write') &rarr; boolean</code>
                </div>
              </div>

              <!-- Pillar 2: Multi-Tenant Isolation -->
              <div class="pillar-card" id="tenancy">
                <div class="pillar-num">02</div>
                <h3 class="pillar-title">Database-Enforced Tenant Isolation</h3>
                <p class="pillar-desc">
                  Tenancy is resolved at the edge via subdomain or <code>X-Tenant-ID</code>. The database session executes <code>SET LOCAL app.current_tenant_id</code> inside every transaction. All tables enforce composite keys <code>(tenant_id, id)</code> and composite foreign keys with cascade constraints.
                </p>
                <div class="pillar-code-snippet">
                  <code>SET LOCAL app.current_tenant_id = :id</code>
                </div>
              </div>

              <!-- Pillar 3: Dynamic Data Engine -->
              <div class="pillar-card" id="data">
                <div class="pillar-num">03</div>
                <h3 class="pillar-title">Dynamic Data &amp; Field Engine</h3>
                <p class="pillar-desc">
                  Custom fields and domain entities are declared per tenant without altering the relational schema. JSONB payload validation utilizes strict JSON Schema definitions, ensuring type safety while enabling tenant-specific customizations.
                </p>
                <div class="pillar-code-snippet">
                  <code>validateSchema(tenantCustomFields, inputPayload)</code>
                </div>
              </div>

              <!-- Pillar 4: EventBus Messaging -->
              <div class="pillar-card" id="events">
                <div class="pillar-num">04</div>
                <h3 class="pillar-title">Core EventBus &amp; Messaging</h3>
                <p class="pillar-desc">
                  An in-process asynchronous publish-subscribe message broker connects modules. Events (e.g. <code>iot.telemetry.received</code>, <code>crm.lead.created</code>) trigger rule evaluations, webhook dispatches, and audit writes without tight coupling.
                </p>
                <div class="pillar-code-snippet">
                  <code>eventBus.publish('iot.alert.triggered', payload)</code>
                </div>
              </div>

              <!-- Pillar 5: Rules & Automation -->
              <div class="pillar-card" id="rules">
                <div class="pillar-num">05</div>
                <h3 class="pillar-title">Deterministic AST Rules Evaluator</h3>
                <p class="pillar-desc">
                  Business automation is processed through an Abstract Syntax Tree interpreter. Strict guardrails prohibit arbitrary JavaScript execution (zero <code>eval</code>, zero <code>new Function</code>). Bounded by a 10,000 instruction limit and 50ms timeout.
                </p>
                <div class="pillar-code-snippet">
                  <code>evaluateAST(conditions, context, { maxSteps: 10000 })</code>
                </div>
              </div>

              <!-- Pillar 6: Audit & Compliance -->
              <div class="pillar-card" id="audit">
                <div class="pillar-num">06</div>
                <h3 class="pillar-title">Append-Only Cryptographic Audit Trail</h3>
                <p class="pillar-desc">
                  State mutations generate SHA-256 hash-chained audit log records. Database privileges explicitly revoke <code>UPDATE</code> and <code>DELETE</code> permissions on audit tables, providing mathematically verifiable non-repudiation.
                </p>
                <div class="pillar-code-snippet">
                  <code>hash = SHA256(prevHash + tenantId + mutation)</code>
                </div>
              </div>

              <!-- Pillar 7: Module System -->
              <div class="pillar-card" id="modules">
                <div class="pillar-num">07</div>
                <h3 class="pillar-title">Isolated Plugin &amp; Module Lifecycle</h3>
                <p class="pillar-desc">
                  Modules implement a formal <code>ModuleDefinition</code> contract with <code>register()</code> and <code>boot()</code> hooks. Modules register database tables, REST routes, event listeners, and capabilities without accessing sibling module internals.
                </p>
                <div class="pillar-code-snippet">
                  <code>interface ModuleDefinition { id; register(); boot(); }</code>
                </div>
              </div>

              <!-- Pillar 8: Industry Configuration Packs -->
              <div class="pillar-card" id="packs">
                <div class="pillar-num">08</div>
                <h3 class="pillar-title">Zero-Code Industry Packs</h3>
                <p class="pillar-desc">
                  Vertical domain packs (e.g. <code>packs/industrial-iot</code>, <code>packs/logistics-fleet</code>) are declarative configuration manifests. They configure schemas, validation rules, and automation workflows without rebuilding the underlying core binary.
                </p>
                <div class="pillar-code-snippet">
                  <code>packs/industrial-iot/manifest.json</code>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Technical Specification Table -->
        <section class="section-gray section-padded">
          <div class="site-container">
            <div class="section-header-block">
              <div class="section-eyebrow">TECHNICAL BENCHMARKS</div>
              <h2 class="section-title">Architectural Invariants &amp; Limits</h2>
              <p class="section-desc">
                Measured operational limits enforcing predictability across multi-tenant workloads.
              </p>
            </div>

            <div class="table-container-card">
              <table class="spec-data-table">
                <thead>
                  <tr>
                    <th>Subsystem</th>
                    <th>Mechanism</th>
                    <th>Runtime Constraint</th>
                    <th>Security Guarantee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Tenant Isolation</strong></td>
                    <td>Postgres 17 RLS Policies</td>
                    <td>Session-scoped connection variable</td>
                    <td>Zero cross-tenant SQL access; composite FKs</td>
                  </tr>
                  <tr>
                    <td><strong>Rules Engine</strong></td>
                    <td>Safe AST Interpreter</td>
                    <td>Max 10,000 steps; 50ms timeout</td>
                    <td>Zero eval; no denial-of-service loops</td>
                  </tr>
                  <tr>
                    <td><strong>Device Ingestion</strong></td>
                    <td>Token-authenticated HTTP/WS</td>
                    <td>SHA-256 token hashing</td>
                    <td>Rate-limited per-device secret tokens</td>
                  </tr>
                  <tr>
                    <td><strong>Audit Logging</strong></td>
                    <td>Cryptographic Hash Chain</td>
                    <td>Append-only storage</td>
                    <td>REVOKE UPDATE/DELETE; tamper-evident</td>
                  </tr>
                  <tr>
                    <td><strong>Data Vault</strong></td>
                    <td>AES-256-GCM Envelope</td>
                    <td>Tenant-unique data encryption keys</td>
                    <td>Encrypted at rest; blind index searching</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="arch-cta-center">
              <a href="#/console" class="btn btn-primary btn-lg">
                Experience Platform Capabilities in Control Console &rarr;
              </a>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
