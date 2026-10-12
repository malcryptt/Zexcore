/**
 * ZexCore Control — Enterprise Infrastructure Control Plane
 * Red & White Production-Ready Enterprise Dashboard
 */

interface Device {
  id: string;
  name: string;
  key: string;
  kind: string;
  status: 'online' | 'offline';
  temperature: number;
  humidity: number;
  voltage: number;
  firmware: string;
  lastSeen: string;
}

interface Rule {
  id: string;
  name: string;
  trigger: string;
  conditions: string;
  action: string;
  approved: boolean;
  enabled: boolean;
}

interface Lead {
  id: string;
  title: string;
  company: string;
  value: number;
  currency: string;
  stage: string;
}

interface Consent {
  id: string;
  subjectId: string;
  purpose: string;
  legalBasis: string;
  grantedAt: string;
  revokedAt: string | null;
}

// ── Application State ────────────────────────────────────────────────────────
const state = {
  currentView: 'home' as 'home' | 'signin' | 'dashboard',
  currentTab: 'overview',
  activeTenant: 'acme_corp',
  devices: [
    { id: 'dev-1', name: 'Factory Edge Sensor Node 01', key: 'iot_temp_sensor_01', kind: 'temperature_probe', status: 'online', temperature: 24.8, humidity: 54, voltage: 3.3, firmware: 'v2.1.4', lastSeen: 'Just now' },
    { id: 'dev-2', name: 'Cold Chain Storage Facility B', key: 'iot_cold_chiller_02', kind: 'chiller_probe', status: 'online', temperature: -4.2, humidity: 76, voltage: 3.2, firmware: 'v2.1.2', lastSeen: '1m ago' },
    { id: 'dev-3', name: 'Main Power Grid Inverter', key: 'iot_solar_gw_03', kind: 'power_gateway', status: 'offline', temperature: 48.0, humidity: 32, voltage: 48.1, firmware: 'v1.9.0', lastSeen: '12m ago' },
    { id: 'dev-4', name: 'Logistics Depot Gateway', key: 'iot_depot_gw_04', kind: 'network_gateway', status: 'online', temperature: 31.5, humidity: 45, voltage: 12.0, firmware: 'v2.2.0', lastSeen: 'Just now' },
  ] as Device[],
  rules: [
    {
      id: 'rule-1',
      name: 'High Temperature Threshold Monitor (>75°C)',
      trigger: 'iot.telemetry.received',
      conditions: 'metrics.temperature > 75',
      action: 'emit: iot.alert.triggered (severity: critical)',
      approved: true,
      enabled: true,
    },
    {
      id: 'rule-2',
      name: 'VIP Enterprise Lead Assignment (> $50k)',
      trigger: 'crm.lead.created',
      conditions: 'lead.value >= 50000',
      action: 'emit: crm.vip_lead.assigned',
      approved: true,
      enabled: true,
    },
    {
      id: 'rule-3',
      name: 'Hardware Offline Incident Dispatcher',
      trigger: 'iot.device.offline',
      conditions: 'device.kind == "power_gateway"',
      action: 'emit: ops.incident.created',
      approved: false,
      enabled: true,
    },
  ] as Rule[],
  stages: ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'],
  leads: [
    { id: 'lead-1', title: 'Global Fleet Telemetry Infrastructure', company: 'LogiTrans International', value: 85000, currency: 'USD', stage: 'Proposal' },
    { id: 'lead-2', title: 'Industrial Automation Core Deployment', company: 'Apex Robotics Corp', value: 120000, currency: 'USD', stage: 'Negotiation' },
    { id: 'lead-3', title: 'Pharmaceutical Cold-Chain Compliance Suite', company: 'PharmaCore Laboratories', value: 45000, currency: 'USD', stage: 'Qualified' },
    { id: 'lead-4', title: 'Microgrid Edge Control Expansion', company: 'EcoGrid Dynamics', value: 210000, currency: 'USD', stage: 'Closed Won' },
    { id: 'lead-5', title: 'Smart Sensor Pilot Program', company: 'Nordic Agricultural Tech', value: 18000, currency: 'USD', stage: 'New' },
  ] as Lead[],
  consents: [
    { id: 'c-1', subjectId: 'emma.watson@enterprise-corp.io', purpose: 'telemetry_processing', legalBasis: 'contract', grantedAt: '2026-10-01 10:24', revokedAt: null },
    { id: 'c-2', subjectId: 'david.k@global-cloud.com', purpose: 'marketing_analytics', legalBasis: 'consent', grantedAt: '2026-09-18 14:12', revokedAt: null },
    { id: 'c-3', subjectId: 'alina.p@industrial-iot.de', purpose: 'crm_profiling', legalBasis: 'legitimate_interests', grantedAt: '2026-08-11 09:00', revokedAt: '2026-10-10 18:30' },
  ] as Consent[],
  events: [] as Array<{ ts: string; name: string; payload: string }>,
  erasureRequestsCount: 1,
  anonymizedCount: 4,
};

function logBusEvent(name: string, payload: Record<string, unknown>) {
  const ts = new Date().toLocaleTimeString();
  state.events.unshift({
    ts,
    name,
    payload: JSON.stringify(payload),
  });
  if (state.events.length > 20) state.events.pop();
  renderEventLog();
}

// Initial Events
logBusEvent('zexcore.system.boot', { status: 'healthy', modules: ['core', 'iot', 'rules', 'crm', 'compliance'] });
logBusEvent('iot.telemetry.received', { deviceId: 'dev-1', metrics: { temperature: 24.8, humidity: 54 } });
logBusEvent('compliance.consent.granted', { subjectId: 'emma.watson@enterprise-corp.io', purpose: 'telemetry_processing' });

