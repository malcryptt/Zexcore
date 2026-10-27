/**
 * ZexCore Developer Documentation Page
 * Matches user prompt specifications:
 * - Persistent left sidebar with all 5 required categories
 * - Interactive Searchable documentation index that filters articles in real-time
 * - Full interactive article viewer with Breadcrumbs, Copy-to-Clipboard buttons, Prev/Next controls
 * - Real, rich engineering articles with dark code panels and accurate codebase references
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export interface DocArticle {
  id: string;
  category: string;
  title: string;
  intro: string;
  contentHtml: string;
}

export const docArticles: Record<string, DocArticle> = {
  'what-is-zexcore': {
    id: 'what-is-zexcore',
    category: 'Getting Started',
    title: 'What ZexCore is All About',
    intro: 'The sovereign multi-tenant backend engine and operating system for vertical SaaS — why it exists, what it solves, and how it transforms industry software.',
    contentHtml: `
      <div class="doc-callout-box" style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #0f172a; padding: 20px; border-radius: 8px; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="background: #0f172a; color: #ffffff; font-size: 0.68rem; font-weight: 800; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.05em;">EXECUTIVE THESIS</span>
          <span style="font-size: 0.8rem; color: #64748b; font-weight: 700; letter-spacing: 0.03em;">ONE CORE. INFINITE POSSIBILITIES.</span>
        </div>
        <p style="margin: 0; color: #334155; font-size: 0.95rem; line-height: 1.65;">
          <b>ZexCore is the operating system for vertical SaaS.</b> Instead of spending 12 to 18 months re-inventing multi-tenancy, cryptographic vaults, IoT telemetry queues, deterministic business rules, and sales pipeline mechanics, founders and enterprise teams build their entire vertical software stack on top of a single, kernel-isolated engine.
        </p>
      </div>

      <h3 class="doc-subhead" style="font-size: 1.3rem; margin-top: 32px;">1. The Problem: The 18-Month Plumbing Trap</h3>
      <p>
        Building a specialized B2B vertical SaaS (whether for refrigerated freight, industrial robotics, commercial HVAC, or healthcare clinics) inevitably hits the exact same engineering bottleneck:
      </p>
      <ul class="bullet-feature-list" style="margin-bottom: 20px;">
        <li><b>Hard Data Isolation:</b> Ensuring Customer A can never see Customer B's records, even if an engineer writes an unoptimized query.</li>
        <li><b>Deterministic Business Automation:</b> Letting businesses write custom triggers, alerts, and state machines without risking arbitrary code execution.</li>
        <li><b>Cryptographic Privacy &amp; Compliance:</b> Encrypting sensitive PII at rest with envelope encryption while retaining the operational ability to search records.</li>
        <li><b>Device Telemetry:</b> Ingesting high-frequency IoT sensor data from physical machinery securely.</li>
        <li><b>Commercial Operations:</b> Tracking leads, pipeline stages, contracts, and customer lifecycle data.</li>
      </ul>
      <p>
        Most startups attempt to solve this with application-layer code decorators (<code>WHERE tenant_id = x</code>). Inevitably, one missed WHERE clause in a reporting query or background job introduces catastrophic cross-tenant data leakage. ZexCore eliminates this failure mode permanently.
      </p>

      <h3 class="doc-subhead" style="font-size: 1.3rem; margin-top: 36px;">2. The 6 Pillars of ZexCore</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 24px 0;">
        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e50920" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div style="font-weight: 700; color: #0f172a; font-size: 1rem; margin-bottom: 6px;">1. Kernel-Enforced Tenancy</div>
          <p style="font-size: 0.86rem; color: #64748b; line-height: 1.55; margin: 0;">
            Database-level PostgreSQL 17 <code>FORCE ROW LEVEL SECURITY</code>. Isolation is mathematically enforced by the database session within transactions, eliminating reliance on developer discipline.
          </p>
        </div>

        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e50920" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div style="font-weight: 700; color: #0f172a; font-size: 1rem; margin-bottom: 6px;">2. Deterministic AST Rules Engine</div>
          <p style="font-size: 0.86rem; color: #64748b; line-height: 1.55; margin: 0;">
            Sub-millisecond condition evaluations using safe Abstract Syntax Tree graphs. Zero <code>eval()</code>, prototype pollution guards, and hard ReDoS timeouts.
          </p>
        </div>

        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e50920" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div style="font-weight: 700; color: #0f172a; font-size: 1rem; margin-bottom: 6px;">3. Cryptographic Privacy Vault</div>
          <p style="font-size: 0.86rem; color: #64748b; line-height: 1.55; margin: 0;">
            Authenticated AES-256-GCM envelope encryption with unique random IVs, HMAC-SHA256 tenant subkeys, and blind indexing for searchable encrypted fields.
          </p>
        </div>

        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e50920" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="2"/>
              <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
            </svg>
          </div>
          <div style="font-weight: 700; color: #0f172a; font-size: 1rem; margin-bottom: 6px;">4. Edge &amp; Fleet IoT Hub</div>
          <p style="font-size: 0.86rem; color: #64748b; line-height: 1.55; margin: 0;">
            Hardware authentication via SHA-256 device tokens, high-throughput burst rate limits (5,000 req/min), timeseries telemetry, and automated incident alarms.
          </p>
        </div>

        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e50920" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div style="font-weight: 700; color: #0f172a; font-size: 1rem; margin-bottom: 6px;">5. Built-In CRM Pipeline</div>
          <p style="font-size: 0.86rem; color: #64748b; line-height: 1.55; margin: 0;">
            Multi-stage deal flow, contact relationship management, composite-key invariants, and automated quotation dispatching.
          </p>
        </div>

        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
          <div style="width: 38px; height: 38px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e50920" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
          <div style="font-weight: 700; color: #0f172a; font-size: 1rem; margin-bottom: 6px;">6. "Great First 10 Minutes"</div>
          <p style="font-size: 0.86rem; color: #64748b; line-height: 1.55; margin: 0;">
            A business owner signs up, answers one question ("What do you do?"), and instantly receives a working, good-looking niche site, sample listings, an inquiry form, and instant automated follow-up.
          </p>
        </div>
      </div>

      <h3 class="doc-subhead" style="font-size: 1.3rem; margin-top: 36px;">3. Who Is ZexCore Built For?</h3>
      <ul class="bullet-feature-list" style="margin-bottom: 24px;">
        <li><b>Vertical SaaS Founders:</b> Launch enterprise-ready software for specific industries (HVAC, cold chain, maritime, clinics, fleet) in 10 minutes instead of two years.</li>
        <li><b>Enterprise Architects &amp; CTOs:</b> Deploy sovereign backend infrastructure that complies with strict data residency, HIPAA, and GDPR regulations.</li>
        <li><b>Industrial &amp; Logistics Companies:</b> Connect edge telemetry nodes directly to billing, alerts, and customer self-service portals.</li>
      </ul>

      <h3 class="doc-subhead" style="font-size: 1.3rem; margin-top: 36px;">4. Architectural Workflow</h3>
      <div class="doc-code-card">
        <div class="doc-code-header">
          <span class="doc-code-lang">REQUEST LIFECYCLE</span>
        </div>
        <pre><code>[1] Client Request: POST /api/crm/leads (Authorization: Bearer &lt;JWT&gt;)
    ↓
[2] Fastify Tenancy &amp; Anti-Spoofing:
    - Validates JWT signature
    - Strictly binds tenantId to token claims (rejects foreign x-tenant-id)
    - Enforces rate limiting (120 req/min general, 5,000 req/min IoT)
    ↓
[3] PostgreSQL Database Transaction:
    - Executes: SELECT set_config('app.current_tenant_id', 'uuid', true)
    - FORCE ROW LEVEL SECURITY ensures only tenant rows are accessible
    ↓
[4] Deterministic EventBus:
    - Emits: crm.lead.created
    - RuleRunner executes AST rules in &lt;1ms
    - Action: Dispatches automated WhatsApp/SMS lead acknowledgement</code></pre>
      </div>
    `
  },
  'arch-overview': {
    id: 'arch-overview',
    category: 'Getting Started',
    title: 'Architecture Overview',
    intro: 'ZexCore is engineered as a multi-tenant backend engine and operating system for vertical SaaS applications.',
    contentHtml: `
      <p>The platform separates domain business logic from foundational infrastructure through a four-tier architecture:</p>
      
      <div class="docs-diagram-card" style="margin: 20px 0;">
        <div class="docs-diagram-layer layer-apps">
          <div class="docs-layer-title">Tier 4 — Tenant Applications</div>
          <div class="docs-layer-pills">
            <span class="docs-pill">Web Apps</span>
            <span class="docs-pill">Mobile Apps</span>
            <span class="docs-pill">Admin Console</span>
            <span class="docs-pill">API Clients</span>
          </div>
        </div>
        <div class="docs-diagram-layer layer-packs">
          <div class="docs-layer-title">Tier 3 — Industry Configuration Packs</div>
          <div class="docs-layer-subtitle">packs/industrial-iot · packs/enterprise-crm</div>
        </div>
        <div class="docs-diagram-layer layer-modules">
          <div class="docs-layer-title">Tier 2 — Reusable Domain Modules</div>
          <div class="docs-layer-pills">
            <span class="docs-pill">@zexcore/module-iot</span>
            <span class="docs-pill">@zexcore/rules</span>
            <span class="docs-pill">@zexcore/module-crm</span>
            <span class="docs-pill">@zexcore/compliance</span>
          </div>
        </div>
        <div class="docs-diagram-layer layer-core">
          <div class="docs-layer-title">Tier 1 — ZexCore Core Infrastructure (@zexcore/core)</div>
          <div class="docs-layer-subtitle">Tenancy · RBAC · Core EventBus · Audit Ledger</div>
        </div>
        <div class="docs-diagram-layer layer-db">
          <div class="docs-layer-title">Foundation — PostgreSQL 17 &amp; Security Layer</div>
          <div class="docs-layer-subtitle">FORCE ROW LEVEL SECURITY · AES-256-GCM Vault</div>
        </div>
      </div>

      <h4 class="doc-subhead">Allowed Dependency Direction</h4>
      <p>Dependencies flow strictly downward. Tenant applications depend on Industry Packs; Industry Packs compose Reusable Modules; all Modules depend exclusively on <code>@zexcore/core</code>. Modules are strictly prohibited from circular dependencies.</p>
    `
  },
  'install': {
    id: 'install',
    category: 'Getting Started',
    title: 'Platform Deployment & Access',
    intro: 'Deploy and access ZexCore via Cloud SaaS or Enterprise Dedicated Self-Hosted Containers.',
    contentHtml: `
      <!-- Track 1: Cloud SaaS -->
      <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 22px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #16a34a;"></span>
            <strong style="font-size: 1.05rem; color: #0f172a;">Track 1: Managed Cloud SaaS (Recommended)</strong>
          </div>
          <span style="font-size: 0.72rem; font-weight: 700; color: #E50920; background: #FEF2F2; padding: 3px 8px; border-radius: 4px;">NO INSTALLATION REQUIRED</span>
        </div>
        <p style="font-size: 0.88rem; color: #475569; margin-bottom: 14px;">
          For startups, clinics, digital agencies, and e-commerce merchants. High-availability cloud infrastructure, Postgres 17 tenant isolation, managed SSL, and automatic backups are fully provisioned out of the box.
        </p>
        <div style="display: flex; gap: 10px; align-items: center;">
          <a href="#/console/overview" class="btn btn-primary btn-sm" style="font-weight: 700;">Launch Cloud Console &rarr;</a>
          <a href="#/pricing" class="btn btn-secondary btn-sm">View Pricing Tiers</a>
        </div>
      </div>

      <!-- Track 2: Enterprise Dedicated Self-Hosted -->
      <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #0284c7;"></span>
            <strong style="font-size: 1.05rem; color: #0f172a;">Track 2: Enterprise Dedicated Self-Hosted</strong>
          </div>
          <span style="font-size: 0.72rem; font-weight: 700; color: #0284c7; background: #E0F2FE; padding: 3px 8px; border-radius: 4px;">DEDICATED TIER ($1,500/mo)</span>
        </div>
        <p style="font-size: 0.88rem; color: #475569; margin-bottom: 16px;">
          Deploy hardened ZexCore container instances inside your private VPC (AWS, Azure, GCP) or on-premise hardware to comply with strict NDPR, HIPAA, and banking data-residency mandates.
        </p>

        <h4 class="doc-subhead" style="font-size: 0.85rem; margin-bottom: 8px;">1. Pull Secure Enterprise Image</h4>
        <div class="code-editor-card" style="margin-bottom: 16px;">
          <div class="code-editor-title">terminal</div>
          <pre class="code-pre"><code># Authenticate against private enterprise registry
docker pull registry.zexcore.io/enterprise/core:v1.4-hardened</code></pre>
        </div>

        <h4 class="doc-subhead" style="font-size: 0.85rem; margin-bottom: 8px;">2. Bootstrap Dedicated Cluster with Signed License</h4>
        <div class="code-editor-card">
          <div class="code-editor-title">docker-compose.enterprise.yml</div>
          <pre class="code-pre"><code>version: '3.9'
services:
  zexcore-node:
    image: registry.zexcore.io/enterprise/core:v1.4-hardened
    environment:
      - ZEXCORE_LICENSE_KEY=ZEX-ENT-XXXX-XXXX-XXXX
      - DATABASE_URL=postgresql://zexcore_app:secret@db:5432/zexcore_prod
      - ENCRYPTION_ROOT_KEY_ROTATION_VAULT=file:///vault/keys/aes256.master
      - CRYPTO_HEARTBEAT_ENDPOINT=https://api.zexcore.com/v1/license/heartbeat
    ports:
      - "443:443"</code></pre>
        </div>
      </div>
    `
  },
  'tenancy': {
    id: 'tenancy',
    category: 'Getting Started',
    title: 'Tenant Resolution',
    intro: 'Every request and worker job is isolated using Node.js AsyncLocalStorage to prevent thread bleed.',
    contentHtml: `
      <p>ZexCore resolves the tenant identifier via incoming request headers (<code>x-tenant-id</code>) or virtual subdomains. The resolved context is stored in <code>AsyncLocalStorage</code> for the entire lifecycle of the request:</p>
      
      <div class="code-editor-card">
        <div class="code-editor-title">packages/core/src/tenancy/context.ts</div>
        <pre class="code-pre"><code>import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  tier: 'starter' | 'growth' | 'enterprise';
}

export const tenantStorage = new AsyncLocalStorage&lt;TenantContext&gt;();

export function getTenantContext(): TenantContext {
  const ctx = tenantStorage.getStore();
  if (!ctx) throw new Error('Operation attempted outside TenantContext scope');
  return ctx;
}</code></pre>
      </div>
    `
  },
  'auth': {
    id: 'auth',
    category: 'Getting Started',
    title: 'Authentication & Session Handling',
    intro: 'Stateless JWT authentication combined with tenant membership validation and role verification.',
    contentHtml: `
      <p>Users authenticate using email and password via <code>POST /api/auth/login</code>. Tokens contain user claims and tenant assignments:</p>
      <div class="code-editor-card">
        <div class="code-editor-title">packages/core/src/auth/jwt.ts</div>
        <pre class="code-pre"><code>export interface AuthClaims {
  sub: string;         // User UUID
  email: string;
  tenantId: string;    // Active tenant UUID
  role: 'owner' | 'admin' | 'operator' | 'viewer';
}</code></pre>
      </div>
      <p>On every protected route, the Fastify authentication hook validates the token signature, checks tenant membership in the database, and hydrates the <code>TenantContext</code>.</p>
    `
  },
  'eventbus': {
    id: 'eventbus',
    category: 'Platform Systems',
    title: 'Core EventBus Broker',
    intro: 'Asynchronous event mesh connecting domain modules without tight compile-time coupling.',
    contentHtml: `
      <p>The EventBus enables domain events to trigger workflows across modules (e.g., IoT threshold breach triggering a CRM opportunity creation):</p>
      <div class="code-editor-card">
        <div class="code-editor-title">EventBus Ingest &amp; Subscription</div>
        <pre class="code-pre"><code>// Publishing an event from IoT Gateway
await eventBus.publish({
  tenantId: ctx.tenantId,
  topic: 'iot.telemetry.received',
  payload: { deviceId: 'dev-1', temperature: 82.4 }
});

// Subscribing in Rules Engine
eventBus.subscribe('iot.telemetry.received', async (event) => {
  await rulesEngine.evaluate(event.tenantId, event.payload);
});</code></pre>
      </div>
    `
  },
  'rules': {
    id: 'rules',
    category: 'Platform Systems',
    title: 'Deterministic Rules Engine',
    intro: 'Abstract Syntax Tree (AST) safe rule evaluator with zero eval and strict instruction bounds.',
    contentHtml: `
      <p>Tenant formulas execute through a sandboxed AST interpreter with strict safety invariants:</p>
      <ul class="bullet-feature-list">
        <li><strong>Zero JavaScript eval:</strong> Expressions are parsed into an AST and interpreted safely.</li>
        <li><strong>Instruction Ceiling:</strong> Capped at 10,000 operations to prevent infinite loops.</li>
        <li><strong>50ms Timeout:</strong> Execution aborts if timeout is exceeded.</li>
      </ul>
      <div class="code-editor-card">
        <div class="code-editor-title">packages/rules/src/engine.ts</div>
        <pre class="code-pre"><code>export async function evaluateRule(
  rule: RuleDefinition,
  context: Record&lt;string, unknown&gt;
): Promise&lt;boolean&gt; {
  const ast = parseExpression(rule.conditions);
  return interpretAst(ast, context, { maxSteps: 10000 });
}</code></pre>
      </div>
    `
  },
  'iot': {
    id: 'iot',
    category: 'Platform Systems',
    title: 'IoT Ingest & Device Tokens',
    intro: 'High-throughput edge sensor ingestion authenticated via cryptographic X-Device-Token headers.',
    contentHtml: `
      <p>Devices authenticate using hashed device keys (SHA-256). Ingest endpoints accept batch time-series sensor data:</p>
      <div class="code-editor-card">
        <div class="code-editor-title">POST /api/iot/telemetry</div>
        <pre class="code-pre"><code>// Request Headers:
X-Device-Token: tok_edge_sensor_live_98a7bc
Content-Type: application/json

// Request Body:
{
  "metrics": {
    "temperature": 24.8,
    "humidity": 54,
    "voltage": 3.3
  },
  "timestamp": "2026-10-12T19:40:00Z"
}</code></pre>
      </div>
    `
  },
  'crm': {
    id: 'crm',
    category: 'Platform Systems',
    title: 'CRM Pipeline Engine',
    intro: 'Multi-currency deal tracking, stage transitions, and contact associations.',
    contentHtml: `
      <p>The CRM module manages sales pipelines partitioned per tenant. Opportunities support stage workflows: <code>New → Qualified → Proposal → Negotiation → Closed Won</code>.</p>
    `
  },
  'crypto': {
    id: 'crypto',
    category: 'Platform Systems',
    title: 'Cryptographic Privacy Vault',
    intro: 'AES-256-GCM envelope encryption and blind indexing safeguarding sensitive records.',
    contentHtml: `
      <p>Sensitive fields are encrypted using AES-256-GCM with tenant-unique Data Encryption Keys (DEKs). HMAC-SHA256 blind indexing allows exact-match lookups without decrypting entire tables:</p>
      <div class="code-editor-card">
        <div class="code-editor-title">packages/compliance/src/crypto/vault.ts</div>
        <pre class="code-pre"><code>export function encryptField(plaintext: string, dek: Buffer): EncryptedPayload {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext: ciphertext.toString('hex'), iv: iv.toString('hex'), tag: tag.toString('hex') };
}</code></pre>
      </div>
    `
  },
  'lifecycle': {
    id: 'lifecycle',
    category: 'Platform Systems',
    title: 'Module Lifecycle Contract',
    intro: 'Formal contract defining how modular npm packages bootstrap and integrate into ZexCore.',
    contentHtml: `
      <p>Every module implements <code>ZexCoreModuleDefinition</code>:</p>
      <div class="code-editor-card">
        <div class="code-editor-title">Module Contract Interface</div>
        <pre class="code-pre"><code>export interface ZexCoreModule {
  name: string;
  version: string;
  dependencies: string[];
  registerSchema(db: DrizzleDatabase): void;
  registerRoutes(app: FastifyInstance): void;
  registerEvents(bus: EventBus): void;
}</code></pre>
      </div>
    `
  },
  'audit-module': {
    id: 'audit-module',
    category: 'Platform Systems',
    title: 'Audit & Financial Health Engine',
    intro: 'Deterministic security posture screening, payment gateway reconciliation, and tamper-resistant evidence packs.',
    contentHtml: `
      <p>The <code>@zexcore/module-audit</code> package performs scheduled and on-demand verification of workspace security and ledger integrity with zero AI non-determinism:</p>
      <ul class="bullet-feature-list">
        <li><strong>Locked Baseline Rules:</strong> Enforces admin MFA, prohibits wildcard CORS (*), bans cumulative refunds exceeding charges, and verifies finalised ledger immutability.</li>
        <li><strong>Payment Reconciliation:</strong> Automatically matches Stripe, Paystack, and Flutterwave webhook settlements against issued invoices.</li>
        <li><strong>Trust Level Hierarchy:</strong> Categorizes transactions into <code>verified</code> (cryptographic webhook signature), <code>imported</code> (bank CSV/OFX statement), and <code>claimed</code> (unverified user receipt).</li>
        <li><strong>Dual-Approval Guardrail Loosening:</strong> Relaxing security thresholds requires second-operator authorization and fresh MFA proof.</li>
      </ul>
    `
  },
  'rls': {
    id: 'rls',
    category: 'Database & Security',
    title: 'PostgreSQL Row-Level Security',
    intro: 'Tenant isolation enforced directly inside the PostgreSQL 17 query engine.',
    contentHtml: `
      <p>PostgreSQL RLS ensures that application code cannot accidentally access cross-tenant data. Table owners and system functions are constrained by <code>FORCE ROW LEVEL SECURITY</code>:</p>
      <div class="code-editor-card">
        <div class="code-editor-title">Database RLS Policy</div>
        <pre class="code-pre"><code>ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON documents
  FOR ALL TO zexcore_app
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);</code></pre>
      </div>
    `
  },
  'isolation': {
    id: 'isolation',
    category: 'Database & Security',
    title: 'Tenant Isolation & Foreign Keys',
    intro: 'Composite primary and foreign keys preventing cross-tenant foreign key traversal.',
    contentHtml: `
      <p>Because foreign keys run outside PostgreSQL RLS, child tables enforce composite keys <code>(tenant_id, parent_id)</code> to ensure that Tenant A cannot reference Tenant B's primary keys.</p>
    `
  },
  'rbac': {
    id: 'rbac',
    category: 'Database & Security',
    title: 'Role-Based Access Control',
    intro: 'Granular permissions validated across four platform tiers: Owner, Admin, Operator, Viewer.',
    contentHtml: `
      <p>RBAC checks are enforced at both the API gateway and service layer using explicit capability bitmasks.</p>
    `
  },
  'audit': {
    id: 'audit',
    category: 'Database & Security',
    title: 'Immutable Audit Logging',
    intro: 'Cryptographically hash-chained append-only ledger for non-repudiation.',
    contentHtml: `
      <p>Every state mutation generates a SHA-256 hash chaining to the previous record. Database privileges revoke <code>UPDATE</code> and <code>DELETE</code> rights on the audit table from <code>zexcore_app</code>.</p>
    `
  },
  'api-auth': {
    id: 'api-auth',
    category: 'API Reference',
    title: 'Authentication Endpoints',
    intro: 'REST endpoints for session initiation, token refresh, and identity verification.',
    contentHtml: `
      <div class="code-editor-card">
        <div class="code-editor-title">POST /api/auth/login</div>
        <pre class="code-pre"><code>// Request:
{ "email": "admin@acme.com", "password": "secure_password" }

// Response (200 OK):
{ "token": "jwt_token_string", "tenantId": "acme_corp", "role": "admin" }</code></pre>
      </div>
    `
  },
  'api-tenants': {
    id: 'api-tenants',
    category: 'API Reference',
    title: 'Tenant Endpoints',
    intro: 'Tenant context discovery, member management, and workspace settings.',
    contentHtml: `
      <p>Endpoints: <code>GET /api/tenants/current</code>, <code>GET /api/tenants/:id/members</code>, <code>PATCH /api/tenants/:id</code>.</p>
    `
  },
  'api-iot': {
    id: 'api-iot',
    category: 'API Reference',
    title: 'IoT Endpoints',
    intro: 'Device registration, telemetry stream ingestion, and remote commands.',
    contentHtml: `
      <p>Endpoints: <code>POST /api/iot/telemetry</code>, <code>GET /api/iot/devices</code>, <code>POST /api/iot/devices/register</code>, <code>POST /api/iot/commands/send</code>.</p>
    `
  },
  'api-crm': {
    id: 'api-crm',
    category: 'API Reference',
    title: 'CRM Endpoints',
    intro: 'Lead capture, opportunity pipeline stages, and contact records.',
    contentHtml: `
      <p>Endpoints: <code>GET /api/crm/leads</code>, <code>POST /api/crm/opportunities</code>, <code>PATCH /api/crm/opportunities/:id/stage</code>.</p>
    `
  },
  'api-compliance': {
    id: 'api-compliance',
    category: 'API Reference',
    title: 'Compliance Endpoints',
    intro: 'Data encryption, consent ledger mutations, and GDPR Right-to-be-Forgotten pipelines.',
    contentHtml: `
      <p>Endpoints: <code>POST /api/compliance/encrypt</code>, <code>POST /api/compliance/erasure</code>, <code>GET /api/compliance/consent</code>.</p>
    `
  },
  'api-audit': {
    id: 'api-audit',
    category: 'API Reference',
    title: 'Audit & Reconciliation Endpoints',
    intro: 'REST endpoints for triggering security checks, inspecting findings, querying the ledger, and exporting signed evidence packs.',
    contentHtml: `
      <div class="code-editor-card">
        <div class="code-editor-title">POST /api/audit/check</div>
        <pre class="code-pre"><code>// Trigger on-demand posture analysis
POST /api/audit/check
Headers: { "Authorization": "Bearer <jwt>", "X-Tenant-ID": "acme_corp" }
Body: { "domain": "all", "dryRun": false }

// Response (200 OK):
{
  "runId": "run-8f92a10",
  "overallScore": 96,
  "securityScore": 94,
  "financeScore": 98,
  "findingsGenerated": 1,
  "durationMs": 42
}</code></pre>
      </div>
      <p>Other endpoints: <code>GET /api/audit/runs</code>, <code>GET /api/audit/findings</code>, <code>POST /api/audit/export</code>, <code>GET /api/audit/health</code>.</p>
    `
  },
  'tools-workspace': {
    id: 'tools-workspace',
    category: 'Developer Tools',
    title: 'Workspace Structure',
    intro: 'pnpm monorepo architecture and package manifest topology.',
    contentHtml: `
      <div class="code-editor-card">
        <div class="code-editor-title">pnpm-workspace.yaml</div>
        <pre class="code-pre"><code>packages:
  - "packages/core"           # @zexcore/core (Tenancy, RBAC, DB RLS, EventBus, Audit)
  - "packages/module-iot"     # @zexcore/module-iot (Fleet management, telemetry)
  - "packages/rules"          # @zexcore/rules (Safe AST interpreter, Gemini AI)
  - "packages/module-crm"     # @zexcore/module-crm (Leads, contacts, stages)
  - "packages/compliance"     # @zexcore/compliance (AES-256-GCM vault, GDPR erasure)
  - "packages/module-audit"    # @zexcore/module-audit (Deterministic posture & reconciliation)
apps:
  - "apps/api"                # Fastify HTTP server bootstrapping registered modules
  - "apps/dashboard"          # Red &amp; White enterprise control plane</code></pre>
      </div>
    `
  },
  'tools-config': {
    id: 'tools-config',
    category: 'Developer Tools',
    title: 'Environment Configuration',
    intro: 'Required environment variables for local development and production deployments.',
    contentHtml: `
      <div class="code-editor-card">
        <div class="code-editor-title">.env.example</div>
        <pre class="code-pre"><code>DATABASE_URL="postgresql://zexcore_app:secret@localhost:5432/zexcore_dev"
JWT_SECRET="super_secret_jwt_hmac_signing_key"
VAULT_MASTER_KEY="32_byte_hex_encoded_aes_256_master_key"
PORT=3000</code></pre>
      </div>
    `
  },
  'tools-testing': {
    id: 'tools-testing',
    category: 'Developer Tools',
    title: 'Testing & Verification',
    intro: 'Automated test suite verifying tenant isolation and module contracts.',
    contentHtml: `
      <div class="code-editor-card">
        <div class="code-editor-title">terminal</div>
        <pre class="code-pre"><code>pnpm test           # Run Vitest test suites
pnpm test:rls       # Validate PostgreSQL RLS boundaries</code></pre>
      </div>
    `
  },
  'tools-deploy': {
    id: 'tools-deploy',
    category: 'Developer Tools',
    title: 'Deployment Architecture',
    intro: 'Self-hosted Docker Compose deployment and managed Kubernetes cluster setup.',
    contentHtml: `
      <p>All ZexCore modules compile to Node.js 22 LTS artifacts packaged in minimal Alpine Docker images.</p>
    `
  }
};

let currentArticleId = 'what-is-zexcore';

export function renderDocsPage(): string {
  // If URL hash points to a specific article, select it automatically
  if (window.location.hash.includes('what-is-zexcore')) {
    currentArticleId = 'what-is-zexcore';
  } else if (window.location.hash.includes('arch-overview')) {
    currentArticleId = 'arch-overview';
  }

  const currentArticle = docArticles[currentArticleId] || docArticles['what-is-zexcore'] || docArticles['arch-overview'];
  const allArticles = Object.values(docArticles);
  const currentIndex = allArticles.findIndex(a => a.id === currentArticle.id);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  return `
    <div class="page-wrapper">
      ${renderNavbar('docs')}

      <main>
        <!-- Page Header -->
        <section class="section-white page-intro-section">
          <div class="page-hero-backdrop" style="background-image: url('/heroes/hero-docs.jpg');"></div>
          <div class="site-container">
            <div class="page-intro-header page-hero-content-col">
              <div class="section-eyebrow">DEVELOPER DOCUMENTATION</div>
              <h1 class="page-intro-title">ZexCore Engineering Reference</h1>
              <p class="page-intro-desc">
                Technical guides, API contracts, database invariants, and SDK usage patterns for building vertical SaaS products on ZexCore.
              </p>

              <!-- Docs Search Bar Inside Content Column -->
              <div class="docs-search-bar-wrap">
                <div class="docs-search-input-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    id="docs-search-input"
                    class="docs-search-input"
                    placeholder="Search 24+ technical guides, endpoints, schemas (Ctrl+K)..."
                    oninput="handleDocsSearch(this.value)"
                  />
                  <kbd class="docs-search-kbd">Ctrl+K</kbd>
                </div>
                <!-- Live Search Dropdown -->
                <div id="docs-search-results" class="docs-search-dropdown" style="display: none;"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── DOCS 2-COLUMN LAYOUT ──────────────────────────────────────── -->
        <section class="section-gray" style="padding: 32px 0 80px 0;">
          <div class="site-container docs-layout-grid">

            <!-- Sidebar Nav Column (5 Categories) -->
            <aside class="docs-sidebar-card">
              <!-- 1. GETTING STARTED -->
              <div class="docs-nav-group">
                <div class="docs-group-label">GETTING STARTED</div>
                <ul class="docs-nav-items">
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('what-is-zexcore')" class="docs-nav-item ${currentArticle.id === 'what-is-zexcore' ? 'active' : ''}"><span class="docs-nav-dot"></span> <b>What ZexCore is All About</b></a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('arch-overview')" class="docs-nav-item ${currentArticle.id === 'arch-overview' ? 'active' : ''}">Architecture Overview</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('install')" class="docs-nav-item ${currentArticle.id === 'install' ? 'active' : ''}">Cloud vs. Enterprise Setup</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('tenancy')" class="docs-nav-item ${currentArticle.id === 'tenancy' ? 'active' : ''}">Tenant Resolution</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('auth')" class="docs-nav-item ${currentArticle.id === 'auth' ? 'active' : ''}">Authentication</a></li>
                </ul>
              </div>

              <!-- 2. PLATFORM SYSTEMS -->
              <div class="docs-nav-group">
                <div class="docs-group-label">PLATFORM SYSTEMS</div>
                <ul class="docs-nav-items">
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('eventbus')" class="docs-nav-item ${currentArticle.id === 'eventbus' ? 'active' : ''}">Core EventBus Broker</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('rules')" class="docs-nav-item ${currentArticle.id === 'rules' ? 'active' : ''}">Deterministic Rules Engine</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('iot')" class="docs-nav-item ${currentArticle.id === 'iot' ? 'active' : ''}">IoT Ingest &amp; Tokens</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('crm')" class="docs-nav-item ${currentArticle.id === 'crm' ? 'active' : ''}">CRM Pipeline</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('crypto')" class="docs-nav-item ${currentArticle.id === 'crypto' ? 'active' : ''}">Cryptographic Vault</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('lifecycle')" class="docs-nav-item ${currentArticle.id === 'lifecycle' ? 'active' : ''}">Module Lifecycle Contract</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('audit-module')" class="docs-nav-item ${currentArticle.id === 'audit-module' ? 'active' : ''}">Audit &amp; Financial Health</a></li>
                </ul>
              </div>

              <!-- 3. DATABASE & SECURITY -->
              <div class="docs-nav-group">
                <div class="docs-group-label">DATABASE &amp; SECURITY</div>
                <ul class="docs-nav-items">
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('rls')" class="docs-nav-item ${currentArticle.id === 'rls' ? 'active' : ''}">PostgreSQL RLS</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('isolation')" class="docs-nav-item ${currentArticle.id === 'isolation' ? 'active' : ''}">Tenant Isolation</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('rbac')" class="docs-nav-item ${currentArticle.id === 'rbac' ? 'active' : ''}">Role-Based Access Control</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('audit')" class="docs-nav-item ${currentArticle.id === 'audit' ? 'active' : ''}">Audit Logging</a></li>
                </ul>
              </div>

              <!-- 4. API REFERENCE -->
              <div class="docs-nav-group">
                <div class="docs-group-label">API REFERENCE</div>
                <ul class="docs-nav-items">
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('api-auth')" class="docs-nav-item ${currentArticle.id === 'api-auth' ? 'active' : ''}">Authentication Endpoints</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('api-tenants')" class="docs-nav-item ${currentArticle.id === 'api-tenants' ? 'active' : ''}">Tenant Endpoints</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('api-iot')" class="docs-nav-item ${currentArticle.id === 'api-iot' ? 'active' : ''}">IoT Endpoints</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('api-crm')" class="docs-nav-item ${currentArticle.id === 'api-crm' ? 'active' : ''}">CRM Endpoints</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('api-compliance')" class="docs-nav-item ${currentArticle.id === 'api-compliance' ? 'active' : ''}">Compliance Endpoints</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('api-audit')" class="docs-nav-item ${currentArticle.id === 'api-audit' ? 'active' : ''}">Audit Endpoints</a></li>
                </ul>
              </div>

              <!-- 5. DEVELOPER TOOLS -->
              <div class="docs-nav-group">
                <div class="docs-group-label">DEVELOPER TOOLS</div>
                <ul class="docs-nav-items">
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('tools-workspace')" class="docs-nav-item ${currentArticle.id === 'tools-workspace' ? 'active' : ''}">Workspace Structure</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('tools-config')" class="docs-nav-item ${currentArticle.id === 'tools-config' ? 'active' : ''}">Environment Configuration</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('tools-testing')" class="docs-nav-item ${currentArticle.id === 'tools-testing' ? 'active' : ''}">Testing</a></li>
                  <li><a href="javascript:void(0)" onclick="selectDocArticle('tools-deploy')" class="docs-nav-item ${currentArticle.id === 'tools-deploy' ? 'active' : ''}">Deployment</a></li>
                </ul>
              </div>
            </aside>

            <!-- Main Documentation Content Column -->
            <div class="docs-main-content" id="docs-content-container">
              <!-- Breadcrumbs -->
              <div class="docs-breadcrumbs">
                <span>Docs</span>
                <span class="breadcrumb-sep">&gt;</span>
                <span>${currentArticle.category}</span>
                <span class="breadcrumb-sep">&gt;</span>
                <span class="breadcrumb-current">${currentArticle.title}</span>
              </div>

              <!-- Article Header -->
              <h2 class="docs-article-title">${currentArticle.title}</h2>
              <p class="docs-article-intro">${currentArticle.intro}</p>

              <!-- Dynamic Content -->
              <div class="docs-body-html">
                ${currentArticle.contentHtml}
              </div>

              <!-- Pagination Navigation Footer -->
              <div class="docs-pagination-nav">
                ${prevArticle ? `
                  <a href="javascript:void(0)" onclick="selectDocArticle('${prevArticle.id}')" class="docs-page-link prev">
                    <span class="page-dir">&larr; Previous</span>
                    <span class="page-name">${prevArticle.title}</span>
                  </a>
                ` : `<div></div>`}
                ${nextArticle ? `
                  <a href="javascript:void(0)" onclick="selectDocArticle('${nextArticle.id}')" class="docs-page-link next" style="text-align: right;">
                    <span class="page-dir">Next &rarr;</span>
                    <span class="page-name">${nextArticle.title}</span>
                  </a>
                ` : `<div></div>`}
              </div>
            </div>

          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}

// Global article select helper
(window as any).selectDocArticle = function(id: string) {
  if (docArticles[id]) {
    currentArticleId = id;
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = renderDocsPage();
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }
};

// Global search filter helper
(window as any).handleDocsSearch = function(query: string) {
  const resultsContainer = document.getElementById('docs-search-results');
  if (!resultsContainer) return;
  const q = query.trim().toLowerCase();
  if (!q) {
    resultsContainer.style.display = 'none';
    return;
  }

  const matches = Object.values(docArticles).filter(a => 
    a.title.toLowerCase().includes(q) ||
    a.intro.toLowerCase().includes(q) ||
    a.category.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    resultsContainer.innerHTML = `<div class="docs-search-empty">No documentation matches for "${query}"</div>`;
  } else {
    resultsContainer.innerHTML = matches.slice(0, 6).map(m => `
      <div class="docs-search-hit" onclick="selectDocArticle('${m.id}'); document.getElementById('docs-search-results').style.display='none';">
        <div class="hit-category">${m.category}</div>
        <div class="hit-title">${m.title}</div>
        <div class="hit-snippet">${m.intro}</div>
      </div>
    `).join('');
  }
  resultsContainer.style.display = 'block';
};
