/**
 * ZexCore Developer Documentation Page
 * Structured Technical Guide with Sidebar Navigation & Copyable Code Blocks
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export function renderDocsPage(): string {
  return `
    <div class="page-wrapper">
      ${renderNavbar('docs')}

      <main>
        <!-- Page Header -->
        <section class="section-white page-intro-section" style="padding-bottom: 30px;">
          <div class="site-container">
            <div class="page-intro-header">
              <div class="section-eyebrow">DEVELOPER DOCUMENTATION</div>
              <h1 class="page-intro-title">ZexCore Engineering Reference</h1>
              <p class="page-intro-desc">
                Comprehensive technical guides, API contracts, database invariants, and SDK usage patterns for building vertical SaaS on ZexCore.
              </p>
            </div>
          </div>
        </section>

        <!-- Docs Layout with Sticky Sidebar -->
        <section class="section-gray" style="padding: 40px 0 80px 0;">
          <div class="site-container docs-container-layout">
            <!-- Sidebar -->
            <aside class="docs-sidebar">
              <div class="docs-sidebar-section">
                <div class="docs-nav-heading">Getting Started</div>
                <ul class="docs-nav-list">
                  <li><a href="#section-overview" class="docs-link active">Architecture Overview</a></li>
                  <li><a href="#section-tenancy" class="docs-link">Tenancy Resolution</a></li>
                  <li><a href="#section-rls" class="docs-link">Row-Level Security</a></li>
                </ul>
              </div>

              <div class="docs-sidebar-section">
                <div class="docs-nav-heading">Platform Systems</div>
                <ul class="docs-nav-list">
                  <li><a href="#section-events" class="docs-link">Core EventBus Broker</a></li>
                  <li><a href="#section-rules" class="docs-link">Deterministic AST Rules</a></li>
                  <li><a href="#section-iot" class="docs-link">IoT Ingest &amp; Tokens</a></li>
                  <li><a href="#section-crypto" class="docs-link">Cryptographic Vault</a></li>
                  <li><a href="#section-module-contract" class="docs-link">Module Lifecycle Contract</a></li>
                </ul>
              </div>

              <div class="docs-sidebar-section">
                <div class="docs-nav-heading">Console &amp; Tools</div>
                <ul class="docs-nav-list">
                  <li><a href="#/console" class="docs-link">Control Console</a></li>
                  <li><a href="#/signin" class="docs-link">Workspace Access</a></li>
                </ul>
              </div>
            </aside>

            <!-- Main Docs Content Area -->
            <div class="docs-content-area">
              <!-- Section 1: Overview -->
              <article class="doc-article-card" id="section-overview">
                <div class="doc-badge">SECTION 1</div>
                <h2 class="doc-title">System Overview &amp; Monorepo Topology</h2>
                <p class="doc-paragraph">
                  ZexCore is engineered as an enterprise-grade monorepo managed with <code>pnpm</code> and TypeScript. All packages declare explicit export maps and are isolated by strict dependency rules.
                </p>

                <h4 class="doc-subhead">Workspace Package Structure</h4>
                <div class="code-editor-card">
                  <div class="code-editor-title">pnpm-workspace.yaml</div>
                  <pre class="code-pre"><code>packages/
  core/                  # @zexcore/core (Tenancy, RBAC, DB RLS, EventBus, Audit)
  module-iot/            # @zexcore/module-iot (Fleet management, telemetry, commands)
  rules/                 # @zexcore/rules (Safe AST interpreter, Gemini AI author)
  module-crm/            # @zexcore/module-crm (Leads, contacts, stages, multi-currency)
  compliance/            # @zexcore/compliance (AES-256-GCM vault, blind index, GDPR erasure)
apps/
  api/                   # Fastify HTTP server bootstrapping registered modules
  dashboard/             # Production red & white enterprise control plane</code></pre>
                </div>
              </article>

              <!-- Section 2: Tenancy -->
              <article class="doc-article-card" id="section-tenancy">
                <div class="doc-badge">SECTION 2</div>
                <h2 class="doc-title">Tenancy Resolution &amp; AsyncLocalStorage</h2>
                <p class="doc-paragraph">
                  Tenant identification occurs on every incoming request. The resolved tenant context is bound to Node.js <code>AsyncLocalStorage</code>, guaranteeing that concurrent requests cannot accidentally bleed context.
                </p>

                <h4 class="doc-subhead">Context Binding Middleware</h4>
                <div class="code-editor-card">
                  <div class="code-editor-title">packages/core/src/tenancy/context.ts</div>
                  <pre class="code-pre"><code>import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  tier: 'starter' | 'pro' | 'enterprise';
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function getTenantContext(): TenantContext {
  const ctx = tenantStorage.getStore();
  if (!ctx) throw new Error('Operation attempted outside TenantContext scope');
  return ctx;
}</code></pre>
                </div>
              </article>

              <!-- Section 3: RLS -->
              <article class="doc-article-card" id="section-rls">
                <div class="doc-badge">SECTION 3</div>
                <h2 class="doc-title">PostgreSQL Row-Level Security Execution</h2>
                <p class="doc-paragraph">
                  All queries to tenant-scoped tables execute inside a transactional wrapper that sets the local session variable. The PostgreSQL query planner automatically appends the RLS predicate to all sequential and index scans.
                </p>

                <div class="code-editor-card">
                  <div class="code-editor-title">packages/core/src/db/tenant-executor.ts</div>
                  <pre class="code-pre"><code>export async function withTenantDb<T>(
  tenantId: string,
  fn: (tx: DatabaseTransaction) => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    // Lock Postgres session to current tenant
    await tx.execute(sql\`SET LOCAL app.current_tenant_id = \${tenantId}\`);
    return await fn(tx);
  });
}</code></pre>
                </div>
              </article>

              <!-- Section 4: EventBus -->
              <article class="doc-article-card" id="section-events">
                <div class="doc-badge">SECTION 4</div>
                <h2 class="doc-title">Core EventBus Broker API</h2>
                <p class="doc-paragraph">
                  The EventBus allows asynchronous messaging between decoupled domain modules without cross-importing dependencies.
                </p>

                <div class="code-editor-card">
                  <div class="code-editor-title">EventBus Ingest &amp; Subscription</div>
                  <pre class="code-pre"><code>// Publishing an event from IoT Gateway
await eventBus.publish({
  tenantId: ctx.tenantId,
  topic: 'iot.telemetry.received',
  payload: {
    deviceId: 'dev-1',
    metrics: { temperature: 79.4, humidity: 55 }
  }
});

// Subscribing in Rules Engine
eventBus.subscribe('iot.telemetry.received', async (event) => {
  await rulesEngine.evaluateTrigger(event.topic, event.payload);
});</code></pre>
                </div>
              </article>

              <!-- Section 5: Rules AST -->
              <article class="doc-article-card" id="section-rules">
                <div class="doc-badge">SECTION 5</div>
                <h2 class="doc-title">Deterministic AST Rules Specification</h2>
                <p class="doc-paragraph">
                  Rules conditions are expressed as an Abstract Syntax Tree. The evaluator rejects any syntax that could evaluate arbitrary code.
                </p>

                <div class="code-editor-card">
                  <div class="code-editor-title">AST JSON Structure Example</div>
                  <pre class="code-pre"><code>{
  "type": "BinaryExpression",
  "operator": ">",
  "left": {
    "type": "Identifier",
    "name": "metrics.temperature"
  },
  "right": {
    "type": "Literal",
    "value": 75
  }
}</code></pre>
                </div>
              </article>

              <!-- Section 6: IoT Ingest -->
              <article class="doc-article-card" id="section-iot">
                <div class="doc-badge">SECTION 6</div>
                <h2 class="doc-title">IoT Telemetry Ingestion via Tokens</h2>
                <p class="doc-paragraph">
                  Edge devices authenticate using high-entropy single-use tokens provided in the <code>X-Device-Token</code> header. The server compares SHA-256 hashes against stored device keys.
                </p>

                <div class="code-editor-card">
                  <div class="code-editor-title">curl Device Ingestion Example</div>
                  <pre class="code-pre"><code>curl -X POST https://api.zexcore.io/api/iot/telemetry \\
  -H "Content-Type: application/json" \\
  -H "X-Device-Token: zex_dev_982bf7a3c1094e82" \\
  -d '{
    "deviceKey": "iot_temp_sensor_01",
    "temperature": 24.8,
    "humidity": 54,
    "voltage": 3.3
  }'</code></pre>
                </div>
              </article>

              <!-- Section 7: Cryptographic Vault -->
              <article class="doc-article-card" id="section-crypto">
                <div class="doc-badge">SECTION 7</div>
                <h2 class="doc-title">AES-256-GCM Envelope Encryption &amp; Blind Index</h2>
                <p class="doc-paragraph">
                  Customer records are protected using per-tenant encryption keys. Deterministic blind indexing allows searching encrypted fields without decrypting table rows.
                </p>

                <div class="code-editor-card">
                  <div class="code-editor-title">Ciphertext Storage Format</div>
                  <pre class="code-pre"><code>// Envelope ciphertext format:
enc:v1:<12_byte_hex_iv>:<16_byte_hex_auth_tag>:<hex_ciphertext>

// Blind index format (HMAC-SHA256 with tenant blind secret):
blind:<64_character_hex_hash></code></pre>
                </div>
              </article>

              <!-- Section 8: Module Lifecycle -->
              <article class="doc-article-card" id="section-module-contract">
                <div class="doc-badge">SECTION 8</div>
                <h2 class="doc-title">Formal Module Contract (ModuleDefinition)</h2>
                <p class="doc-paragraph">
                  All standalone workspace modules must implement the formal <code>ModuleDefinition</code> interface to be recognized by <code>apps/api/src/bootstrap.ts</code>.
                </p>

                <div class="code-editor-card">
                  <div class="code-editor-title">packages/core/src/modules/types.ts</div>
                  <pre class="code-pre"><code>export interface ModuleDefinition {
  id: string;
  name: string;
  version: string;
  dependencies?: string[];
  register: (app: FastifyInstance, ctx: CoreContext) => Promise<void>;
  boot?: (ctx: CoreContext) => Promise<void>;
}</code></pre>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
