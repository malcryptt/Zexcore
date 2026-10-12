/**
 * ZexCore Architecture Page
 * In-Depth Technical Specification & Verified Code Contracts
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
          <div class="site-container">
            <div class="page-intro-header">
              <div class="section-eyebrow">SYSTEM SPECIFICATION</div>
              <h1 class="page-intro-title">Technical Architecture &amp; Invariants</h1>
              <p class="page-intro-desc">
                An exhaustive engineering breakdown of request lifecycles, database invariants, PostgreSQL Row-Level Security, and asynchronous message topology in ZexCore.
              </p>
            </div>
          </div>
        </section>

        <!-- ── SECTION 1: TOPOLOGY DIAGRAM (CHARCOAL ACCENT) ───────────── -->
        <section class="section-charcoal section-padded">
          <div class="site-container">
            <div class="charcoal-header-block">
              <div class="section-eyebrow" style="color: var(--primary-border);">SYSTEM TOPOLOGY</div>
              <h2 class="charcoal-title">The Four Architectural Layers</h2>
              <p class="charcoal-desc">
                Layer boundaries are enforced at the repository level, package export manifests, and ESLint import restrictions. Core never imports from modules; modules communicate strictly via the EventBus.
              </p>
            </div>

            <!-- Terminal-style ASCII Architecture Box -->
            <div class="arch-terminal-block">
              <div class="terminal-bar">
                <span class="term-dot"></span>
                <span class="term-dot"></span>
                <span class="term-dot"></span>
                <span class="term-title">ZexCore Package Dependency Graph (Strict Downward Flow)</span>
              </div>
              <pre class="terminal-pre"><code>+-----------------------------------------------------------------------------------------+
|                                    APPLICATIONS                                         |
|              apps/api (Fastify 5)             |         apps/dashboard (Control Console)|
+-----------------------------------------------+-----------------------------------------+
                                        |
+-----------------------------------------------------------------------------------------+
|                              INDUSTRY CONFIGURATION PACKS                               |
|   packs/industrial-iot     |    packs/logistics-fleet    |     packs/regulated-vault      |
+----------------------------+-----------------------------+------------------------------+
                                        |
+-----------------------------------------------------------------------------------------+
|                                  DOMAIN MODULES                                         |
|    @zexcore/module-iot     |      @zexcore/rules         |    @zexcore/module-crm         |
|                            |   @zexcore/compliance       |                              |
+----------------------------+-----------------------------+------------------------------+
                                        |
+-----------------------------------------------------------------------------------------+
|                             ZEXCORE CORE MICRO-KERNEL                                   |
|   Tenancy Resolution  |  Auth & RBAC  |  EventBus Broker  |  Hash-Chained Audit Ledger  |
|                       PostgreSQL 17 Native RLS (Drizzle ORM Engine)                     |
+-----------------------------------------------------------------------------------------+</code></pre>
            </div>
          </div>
        </section>

        <!-- ── SECTION 2: REQUEST LIFECYCLE ─────────────────────────────── -->
        <section class="section-white section-padded" id="request">
          <div class="site-container">
            <div class="section-header-block">
              <div class="section-eyebrow">LIFECYCLE PIPELINE</div>
              <h2 class="section-title">Request Lifecycle &amp; Tenancy Resolution</h2>
              <p class="section-desc">
                Every HTTP request traverses a five-stage pipeline before touching any domain logic or database query.
              </p>
            </div>

            <div class="lifecycle-steps-grid">
              <div class="step-card">
                <div class="step-badge">STAGE 1</div>
                <h4 class="step-title">Tenant Extraction</h4>
                <p class="step-desc">
                  Extracted from incoming request subdomain (e.g. <code>acme.zexcore.io</code>) or explicit <code>X-Tenant-ID</code> request header.
                </p>
              </div>

              <div class="step-card">
                <div class="step-badge">STAGE 2</div>
                <h4 class="step-title">Context Binding</h4>
                <p class="step-desc">
                  Stored in Node.js <code>AsyncLocalStorage</code> (<code>TenantContext</code>). Eliminates parameter drilling and avoids thread context bleeding.
                </p>
              </div>

              <div class="step-card">
                <div class="step-badge">STAGE 3</div>
                <h4 class="step-title">Database Session Binding</h4>
                <p class="step-desc">
                  PostgreSQL connection executes <code>SET LOCAL app.current_tenant_id = :id</code> inside transactional queries, locking native RLS.
                </p>
              </div>

              <div class="step-card">
                <div class="step-badge">STAGE 4</div>
                <h4 class="step-title">Authentication &amp; JWT</h4>
                <p class="step-desc">
                  Bearer token resolves to an active <code>User</code> record and their validated <code>Membership</code> within the resolved tenant.
                </p>
              </div>

              <div class="step-card">
                <div class="step-badge">STAGE 5</div>
                <h4 class="step-title">Capability Authorization</h4>
                <p class="step-desc">
                  Verifies caller role holds the required granular capability (e.g. <code>records:create</code>, <code>iot:control</code>) for this operation.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- ── SECTION 3: RLS & COMPOSITE KEY INVARIANTS ────────────────── -->
        <section class="section-gray section-padded" id="isolation">
          <div class="site-container split-feature-row">
            <div class="split-col-text">
              <div class="section-eyebrow">DATABASE DEFENSE-IN-DEPTH</div>
              <h2 class="split-heading">Composite Keys &amp; RLS Invariants</h2>
              <p class="split-p">
                Foreign key checks in PostgreSQL run <em>outside</em> Row-Level Security. To guarantee that Tenant A cannot link to Tenant B's parent rows, ZexCore enforces composite primary and foreign key constraints on every table:
              </p>
              <ul class="bullet-feature-list">
                <li>
                  <strong>Composite Primary Key:</strong> Every entity defines <code>PRIMARY KEY (tenant_id, id)</code>.
                </li>
                <li>
                  <strong>Composite Foreign Key:</strong> References must explicitly declare <code>FOREIGN KEY (tenant_id, foreign_id) REFERENCES parent(tenant_id, id) ON DELETE CASCADE</code>.
                </li>
                <li>
                  <strong>FORCE ROW LEVEL SECURITY:</strong> Mandated on all tables so table owners cannot bypass policies.
                </li>
                <li>
                  <strong>Non-Superuser Runtime Role:</strong> The application connects strictly as <code>zexcore_app</code> (<code>NOSUPERUSER</code>, <code>NOBYPASSRLS</code>).
                </li>
              </ul>
            </div>
            <div class="split-col-visual">
              <div class="code-editor-card">
                <div class="code-editor-title">schema.ts (Drizzle ORM Invariant)</div>
                <pre class="code-pre"><code>export const devices = pgTable(
  'devices',
  {
    tenantId: uuid('tenant_id').notNull(),
    id: uuid('id').defaultRandom().notNull(),
    deviceKey: varchar('device_key', { length: 128 }).notNull(),
    kind: varchar('kind', { length: 64 }).notNull(),
    status: varchar('status', { length: 32 }).default('offline'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    // Hard composite primary key
    pk: primaryKey({ columns: [table.tenantId, table.id] }),
    // Composite unique index
    tenantKeyUnique: uniqueIndex('devices_tenant_key_idx')
      .on(table.tenantId, table.deviceKey),
  })
);</code></pre>
              </div>
            </div>
          </div>
        </section>

        <!-- ── SECTION 4: DETERMINISTIC AST RULES EVALUATOR ─────────────── -->
        <section class="section-white section-padded" id="ast">
          <div class="site-container split-feature-row">
            <div class="split-col-visual">
              <div class="code-editor-card">
                <div class="code-editor-title">ast-evaluator.ts (Zero-Eval Execution)</div>
                <pre class="code-pre"><code>export function evaluateNode(node: ASTNode, ctx: Record<string, any>, state: EvalState): any {
  if (++state.stepCount > 10000) {
    throw new Error('Evaluation step ceiling exceeded (10000 steps)');
  }
  if (Date.now() - state.startTime > 50) {
    throw new Error('Evaluation timeout exceeded (50ms limit)');
  }

  switch (node.type) {
    case 'BinaryExpression':
      const left = evaluateNode(node.left, ctx, state);
      const right = evaluateNode(node.right, ctx, state);
      return applyOperator(node.operator, left, right);
    case 'Identifier':
      return resolvePath(ctx, node.name);
    case 'Literal':
      return node.value;
    default:
      throw new Error(\`Unsupported AST node type: \${node.type}\`);
  }
}</code></pre>
              </div>
            </div>
            <div class="split-col-text">
              <div class="section-eyebrow">DETERMINISTIC AUTOMATION</div>
              <h2 class="split-heading">Safe AST Rule Execution (Zero Eval)</h2>
              <p class="split-p">
                Multi-tenant automation systems often fail when allowing scriptable logic. In ZexCore, formulas, triggers, and threshold conditions are compiled into an Abstract Syntax Tree (AST).
              </p>
              <ul class="bullet-feature-list">
                <li>
                  <strong>No Arbitrary Code:</strong> JavaScript <code>eval()</code>, <code>new Function()</code>, and <code>vm2</code> are prohibited by linting and runtime architecture.
                </li>
                <li>
                  <strong>Step Counter Ceiling:</strong> Max 10,000 instruction steps per evaluation. Infinite loops and recursive denial-of-service are mathematically bounded.
                </li>
                <li>
                  <strong>Strict Execution Timeout:</strong> Hard 50ms deadline per evaluation thread.
                </li>
                <li>
                  <strong>AI Rule Authoring with Human Approval Gate:</strong> Natural language prompt generates an AST payload that requires explicit human approval before being enabled.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="section-gray final-cta-section">
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
