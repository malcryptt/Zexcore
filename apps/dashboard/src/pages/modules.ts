/**
 * ZexCore Modules Page
 * Matches user requirements:
 * - 2x3 clean white cards grid (Red, White & Graphite design system)
 * - Each card has Name, Package, Description, Status, Key Capabilities, Dependencies & Exports, Example Endpoints
 * - Interactive "View Details" modal for deep technical inspection
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
          <div class="page-hero-backdrop" style="background-image: url('/heroes/hero-modules.jpg');"></div>
          <div class="site-container">
            <div class="page-intro-header page-hero-content-col">
              <div class="section-eyebrow">MODULAR DOMAIN ENGINES</div>
              <h1 class="page-intro-title">Platform Modules</h1>
              <p class="page-intro-desc">
                ZexCore modules are isolated workspace packages that register database schemas, REST endpoints, EventBus listeners, and capabilities through a formal lifecycle contract.
              </p>
            </div>
          </div>
        </section>

        <!-- ── 2x3 MODULE CARDS GRID ────────────────────────────── -->
        <section class="section-white section-padded" style="padding: 48px 0 80px 0;">
          <div class="site-container">
            <div class="platform-modules-grid">

              <!-- 1. Core -->
              <div class="p-mod-card" id="mod-core">
                <div class="p-mod-header">
                  <div class="p-mod-title-row">
                    <div class="p-mod-icon-wrap">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                        <polyline points="2 17 12 22 22 17"/>
                        <polyline points="2 12 12 17 22 12"/>
                      </svg>
                    </div>
                    <h3 class="p-mod-name">Core</h3>
                  </div>
                  <span class="p-mod-badge-active">Active</span>
                </div>
                <div class="p-mod-pkg">@zexcore/core</div>
                <p class="p-mod-desc">
                  Foundational tenancy, RBAC, database Row-Level Security, EventBus, and audit functionality.
                </p>
                <div class="p-mod-specs">
                  <div class="p-mod-cap-label">Key Capabilities</div>
                  <div class="p-mod-meta-row"><strong>Dependencies:</strong> none (micro-kernel root)</div>
                  <div class="p-mod-meta-row"><strong>Exports:</strong> core, tenancy, rbac, eventBus, audit</div>
                </div>
                <div class="p-mod-endpoints">
                  <div class="p-mod-cap-label">Example Endpoints</div>
                  <div class="p-endpoint-tag"><code>POST /api/auth/login</code></div>
                  <div class="p-endpoint-tag"><code>GET /api/tenants/current</code></div>
                </div>
                <div class="p-mod-action">
                  <button class="btn btn-primary btn-sm btn-open-mod" onclick="openModuleModal('core')">View Details &rarr;</button>
                </div>
              </div>

              <!-- 2. Industrial IoT -->
              <div class="p-mod-card" id="mod-iot">
                <div class="p-mod-header">
                  <div class="p-mod-title-row">
                    <div class="p-mod-icon-wrap">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                        <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                        <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                        <line x1="12" y1="20" x2="12.01" y2="20"/>
                      </svg>
                    </div>
                    <h3 class="p-mod-name">Industrial IoT</h3>
                  </div>
                  <span class="p-mod-badge-active">Active</span>
                </div>
                <div class="p-mod-pkg">@zexcore/module-iot</div>
                <p class="p-mod-desc">
                  Fleet management, device authentication, telemetry ingestion, sensor thresholds, and device-event processing.
                </p>
                <div class="p-mod-specs">
                  <div class="p-mod-cap-label">Key Capabilities</div>
                  <div class="p-mod-meta-row"><strong>Dependencies:</strong> @zexcore/core</div>
                  <div class="p-mod-meta-row"><strong>Exports:</strong> iot, telemetry, devices, edgeAuth</div>
                </div>
                <div class="p-mod-endpoints">
                  <div class="p-mod-cap-label">Example Endpoints</div>
                  <div class="p-endpoint-tag"><code>POST /api/iot/telemetry</code></div>
                  <div class="p-endpoint-tag"><code>POST /api/iot/devices/register</code></div>
                </div>
                <div class="p-mod-action">
                  <button class="btn btn-primary btn-sm btn-open-mod" onclick="openModuleModal('iot')">View Details &rarr;</button>
                </div>
              </div>

              <!-- 3. Rules & AI Authoring -->
              <div class="p-mod-card" id="mod-rules">
                <div class="p-mod-header">
                  <div class="p-mod-title-row">
                    <div class="p-mod-icon-wrap">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                        <polyline points="16 18 22 12 16 6"/>
                        <polyline points="8 6 2 12 8 18"/>
                      </svg>
                    </div>
                    <h3 class="p-mod-name">Rules &amp; AI Authoring</h3>
                  </div>
                  <span class="p-mod-badge-active">Active</span>
                </div>
                <div class="p-mod-pkg">@zexcore/rules</div>
                <p class="p-mod-desc">
                  Deterministic rule evaluation, validated rule definitions, and safe expression execution.
                </p>
                <div class="p-mod-specs">
                  <div class="p-mod-cap-label">Key Capabilities</div>
                  <div class="p-mod-meta-row"><strong>Dependencies:</strong> @zexcore/core</div>
                  <div class="p-mod-meta-row"><strong>Exports:</strong> rulesEngine, astValidator, geminiAuthor</div>
                </div>
                <div class="p-mod-endpoints">
                  <div class="p-mod-cap-label">Example Endpoints</div>
                  <div class="p-endpoint-tag"><code>POST /api/rules/evaluate</code></div>
                  <div class="p-endpoint-tag"><code>POST /api/rules/author/ai</code></div>
                </div>
                <div class="p-mod-action">
                  <button class="btn btn-primary btn-sm btn-open-mod" onclick="openModuleModal('rules')">View Details &rarr;</button>
                </div>
              </div>

              <!-- 4. CRM -->
              <div class="p-mod-card" id="mod-crm">
                <div class="p-mod-header">
                  <div class="p-mod-title-row">
                    <div class="p-mod-icon-wrap">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <h3 class="p-mod-name">CRM</h3>
                  </div>
                  <span class="p-mod-badge-active">Active</span>
                </div>
                <div class="p-mod-pkg">@zexcore/module-crm</div>
                <p class="p-mod-desc">
                  Leads, contacts, sales opportunities, pipeline stages, and multi-currency support.
                </p>
                <div class="p-mod-specs">
                  <div class="p-mod-cap-label">Key Capabilities</div>
                  <div class="p-mod-meta-row"><strong>Dependencies:</strong> @zexcore/core</div>
                  <div class="p-mod-meta-row"><strong>Exports:</strong> crmPipeline, leadsService, multiCurrency</div>
                </div>
                <div class="p-mod-endpoints">
                  <div class="p-mod-cap-label">Example Endpoints</div>
                  <div class="p-endpoint-tag"><code>GET /api/crm/leads</code></div>
                  <div class="p-endpoint-tag"><code>POST /api/crm/opportunities</code></div>
                </div>
                <div class="p-mod-action">
                  <button class="btn btn-primary btn-sm btn-open-mod" onclick="openModuleModal('crm')">View Details &rarr;</button>
                </div>
              </div>

              <!-- 5. Compliance -->
              <div class="p-mod-card" id="mod-compliance">
                <div class="p-mod-header">
                  <div class="p-mod-title-row">
                    <div class="p-mod-icon-wrap">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <h3 class="p-mod-name">Compliance</h3>
                  </div>
                  <span class="p-mod-badge-active">Active</span>
                </div>
                <div class="p-mod-pkg">@zexcore/compliance</div>
                <p class="p-mod-desc">
                  Sensitive-data encryption, privacy workflows, compliance events, and audit support.
                </p>
                <div class="p-mod-specs">
                  <div class="p-mod-cap-label">Key Capabilities</div>
                  <div class="p-mod-meta-row"><strong>Dependencies:</strong> @zexcore/core</div>
                  <div class="p-mod-meta-row"><strong>Exports:</strong> cryptoVault, gdprErasure, consentLedger</div>
                </div>
                <div class="p-mod-endpoints">
                  <div class="p-mod-cap-label">Example Endpoints</div>
                  <div class="p-endpoint-tag"><code>POST /api/compliance/encrypt</code></div>
                  <div class="p-endpoint-tag"><code>POST /api/compliance/erasure</code></div>
                </div>
                <div class="p-mod-action">
                  <button class="btn btn-primary btn-sm btn-open-mod" onclick="openModuleModal('compliance')">View Details &rarr;</button>
                </div>
              </div>

              <!-- 6. More Modules (Placeholder / Manifest Registry) -->
              <div class="p-mod-card p-mod-card-more">
                <div class="p-mod-more-content">
                  <div class="p-mod-icon-wrap" style="background: var(--bg-alt); margin-bottom: 16px;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  </div>
                  <h3 class="p-mod-name" style="margin-bottom: 8px;">More Modules</h3>
                  <p class="p-mod-desc" style="text-align: center; margin-bottom: 24px;">
                    Additional modules and integrations are available in the platform manifest registry.
                  </p>
                  <a href="#/docs#module-contract" class="btn btn-outline btn-sm">Explore Full List &rarr;</a>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- ── MODULE DETAIL MODAL ──────────────────────────────── -->
        <div id="module-detail-modal" class="modal-overlay" style="display: none;">
          <div class="modal-dialog">
            <div class="modal-header">
              <div>
                <span class="modal-eyebrow" id="modal-mod-pkg">PACKAGE</span>
                <h3 class="modal-title" id="modal-mod-title">Module Specification</h3>
              </div>
              <button class="modal-close-btn" onclick="closeModuleModal()">&times;</button>
            </div>
            <div class="modal-body" id="modal-mod-content">
              <!-- Dynamically populated -->
            </div>
            <div class="modal-footer">
              <a href="#/docs" class="btn btn-outline btn-sm" onclick="closeModuleModal()">Read Technical Docs</a>
              <button class="btn btn-primary btn-sm" onclick="closeModuleModal()">Close</button>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <section class="section-tinted-red final-cta-section">
          <div class="site-container final-cta-inner">
            <h2 class="final-cta-headline">Compose Custom Modules in Your Monorepo</h2>
            <p class="final-cta-subtext">
              Every ZexCore module exposes TypeScript interfaces, Drizzle ORM schemas, and Fastify route definitions.
            </p>
            <div class="final-cta-buttons">
              <a href="#/console" class="btn btn-primary btn-lg">
                Launch Control Console &rarr;
              </a>
              <a href="#/docs" class="btn btn-secondary btn-lg">
                Read Module Lifecycle Docs
              </a>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}

// Module Specifications Dictionary for View Details Modal
const moduleDetailsData: Record<string, { title: string; pkg: string; desc: string; schemas: string[]; endpoints: string[]; events: string[] }> = {
  core: {
    title: 'Core Micro-Kernel Foundation',
    pkg: '@zexcore/core',
    desc: 'The mandatory micro-kernel providing AsyncLocalStorage tenancy propagation, database RLS execution wrappers, RBAC evaluation, and the append-only audit trail.',
    schemas: ['tenants', 'users', 'tenant_memberships', 'audit_log'],
    endpoints: ['POST /api/auth/login', 'GET /api/tenants/current', 'GET /api/tenants/:id/members', 'POST /api/audit/query'],
    events: ['auth.session.created', 'tenant.context.switched', 'audit.mutation.recorded']
  },
  iot: {
    title: 'Industrial IoT & Fleet Gateway',
    pkg: '@zexcore/module-iot',
    desc: 'Edge device registry with SHA-256 token authentication (X-Device-Token), high-throughput telemetry ingestion, and bidirectional remote command execution.',
    schemas: ['devices', 'device_telemetry', 'device_commands', 'device_alerts'],
    endpoints: ['POST /api/iot/telemetry', 'POST /api/iot/devices/register', 'GET /api/iot/devices', 'POST /api/iot/commands/send'],
    events: ['iot.telemetry.received', 'iot.device.offline', 'iot.threshold.alert', 'iot.command.dispatched']
  },
  rules: {
    title: 'Deterministic Rules & Gemini AI Author',
    pkg: '@zexcore/rules',
    desc: 'Abstract Syntax Tree (AST) safe rule evaluation with zero JavaScript eval, execution ceiling protections, and Google Gemini AI assistance for authoring validated expressions.',
    schemas: ['rules', 'rule_conditions', 'rule_executions'],
    endpoints: ['POST /api/rules/evaluate', 'GET /api/rules', 'POST /api/rules/create', 'POST /api/rules/author/ai'],
    events: ['rules.rule.evaluated', 'rules.action.emitted', 'rules.approval.granted']
  },
  crm: {
    title: 'Vertical CRM & Pipeline Engine',
    pkg: '@zexcore/module-crm',
    desc: 'Multi-currency opportunity pipeline tracking, stage transitions, tenant-scoped contacts, and automated follow-up triggers out of the box.',
    schemas: ['crm_leads', 'crm_opportunities', 'crm_stages', 'crm_contacts'],
    endpoints: ['GET /api/crm/leads', 'POST /api/crm/opportunities', 'PATCH /api/crm/opportunities/:id/stage', 'GET /api/crm/pipeline/summary'],
    events: ['crm.lead.created', 'crm.stage.transitioned', 'crm.opportunity.won']
  },
  compliance: {
    title: 'Cryptographic Privacy & GDPR Vault',
    pkg: '@zexcore/compliance',
    desc: 'AES-256-GCM envelope encryption with unique tenant keys, HMAC-SHA256 blind indexing for encrypted search, consent ledger management, and GDPR Article 17 Right-to-be-Forgotten erasure pipelines.',
    schemas: ['compliance_vault', 'consent_ledger', 'erasure_requests'],
    endpoints: ['POST /api/compliance/encrypt', 'POST /api/compliance/decrypt', 'POST /api/compliance/erasure', 'GET /api/compliance/consent'],
    events: ['compliance.data.encrypted', 'compliance.erasure.executed', 'compliance.consent.granted']
  }
};

// Global helper for opening module modal
(window as any).openModuleModal = function(modKey: string) {
  const data = moduleDetailsData[modKey];
  if (!data) return;
  const modal = document.getElementById('module-detail-modal');
  const titleEl = document.getElementById('modal-mod-title');
  const pkgEl = document.getElementById('modal-mod-pkg');
  const contentEl = document.getElementById('modal-mod-content');

  if (titleEl) titleEl.textContent = data.title;
  if (pkgEl) pkgEl.textContent = data.pkg;
  if (contentEl) {
    contentEl.innerHTML = `
      <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
        ${data.desc}
      </p>

      <div style="margin-bottom: 16px;">
        <h5 style="font-size: 0.8rem; font-weight: 800; color: var(--text-main); text-transform: uppercase; margin-bottom: 8px;">Registered Database Tables</h5>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${data.schemas.map(s => `<span class="p-endpoint-tag" style="background:#F1F5F9; color:#334155;">${s}</span>`).join('')}
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h5 style="font-size: 0.8rem; font-weight: 800; color: var(--text-main); text-transform: uppercase; margin-bottom: 8px;">Exposed REST Endpoints</h5>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${data.endpoints.map(e => `<div class="p-endpoint-tag"><code>${e}</code></div>`).join('')}
        </div>
      </div>

      <div>
        <h5 style="font-size: 0.8rem; font-weight: 800; color: var(--text-main); text-transform: uppercase; margin-bottom: 8px;">Published Domain Events</h5>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${data.events.map(ev => `<span class="p-endpoint-tag" style="background:#FEF2F2; color:#B5121B;"><code>${ev}</code></span>`).join('')}
        </div>
      </div>
    `;
  }
  if (modal) modal.style.display = 'flex';
};

(window as any).closeModuleModal = function() {
  const modal = document.getElementById('module-detail-modal');
  if (modal) modal.style.display = 'none';
};