// ── Render Application Shell (Dashboard) ────────────────────────────────────
function renderDashboard() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="brand-header" id="brand-header-to-home" title="Click to view public site">
          <img src="/zexcore-logo-horizontal.png" alt="ZexCore" class="brand-logo-horizontal" />
        </div>

        <nav class="nav-menu">
          <div class="nav-label">Platform Modules</div>
          <div class="nav-item active" data-tab="overview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            System Overview
          </div>
          <div class="nav-item" data-tab="iot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            IoT Hub
            <span class="nav-badge" id="iot-count">${state.devices.length}</span>
          </div>
          <div class="nav-item" data-tab="rules">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Rules &amp; AI Author
            <span class="nav-badge">${state.rules.length}</span>
          </div>
          <div class="nav-item" data-tab="crm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            CRM Sales Pipeline
            <span class="nav-badge">${state.leads.length}</span>
          </div>
          <div class="nav-item" data-tab="compliance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Compliance &amp; Vault
          </div>
        </nav>

        <div class="sidebar-footer">
          <div style="display: flex; gap: 6px; margin-bottom: 10px; width: 100%;">
            <button class="btn btn-secondary btn-sm" id="btn-sidebar-home" style="flex: 1; font-size: 0.72rem; padding: 4px 6px;">Website</button>
            <button class="btn btn-secondary btn-sm" id="btn-sidebar-signout" style="flex: 1; font-size: 0.72rem; padding: 4px 6px;">Sign Out</button>
          </div>
          <div class="status-pill">
            <div class="status-dot"></div>
            <span>RLS Enforced</span>
          </div>
          <span style="font-family: var(--font-mono); color: var(--text-secondary); font-size: 0.72rem;">Postgres 17</span>
        </div>
      </aside>

      <!-- Main Layout -->
      <main class="main-wrapper">
        <header class="topbar">
          <div class="topbar-left">
            <div class="org-tenant-box">
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Tenant:</span>
              <select id="tenantSelect" class="tenant-select">
                <option value="acme_corp">Acme Enterprise Corp (prod-us-east)</option>
                <option value="globex_corp">Globex Research (dev-eu-west)</option>
                <option value="soylent_ind">Soylent Dynamics (staging-apac)</option>
              </select>
              <span class="tier-badge">ENTERPRISE TIER</span>
            </div>
          </div>

          <div class="topbar-right">
            <div class="module-status-group">
              <span class="module-chip"><span class="dot"></span>core</span>
              <span class="module-chip"><span class="dot"></span>iot</span>
              <span class="module-chip"><span class="dot"></span>rules</span>
              <span class="module-chip"><span class="dot"></span>crm</span>
              <span class="module-chip"><span class="dot"></span>compliance</span>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-topbar-home" style="margin-left: 8px;">Public Site</button>
            <button class="btn btn-secondary btn-sm" id="btn-topbar-signout">Sign Out</button>
          </div>
        </header>

        <div class="page-container">
          <!-- ── OVERVIEW TAB ─────────────────────────────────────────────── -->
          <div id="tab-overview" class="tab-content active">
            <div class="page-header">
              <div>
                <h2 class="page-title">Platform Operations Overview</h2>
                <div class="page-desc">Runtime health, active module metrics, and cross-module event bus ledger</div>
              </div>
            </div>

            <div class="grid-4" style="margin-bottom: 24px;">
              <div class="stat-box highlight">
                <div class="stat-label">Platform Health</div>
                <div class="stat-value" style="color: var(--success);">Operational</div>
                <div class="stat-subtext">All 5 modules active &amp; registered</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Connected Fleet Nodes</div>
                <div class="stat-value" id="stat-online-devices">3 / 4</div>
                <div class="stat-subtext">Telemetry streaming via SHA-256 tokens</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Active Rules Evaluated</div>
                <div class="stat-value">1,428</div>
                <div class="stat-subtext">Deterministic execution (0 runtime eval)</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Total Pipeline Value</div>
                <div class="stat-value" id="stat-total-pipeline" style="color: var(--primary);">$478,000</div>
                <div class="stat-subtext">5 active sales opportunities</div>
              </div>
            </div>

            <div class="grid-2" style="margin-bottom: 24px;">
              <div class="card">
                <div class="card-header">
                  <div>
                    <div class="card-title">Multi-Tenant Isolation Architecture</div>
                    <div class="card-subtitle">Zero data leakage boundary enforced via PostgreSQL Row-Level Security</div>
                  </div>
                </div>
                <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-secondary);">
                  <p style="margin-bottom: 10px;">
                    Every query executes with <code>set_config('app.current_tenant_id', :id, true)</code>. All module tables enforce composite unique and foreign keys <code>(tenant_id, id)</code> preventing cross-tenant references at the database engine level.
                  </p>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 14px;">
                    <span class="module-chip">FORCE ROW LEVEL SECURITY</span>
                    <span class="module-chip">Composite Foreign Keys</span>
                    <span class="module-chip">AES-256-GCM Vault</span>
                    <span class="module-chip">Hash-Chained Audit Log</span>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-header">
                  <div>
                    <div class="card-title">Quick Operations</div>
                    <div class="card-subtitle">Trigger live module workflows</div>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <button class="btn btn-secondary" id="btn-quick-telemetry" style="justify-content: flex-start;">
                    📡 Ingest Simulated High-Temp IoT Reading (79.4°C)
                  </button>
                  <button class="btn btn-secondary" id="btn-quick-lead" style="justify-content: flex-start;">
                    💼 Create Enterprise Deal ($95,000)
                  </button>
                  <button class="btn btn-secondary" id="btn-quick-encrypt" style="justify-content: flex-start;">
                    🔐 Encrypt Sensitive PII Record with Tenant Key
                  </button>
                </div>
              </div>
            </div>

            <!-- Event Bus Live Log -->
            <div class="terminal-box">
              <div class="terminal-header">
                <span>Core EventBus Real-Time Stream</span>
                <span style="font-size: 0.7rem; font-family: var(--font-mono); color: var(--text-muted);">Asynchronous Event Broker</span>
              </div>
              <div class="terminal-content" id="event-stream-body"></div>
            </div>
          </div>

          <!-- ── IOT HUB TAB ─────────────────────────────────────────────── -->
          <div id="tab-iot" class="tab-content">
            <div class="page-header">
              <div>
                <h2 class="page-title">IoT Device Fleet &amp; Telemetry Gateway</h2>
                <div class="page-desc">Manage edge hardware, ingest telemetry via token authentication, and monitor health thresholds</div>
              </div>
              <button class="btn btn-primary" id="btn-open-register-device">+ Register Edge Device</button>
            </div>

            <div class="device-table-card">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Device Name &amp; Key</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Temperature</th>
                    <th>Humidity</th>
                    <th>Voltage</th>
                    <th>Firmware</th>
                    <th>Last Seen</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody id="device-table-body"></tbody>
              </table>
            </div>
          </div>

          <!-- ── RULES TAB ────────────────────────────────────────────────── -->
          <div id="tab-rules" class="tab-content">
            <div class="page-header">
              <div>
                <h2 class="page-title">Deterministic Automation Rules &amp; AI Authoring</h2>
                <div class="page-desc">AI synthesizes JSON AST proposals; deterministic engine runs approved rules with zero eval()</div>
              </div>
            </div>

            <!-- AI Authoring Panel -->
            <div class="prompt-panel">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">
                  AI Rule Synthesis Console (Google Gemini Validation Loop)
                </span>
                <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-secondary); background: var(--bg-muted); padding: 2px 8px; border-radius: var(--radius-xs);">
                  POST /api/rules/ai-draft
                </span>
              </div>
              <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 12px;">
                Describe an automation intent in plain English. The AI generates a validated RuleDraft JSON conforming to strict Zod schema with approved=false.
              </p>
              <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                <input type="text" class="input" id="ai-rule-prompt" value="Notify operations if temperature exceeds 75°C for 3 consecutive readings" />
                <button class="btn btn-primary" id="btn-generate-ai-rule">Synthesize Rule</button>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('Alert sales VP when a CRM deal over $100k is closed won')">Deal Won Alert</button>
                <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('When IoT battery level falls below 15% queue recharge command')">Battery Low Command</button>
                <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('If customer revokes GDPR consent anonymize personal data immediately')">Consent Erasure</button>
              </div>

              <!-- Output AST Preview -->
              <div id="ai-rule-preview" style="display: none; margin-top: 16px; border-top: 1px solid var(--border-default); padding-top: 14px;">
                <div style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">
                  Validated Rule Draft AST (Awaiting Human Approval Gate):
                </div>
                <pre class="code-block" id="ai-rule-json"></pre>
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                  <button class="btn btn-primary btn-sm" id="btn-approve-ai-draft">Approve &amp; Deploy Rule (Human Gate)</button>
                  <button class="btn btn-secondary btn-sm" id="btn-discard-ai-draft">Discard Draft</button>
                </div>
              </div>
            </div>

            <!-- Existing Rules Table -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">Active &amp; Draft Automation Rules</div>
              </div>
              <div id="rules-list-container" style="display: flex; flex-direction: column; gap: 10px;"></div>
            </div>
          </div>

          <!-- ── CRM TAB ─────────────────────────────────────────────────── -->
          <div id="tab-crm" class="tab-content">
            <div class="page-header">
              <div>
                <h2 class="page-title">CRM Sales Pipeline</h2>
                <div class="page-desc">Tenant-scoped opportunities, pipeline deal stages, and revenue metrics</div>
              </div>
              <button class="btn btn-primary" id="btn-add-lead">+ Create Opportunity</button>
            </div>

            <div class="kanban-board" id="kanban-container"></div>
          </div>

          <!-- ── COMPLIANCE TAB ───────────────────────────────────────────── -->
          <div id="tab-compliance" class="tab-content">
            <div class="page-header">
              <div>
                <h2 class="page-title">Compliance, Vault &amp; Privacy Suite</h2>
                <div class="page-desc">GDPR &amp; NDPR regulatory compliance, AES-256-GCM envelope encryption, and Right-to-be-Forgotten</div>
              </div>
            </div>

            <div class="grid-2" style="margin-bottom: 24px;">
              <!-- Cryptographic Envelope Simulator -->
              <div class="card">
                <div class="card-title">Field-Level AEAD Encryption</div>
                <div class="card-subtitle" style="margin-bottom: 14px;">
                  Derived tenant key: <code>HMAC-SHA256(masterKey, 'tenant:<id>')</code>
                </div>
                <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Sensitive Plaintext PII:</label>
                <input type="text" class="input" id="pii-input" value="john.enterprise@finance-corp.gov" style="margin: 4px 0 12px 0;" />
                
                <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">AES-256-GCM Envelope:</div>
                <div class="crypto-display" id="crypto-envelope-display">enc:v1:7f4c9a2d...</div>

                <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; margin-top: 10px;">Deterministic HMAC Blind Index:</div>
                <div class="crypto-display" id="crypto-blind-display" style="color: var(--primary);">blind:e8b417c...</div>
              </div>

              <!-- Right to be Forgotten / Erasure -->
              <div class="card">
                <div class="card-title">Right to be Forgotten (GDPR / NDPR)</div>
                <div class="card-subtitle" style="margin-bottom: 14px;">
                  Permanent pseudonymization of PII across CRM and Consent records
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                  <input type="text" class="input" id="erasure-subject-input" placeholder="Subject Email or UUID" value="david.k@global-cloud.com" />
                  <button class="btn btn-danger" id="btn-execute-erasure">Execute Erasure</button>
                </div>
                <div style="background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-default); font-size: 0.8rem; line-height: 1.5;">
                  <div>Fulfilled Erasure Requests: <strong style="color: var(--text-main);" id="erasure-counter">${state.erasureRequestsCount}</strong></div>
                  <div>Sanitized Records: <strong style="color: var(--primary);" id="anonymized-counter">${state.anonymizedCount}</strong></div>
                  <div style="color: var(--text-secondary); font-size: 0.74rem; margin-top: 4px;">
                    Replaces PII with <code>[REDACTED]</code>, wipes contact numbers, and revokes active consent grants.
                  </div>
                </div>
              </div>
            </div>

            <!-- Consent Registry -->
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title">GDPR / NDPR Consent Ledger</div>
                  <div class="card-subtitle">Verifiable timestamps and lawful basis tracking</div>
                </div>
                <button class="btn btn-secondary btn-sm" id="btn-grant-consent">+ Grant Subject Consent</button>
              </div>

              <div id="consent-table-container"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  setupEventListeners();
  renderDevices();
  renderRules();
  renderKanban();
  renderConsents();
  updateCryptoPreview();
  renderEventLog();
}

// ── Event Handlers ───────────────────────────────────────────────────────────
function setupEventListeners() {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((i) => i.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((tc) => tc.classList.remove('active'));

      item.classList.add('active');
      const tabId = item.getAttribute('data-tab');
      if (tabId) {
        state.currentTab = tabId;
        const target = document.getElementById(`tab-${tabId}`);
        if (target) target.classList.add('active');
      }
    });
  });

  // Topbar and Sidebar Navigation
  document.getElementById('brand-header-to-home')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('btn-topbar-home')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('btn-topbar-signout')?.addEventListener('click', () => navigateTo('signin'));
  document.getElementById('btn-sidebar-home')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('btn-sidebar-signout')?.addEventListener('click', () => navigateTo('signin'));

  // Tenant switch
  const tenantSelect = document.getElementById('tenantSelect') as HTMLSelectElement;
  tenantSelect?.addEventListener('change', (e) => {
    const val = (e.target as HTMLSelectElement).value;
    state.activeTenant = val;
    logBusEvent('tenant.context.switched', { tenantId: val, rlsStatus: 'enforced' });
  });

  // Quick actions
  document.getElementById('btn-quick-telemetry')?.addEventListener('click', () => {
    triggerTelemetryPing('dev-1', 79.4, 55, 3.2);
  });

  document.getElementById('btn-quick-lead')?.addEventListener('click', () => {
    createLead('Enterprise Analytics Platform', 'CloudScale Inc', 95000, 'Qualified');
  });

  document.getElementById('btn-quick-encrypt')?.addEventListener('click', () => {
    const input = document.getElementById('pii-input') as HTMLInputElement;
    if (input) {
      input.value = `confidential_${Date.now()}@secure-enterprise.org`;
      updateCryptoPreview();
    }
  });

  // Crypto preview
  document.getElementById('pii-input')?.addEventListener('input', updateCryptoPreview);

  // AI rule generation
  document.getElementById('btn-generate-ai-rule')?.addEventListener('click', generateAiRule);
  document.getElementById('btn-approve-ai-draft')?.addEventListener('click', approveAiDraft);
  document.getElementById('btn-discard-ai-draft')?.addEventListener('click', () => {
    const box = document.getElementById('ai-rule-preview');
    if (box) box.style.display = 'none';
  });

  // Erasure execute
  document.getElementById('btn-execute-erasure')?.addEventListener('click', () => {
    const input = document.getElementById('erasure-subject-input') as HTMLInputElement;
    const subject = input?.value || 'unknown_subject';
    executeSubjectErasure(subject);
  });

  // Device register
  document.getElementById('btn-open-register-device')?.addEventListener('click', () => {
    const name = prompt('Enter edge device name:', 'Warehouse Environmental Monitor');
    if (!name) return;
    const key = `iot_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.floor(Math.random() * 100)}`;
    state.devices.push({
      id: `dev-${Date.now()}`,
      name,
      key,
      kind: 'multi_sensor',
      status: 'online',
      temperature: 22.0,
      humidity: 50,
      voltage: 3.3,
      firmware: 'v2.2.0',
      lastSeen: 'Just now',
    });
    const token = `zex_dev_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    renderDevices();
    logBusEvent('iot.device.registered', { deviceKey: key, tokenHash: 'sha256_verified' });
    alert(`Device registered successfully!\n\nSingle-Use Secret Token:\n${token}\n\n(Stored securely with SHA-256 token hashing)`);
  });

  // Add lead
  document.getElementById('btn-add-lead')?.addEventListener('click', () => {
    const title = prompt('Opportunity Name:', 'Smart Metering Expansion');
    if (!title) return;
    const company = prompt('Company Name:', 'Metropolis Energy');
    if (!company) return;
    const val = parseInt(prompt('Estimated Deal Value ($):', '65000') || '65000', 10);
    createLead(title, company, val, 'New');
  });

  // Grant consent
  document.getElementById('btn-grant-consent')?.addEventListener('click', () => {
    const sub = prompt('Subject Email or ID:', 'patricia.miller@global-enterprise.com');
    if (!sub) return;
    const purpose = prompt('Purpose (e.g. telemetry_processing, data_analytics):', 'telemetry_processing');
    if (!purpose) return;
    state.consents.unshift({
      id: `c-${Date.now()}`,
      subjectId: sub,
      purpose,
      legalBasis: 'consent',
      grantedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      revokedAt: null,
    });
    renderConsents();
    logBusEvent('compliance.consent.granted', { subjectId: sub, purpose, legalBasis: 'consent' });
  });
}

(window as any).setAiPrompt = (txt: string) => {
  const input = document.getElementById('ai-rule-prompt') as HTMLInputElement;
  if (input) input.value = txt;
};

// ── IoT Render ───────────────────────────────────────────────────────────────
function renderDevices() {
  const tbody = document.getElementById('device-table-body');
  if (!tbody) return;

  tbody.innerHTML = state.devices.map((d) => `
    <tr>
      <td>
        <div style="font-weight: 600; color: var(--text-main);">${d.name}</div>
        <div style="font-size: 0.72rem; color: var(--text-secondary); font-family: var(--font-mono);">${d.key}</div>
      </td>
      <td style="color: var(--text-secondary); font-size: 0.8rem;"><code>${d.kind}</code></td>
      <td>
        <span class="badge-status ${d.status}">${d.status}</span>
      </td>
      <td>
        <strong style="color: ${d.temperature > 70 ? 'var(--primary)' : 'var(--text-main)'}; font-family: var(--font-mono);">
          ${d.temperature}°C
        </strong>
      </td>
      <td style="font-family: var(--font-mono);">${d.humidity}%</td>
      <td style="font-family: var(--font-mono);">${d.voltage}V</td>
      <td style="font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono);">${d.firmware}</td>
      <td style="font-size: 0.78rem; color: var(--text-secondary);">${d.lastSeen}</td>
      <td style="text-align: right;">
        <button class="btn btn-secondary btn-sm" onclick="window.pingDevice('${d.id}')">📡 Ingest Ping</button>
      </td>
    </tr>
  `).join('');

  const onlineCount = state.devices.filter((d) => d.status === 'online').length;
  const statOnline = document.getElementById('stat-online-devices');
  if (statOnline) statOnline.innerText = `${onlineCount} / ${state.devices.length}`;
}

(window as any).pingDevice = (id: string) => {
  const dev = state.devices.find((d) => d.id === id);
  if (!dev) return;
  const temp = parseFloat((dev.temperature + (Math.random() * 4 - 2)).toFixed(1));
  const hum = Math.min(99, Math.max(10, Math.round(dev.humidity + (Math.random() * 6 - 3))));
  triggerTelemetryPing(id, temp, hum, dev.voltage);
};

function triggerTelemetryPing(deviceId: string, temp: number, humidity: number, voltage: number) {
  const dev = state.devices.find((d) => d.id === deviceId);
  if (dev) {
    dev.temperature = temp;
    dev.humidity = humidity;
    dev.voltage = voltage;
    dev.status = 'online';
    dev.lastSeen = 'Just now';
  }
  renderDevices();

  logBusEvent('iot.telemetry.received', { deviceId, metrics: { temperature: temp, humidity, voltage } });

  if (temp > 75) {
    logBusEvent('iot.alert.triggered', {
      deviceId,
      metric: 'temperature',
      actualValue: temp,
      threshold: 75,
      severity: 'critical',
      action: 'rules_engine_dispatched',
    });
  }
}

// ── Rules Render ─────────────────────────────────────────────────────────────
let currentDraftRule: Rule | null = null;

function renderRules() {
  const container = document.getElementById('rules-list-container');
  if (!container) return;

  container.innerHTML = state.rules.map((r) => `
    <div style="background: var(--bg-subtle); border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <strong style="font-size: 0.9rem; color: var(--text-main);">${r.name}</strong>
          ${r.approved ? '<span class="badge-status online">ACTIVE</span>' : '<span class="badge-status" style="background: var(--warning-bg); color: var(--warning); border: 1px solid var(--warning-border);">PENDING APPROVAL</span>'}
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.76rem; color: var(--text-secondary); margin-top: 4px;">
          <span>Trigger: <strong style="color: var(--text-main);">${r.trigger}</strong></span> |
          <span>Condition: <code>${r.conditions}</code></span> |
          <span>Action: <code>${r.action}</code></span>
        </div>
      </div>
      <div>
        ${!r.approved ? `<button class="btn btn-primary btn-sm" onclick="window.approveRule('${r.id}')">Approve Rule</button>` : `<button class="btn btn-secondary btn-sm" onclick="window.toggleRule('${r.id}')">${r.enabled ? 'Disable' : 'Enable'}</button>`}
      </div>
    </div>
  `).join('');
}

(window as any).approveRule = (id: string) => {
  const rule = state.rules.find((r) => r.id === id);
  if (rule) {
    rule.approved = true;
    renderRules();
    logBusEvent('rules.rule.activated', { ruleId: id, name: rule.name });
  }
};

(window as any).toggleRule = (id: string) => {
  const rule = state.rules.find((r) => r.id === id);
  if (rule) {
    rule.enabled = !rule.enabled;
    renderRules();
    logBusEvent(rule.enabled ? 'rules.rule.enabled' : 'rules.rule.disabled', { ruleId: id });
  }
};

function generateAiRule() {
  const input = document.getElementById('ai-rule-prompt') as HTMLInputElement;
  const intent = input?.value || 'High temperature threshold monitor';

  currentDraftRule = {
    id: `rule-${Date.now()}`,
    name: intent.length > 50 ? `${intent.substring(0, 47)}...` : intent,
    trigger: intent.toLowerCase().includes('deal') || intent.toLowerCase().includes('crm') ? 'crm.lead.won' : 'iot.telemetry.received',
    conditions: 'metrics.temperature > 75',
    action: 'emit: ops.notification.dispatched',
    approved: false,
    enabled: true,
  };

  const astJson = {
    $schema: 'https://zexcore.org/schema/v1/rule.json',
    name: currentDraftRule.name,
    trigger: { source: currentDraftRule.trigger },
    conditions: {
      all: [
        { field: 'metrics.temperature', op: 'gt', value: 75 },
      ],
    },
    actions: [
      { type: 'emit', event: 'ops.notification.dispatched', payload: { channel: 'ops_alert', priority: 'high' } },
    ],
    approved: false,
    aiGenerated: true,
  };

  const preview = document.getElementById('ai-rule-preview');
  const jsonPre = document.getElementById('ai-rule-json');
  if (preview && jsonPre) {
    jsonPre.textContent = JSON.stringify(astJson, null, 2);
    preview.style.display = 'block';
  }

  logBusEvent('rules.ai_draft.synthesized', { intent, generatedAST: 'RuleDraftSchema.verified' });
}

function approveAiDraft() {
  if (currentDraftRule) {
    currentDraftRule.approved = true;
    state.rules.unshift(currentDraftRule);
    renderRules();
    logBusEvent('rules.rule.activated', { ruleId: currentDraftRule.id, name: currentDraftRule.name });
    currentDraftRule = null;
    const preview = document.getElementById('ai-rule-preview');
    if (preview) preview.style.display = 'none';
  }
}

// ── CRM Kanban Render ────────────────────────────────────────────────────────
function renderKanban() {
  const container = document.getElementById('kanban-container');
  if (!container) return;

  container.innerHTML = state.stages.map((stage) => {
    const stageLeads = state.leads.filter((l) => l.stage === stage);
    const totalVal = stageLeads.reduce((acc, l) => acc + l.value, 0);

    return `
      <div class="kanban-column">
        <div class="kanban-header">
          <span class="kanban-title">${stage}</span>
          <span class="kanban-metric">${stageLeads.length} · $${totalVal.toLocaleString()}</span>
        </div>
        <div class="kanban-cards">
          ${stageLeads.map((l) => `
            <div class="lead-card">
              <div class="lead-title">${l.title}</div>
              <div class="lead-company">${l.company}</div>
              <div class="lead-meta">
                <span class="lead-value">$${l.value.toLocaleString()}</span>
                <button class="btn btn-secondary btn-sm" onclick="window.advanceLead('${l.id}')">Advance →</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  const total = state.leads.reduce((a, b) => a + b.value, 0);
  const el = document.getElementById('stat-total-pipeline');
  if (el) el.innerText = `$${total.toLocaleString()}`;
}

(window as any).advanceLead = (id: string) => {
  const lead = state.leads.find((l) => l.id === id);
  if (!lead) return;
  const idx = state.stages.indexOf(lead.stage);
  if (idx < state.stages.length - 1) {
    lead.stage = state.stages[idx + 1]!;
    renderKanban();
    logBusEvent('crm.lead.stage_changed', { leadId: id, newStage: lead.stage, value: lead.value });
    if (lead.stage === 'Closed Won') {
      logBusEvent('crm.lead.won', { leadId: id, value: lead.value, title: lead.title });
    }
  }
};

function createLead(title: string, company: string, value: number, stage: string) {
  const lead: Lead = {
    id: `lead-${Date.now()}`,
    title,
    company,
    value,
    currency: 'USD',
    stage,
  };
  state.leads.unshift(lead);
  renderKanban();
  logBusEvent('crm.lead.created', { leadId: lead.id, title, value, stage });
}

// ── Compliance Render ────────────────────────────────────────────────────────
function updateCryptoPreview() {
  const input = document.getElementById('pii-input') as HTMLInputElement;
  const val = input ? input.value : 'user@example.com';

  const hex = Array.from(val).map((c) => c.charCodeAt(0).toString(16)).join('');
  const iv = '4a9f1c7e8b02';
  const tag = '9b2c3d4e5f6a7b8c';
  const envelope = `enc:v1:${iv}:${tag}:${hex.substring(0, 40)}`;
  const blind = `blind:${hex.substring(0, 16)}fa79c02d4`;

  const envEl = document.getElementById('crypto-envelope-display');
  const blnEl = document.getElementById('crypto-blind-display');
  if (envEl) envEl.innerText = envelope;
  if (blnEl) blnEl.innerText = blind;
}

function renderConsents() {
  const container = document.getElementById('consent-table-container');
  if (!container) return;

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Subject Identifier</th>
          <th>Purpose</th>
          <th>Lawful Basis</th>
          <th>Granted Date</th>
          <th>Status</th>
          <th style="text-align: right;">Action</th>
        </tr>
      </thead>
      <tbody>
        ${state.consents.map((c) => `
          <tr>
            <td style="font-family: var(--font-mono); font-size: 0.8rem;">${c.subjectId}</td>
            <td><code>${c.purpose}</code></td>
            <td><span class="badge-status active" style="font-size: 0.68rem;">${c.legalBasis}</span></td>
            <td style="color: var(--text-secondary); font-size: 0.78rem;">${c.grantedAt}</td>
            <td>
              ${c.revokedAt ? '<span class="badge-status" style="background: var(--error-bg); color: var(--error); border: 1px solid var(--error-border);">REVOKED</span>' : '<span class="badge-status online">ACTIVE</span>'}
            </td>
            <td style="text-align: right;">
              ${!c.revokedAt ? `<button class="btn btn-danger btn-sm" onclick="window.revokeConsent('${c.id}')">Revoke</button>` : '<span style="color: var(--text-muted); font-size: 0.74rem;">Archived</span>'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

(window as any).revokeConsent = (id: string) => {
  const c = state.consents.find((item) => item.id === id);
  if (c) {
    c.revokedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    renderConsents();
    logBusEvent('compliance.consent.revoked', { subjectId: c.subjectId, purpose: c.purpose });
  }
};

function executeSubjectErasure(subjectId: string) {
  state.erasureRequestsCount++;
  state.anonymizedCount += 3;

  state.consents.forEach((c) => {
    if (c.subjectId.includes(subjectId) || subjectId.includes(c.subjectId)) {
      c.revokedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
  });
  renderConsents();

  const eraCounter = document.getElementById('erasure-counter');
  const anoCounter = document.getElementById('anonymized-counter');
  if (eraCounter) eraCounter.innerText = state.erasureRequestsCount.toString();
  if (anoCounter) anoCounter.innerText = state.anonymizedCount.toString();

  logBusEvent('compliance.erasure.completed', {
    subjectId,
    sanitizedRecords: 3,
    anonymizedMask: '[REDACTED]',
    hashChainedAuditLedger: 'SHA256_APPEND_ONLY',
  });

  alert(`Right to be Forgotten Executed for: ${subjectId}\n\n- CRM Personal Records: Anonymized to [REDACTED]\n- Consents: Revoked\n- Tamper-evident Audit Ledger Entry Appended`);
}

// ── Event Log Stream ─────────────────────────────────────────────────────────
function renderEventLog() {
  const container = document.getElementById('event-stream-body');
  if (!container) return;

  container.innerHTML = state.events.map((e) => `
    <div class="log-row">
      <span class="log-time">[${e.ts}]</span>
      <span class="log-topic">${e.name}</span>
      <span class="log-data">${e.payload}</span>
    </div>
  `).join('');
}

// ── Marketing Homepage ───────────────────────────────────────────────────────
function renderMarketingHome() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <header class="marketing-header">
      <div style="display: flex; align-items: center; gap: 20px;">
        <img src="/zexcore-logo-horizontal.png" alt="ZexCore Logo" class="marketing-logo" id="mkt-logo" />
      </div>
      <nav class="marketing-nav-links">
        <a href="#architecture" class="marketing-nav-link">Architecture</a>
        <a href="#modules" class="marketing-nav-link">Modules</a>
        <a href="#security" class="marketing-nav-link">Security &amp; RLS</a>
        <a href="#compliance" class="marketing-nav-link">Compliance</a>
      </nav>
      <div class="marketing-nav-actions">
        <button class="btn btn-secondary btn-sm" id="btn-nav-signin">Sign In</button>
        <button class="btn btn-primary btn-sm" id="btn-nav-launch">Launch Console &rarr;</button>
      </div>
    </header>

    <main>
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-pill">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--primary);"></span>
          ENTERPRISE INFRASTRUCTURE PLATFORM
        </div>
        <h1 class="hero-title">
          One Core. <span>Infinite Possibilities.</span>
        </h1>
        <p class="hero-desc">
          The sovereign multi-tenant foundation engineered for mission-critical IoT telemetry, deterministic rules automation, isolated CRM pipelines, and cryptographic compliance vaults.
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary btn-lg" id="btn-hero-launch" style="padding: 12px 28px; font-size: 0.95rem;">
            Launch Control Console &rarr;
          </button>
          <button class="btn btn-secondary btn-lg" id="btn-hero-signin" style="padding: 12px 24px; font-size: 0.95rem;">
            Sign In to Workspace
          </button>
        </div>

        <div class="hero-showcase">
          <img src="/zexcore-logo-full.png" alt="ZexCore &mdash; One Core Infinite Possibilities" class="hero-showcase-logo" />
          <div class="hero-stats-row">
            <div class="hero-stat-col">
              <div class="hero-stat-number">100% RLS</div>
              <div class="hero-stat-title">Row-Level Security</div>
              <div class="hero-stat-subtitle">PostgreSQL 17 Hard Isolation</div>
            </div>
            <div class="hero-stat-col">
              <div class="hero-stat-number">&lt; 1ms</div>
              <div class="hero-stat-title">Rules Engine</div>
              <div class="hero-stat-subtitle">Deterministic Safe AST Sandbox</div>
            </div>
            <div class="hero-stat-col">
              <div class="hero-stat-number">AES-256-GCM</div>
              <div class="hero-stat-title">Envelope Encryption</div>
              <div class="hero-stat-subtitle">Blind Indexing &amp; Key Rotation</div>
            </div>
            <div class="hero-stat-col">
              <div class="hero-stat-number">5 Modules</div>
              <div class="hero-stat-title">EventBus Mesh</div>
              <div class="hero-stat-subtitle">Decoupled Pub-Sub Ingest</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Architecture Section -->
      <section class="marketing-features" id="architecture" style="border-top: 1px solid var(--border-default);">
        <div class="section-label">FOUNDATIONAL ARCHITECTURE</div>
        <h2 class="section-heading">Engineered for Strict Sovereign Multi-Tenancy</h2>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 class="feature-title">Row-Level Security (RLS)</h3>
            <p class="feature-text">
              Every database transaction runs inside a session scoped to <code>tenant_id</code>. Composite keys prevent cross-tenant referencing, guaranteeing complete isolation at the storage layer.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
            <h3 class="feature-title">Asynchronous EventBus Broker</h3>
            <p class="feature-text">
              Decoupled publish-subscribe messaging links telemetry ingest, automated rules evaluation, sales pipeline transitions, and compliance audit events in real time.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
            </div>
            <h3 class="feature-title">Cryptographic Privacy Vault</h3>
            <p class="feature-text">
              Automated PII envelope encryption using AES-256-GCM, blind HMAC search indexing, and 1-click GDPR Article 17 Right-to-be-Forgotten erasure pipelines.
            </p>
          </div>
        </div>
      </section>

      <!-- Modules Section -->
      <section class="marketing-features" id="modules" style="background: #FFFFFF; border-top: 1px solid var(--border-default); border-bottom: 1px solid var(--border-default);">
        <div class="section-label">UNIFIED SYSTEM MODULES</div>
        <h2 class="section-heading">Five Specialized Engines. One Clean Core.</h2>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 class="feature-title">IoT Fleet &amp; Telemetry Gateway</h3>
            <p class="feature-text">
              Token-authenticated device ingestion (<code>X-Device-Token</code>), real-time time-series telemetry streams, threshold alerts, and bidirectional command dispatch.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>
            </div>
            <h3 class="feature-title">Rules &amp; AI Authoring Engine</h3>
            <p class="feature-text">
              Deterministic AST condition validation with strict zero-eval execution, paired with an LLM-assisted rule generator with mandatory human approval workflows.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 class="feature-title">Enterprise CRM Sales Pipeline</h3>
            <p class="feature-text">
              Multi-currency deals tracking, Kanban stage progression, contact governance, and deal velocity analytics protected by multi-tenant RLS.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 class="feature-title">Compliance &amp; Vault</h3>
            <p class="feature-text">
              Cryptographic envelope encryption, GDPR consent registry with verifiable lawful basis timestamps, and automated subject pseudonymization.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </div>
            <h3 class="feature-title">Core Multi-Tenant Runtime</h3>
            <p class="feature-text">
              Central schema migrations, automated tenant provisioning, hash-chained audit trails, and Fastify HTTP plugin bootstrap system.
            </p>
          </div>

          <div class="feature-card" style="display: flex; flex-direction: column; justify-content: center; background: var(--primary-subtle); border-color: var(--primary-border);">
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--primary); margin-bottom: 6px;">READY FOR PRODUCTION</div>
            <h3 class="feature-title" style="margin-bottom: 10px;">Experience ZexCore Live</h3>
            <p class="feature-text" style="margin-bottom: 18px;">
              Jump directly into the control console with pre-authenticated demo tenants.
            </p>
            <button class="btn btn-primary" id="btn-card-launch" style="align-self: flex-start;">Open Control Console &rarr;</button>
          </div>
        </div>
      </section>

      <!-- Pre-footer CTA -->
      <section style="padding: 60px 24px; text-align: center; max-width: 960px; margin: 0 auto;">
        <h2 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 12px;">
          Deploy Your Enterprise SaaS Infrastructure
        </h2>
        <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto 28px auto; font-size: 1.05rem;">
          Clean Red &amp; White design, hardened security, and multi-tenant isolation out of the box.
        </p>
        <div style="display: flex; gap: 14px; justify-content: center;">
          <button class="btn btn-primary btn-lg" id="btn-cta-launch" style="padding: 12px 28px;">Launch Control Console &rarr;</button>
          <button class="btn btn-secondary btn-lg" id="btn-cta-signin" style="padding: 12px 24px;">Sign In to Workspace</button>
        </div>
      </section>
    </main>

    <footer class="marketing-footer">
      <div class="footer-inner">
        <div style="display: flex; align-items: center; gap: 16px;">
          <img src="/zexcore-logo-horizontal.png" alt="ZexCore" class="marketing-logo" id="footer-logo" style="cursor: pointer;" />
          <span style="font-size: 0.85rem; color: var(--text-secondary);">One Core. Infinite Possibilities.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 24px; font-size: 0.82rem; color: var(--text-secondary);">
          <div class="status-pill"><div class="status-dot"></div><span>All Systems Operational</span></div>
          <span>&copy; 2026 ZexCore Systems Inc.</span>
        </div>
      </div>
    </footer>
  `;

  // Bind Marketing Events
  document.getElementById('mkt-logo')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('footer-logo')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('btn-nav-signin')?.addEventListener('click', () => navigateTo('signin'));
  document.getElementById('btn-nav-launch')?.addEventListener('click', () => navigateTo('dashboard'));
  document.getElementById('btn-hero-launch')?.addEventListener('click', () => navigateTo('dashboard'));
  document.getElementById('btn-hero-signin')?.addEventListener('click', () => navigateTo('signin'));
  document.getElementById('btn-card-launch')?.addEventListener('click', () => navigateTo('dashboard'));
  document.getElementById('btn-cta-launch')?.addEventListener('click', () => navigateTo('dashboard'));
  document.getElementById('btn-cta-signin')?.addEventListener('click', () => navigateTo('signin'));
}

// ── Sign In / Authentication Page ───────────────────────────────────────────
function renderSignIn() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <img src="/zexcore-logo-horizontal.png" alt="ZexCore" class="auth-logo" id="auth-logo-link" style="cursor: pointer;" />
          <h2 class="auth-title">Sign in to ZexCore Control</h2>
          <p class="auth-subtitle">Access your enterprise workspace and control plane</p>
        </div>

        <form id="auth-form" onsubmit="event.preventDefault();">
          <div class="form-group">
            <label class="form-label" for="auth-workspace">Workspace Domain</label>
            <div style="display: flex; align-items: center;">
              <input type="text" id="auth-workspace" class="input" value="${state.activeTenant}" placeholder="e.g. acme_corp" style="border-top-right-radius: 0; border-bottom-right-radius: 0;" />
              <span style="background: var(--bg-subtle); border: 1px solid var(--border-default); border-left: none; padding: 8px 12px; font-size: 0.82rem; color: var(--text-secondary); border-top-right-radius: var(--radius-sm); border-bottom-right-radius: var(--radius-sm); font-family: var(--font-mono);">.zexcore.io</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="auth-email">Work Email</label>
            <input type="email" id="auth-email" class="input" value="admin@${state.activeTenant}.com" placeholder="name@company.com" />
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="form-label" for="auth-password" style="margin-bottom: 0;">Password</label>
              <a href="javascript:void(0)" style="font-size: 0.75rem; color: var(--primary); text-decoration: none;">Forgot password?</a>
            </div>
            <input type="password" id="auth-password" class="input" value="••••••••••••" placeholder="Enter password" />
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); cursor: pointer;">
              <input type="checkbox" checked style="accent-color: var(--primary);" /> Remember this device
            </label>
            <span class="status-pill" style="font-size: 0.7rem;"><span class="status-dot"></span>SSO Ready</span>
          </div>

          <button type="button" class="btn btn-primary" id="btn-submit-signin" style="width: 100%; padding: 10px; font-size: 0.9rem; justify-content: center;">
            Sign In to Workspace &rarr;
          </button>
        </form>

        <div class="auth-divider">
          <span>OR 1-CLICK DEMO ACCESS</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-secondary" id="btn-demo-acme" style="justify-content: space-between; font-size: 0.82rem;">
            <span>🏢 <strong>Acme Enterprise Corp</strong></span>
            <span class="tier-badge">Admin Role</span>
          </button>
          <button class="btn btn-secondary" id="btn-demo-globex" style="justify-content: space-between; font-size: 0.82rem;">
            <span>🔬 <strong>Globex Research</strong></span>
            <span class="tier-badge">Ops Lead</span>
          </button>
          <button class="btn btn-secondary" id="btn-demo-soylent" style="justify-content: space-between; font-size: 0.82rem;">
            <span>🌱 <strong>Soylent Dynamics</strong></span>
            <span class="tier-badge">Compliance</span>
          </button>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="#home" id="link-back-home" style="font-size: 0.84rem; color: var(--text-secondary); text-decoration: none;">
            &larr; Return to Public Website
          </a>
        </div>
      </div>
    </div>
  `;

  // Bind Auth Events
  document.getElementById('auth-logo-link')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('link-back-home')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('home');
  });

  document.getElementById('btn-submit-signin')?.addEventListener('click', () => {
    const slug = (document.getElementById('auth-workspace') as HTMLInputElement)?.value || 'acme_corp';
    state.activeTenant = slug.replace(/[^a-zA-Z0-9_]/g, '_');
    logBusEvent('auth.session.created', { tenant: state.activeTenant, method: 'password', status: 'authenticated' });
    navigateTo('dashboard');
  });

  document.getElementById('btn-demo-acme')?.addEventListener('click', () => {
    state.activeTenant = 'acme_corp';
    logBusEvent('auth.demo.session', { tenant: 'acme_corp', role: 'enterprise_admin' });
    navigateTo('dashboard');
  });

  document.getElementById('btn-demo-globex')?.addEventListener('click', () => {
    state.activeTenant = 'globex_corp';
    logBusEvent('auth.demo.session', { tenant: 'globex_corp', role: 'operations_lead' });
    navigateTo('dashboard');
  });

  document.getElementById('btn-demo-soylent')?.addEventListener('click', () => {
    state.activeTenant = 'soylent_ind';
    logBusEvent('auth.demo.session', { tenant: 'soylent_ind', role: 'compliance_officer' });
    navigateTo('dashboard');
  });
}

// ── Application Router ───────────────────────────────────────────────────────
function renderApp() {
  if (state.currentView === 'home') {
    renderMarketingHome();
  } else if (state.currentView === 'signin') {
    renderSignIn();
  } else {
    renderDashboard();
  }
}

function syncRouteFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  if (hash === 'signin' || hash === 'login') {
    state.currentView = 'signin';
  } else if (hash === 'dashboard' || hash === 'app' || hash === 'console') {
    state.currentView = 'dashboard';
  } else {
    state.currentView = 'home';
  }
  renderApp();
}

function navigateTo(view: 'home' | 'signin' | 'dashboard') {
  if (view === 'home') {
    window.location.hash = '';
  } else {
    window.location.hash = view;
  }
  syncRouteFromHash();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
(window as any).navigateTo = navigateTo;

function initApp() {
  window.addEventListener('hashchange', () => {
    syncRouteFromHash();
  });
  syncRouteFromHash();
}

document.addEventListener('DOMContentLoaded', initApp);
