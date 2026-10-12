/**
 * ZexCore Platform Control Plane & Module Preview
 * Interactive client-side preview suite for IoT, Rules, CRM, and Compliance
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
  currentTab: 'overview',
  activeTenant: 'acme_corp',
  tenantName: 'Acme Enterprise Solutions',
  devices: [
    { id: 'dev-1', name: 'Factory Floor Temp Sensor', key: 'iot_temp_sensor_01', kind: 'temperature_sensor', status: 'online', temperature: 24.8, humidity: 58, voltage: 3.3, lastSeen: 'Just now' },
    { id: 'dev-2', name: 'Cold Storage Monitor', key: 'iot_cold_ch在该_02', kind: 'chiller_probe', status: 'online', temperature: -4.2, humidity: 76, voltage: 3.2, lastSeen: '2m ago' },
    { id: 'dev-3', name: 'Solar Gateway Inverter', key: 'iot_solar_gw_03', kind: 'power_gateway', status: 'offline', temperature: 48.0, humidity: 32, voltage: 48.1, lastSeen: '14m ago' },
  ] as Device[],
  rules: [
    {
      id: 'rule-1',
      name: 'High Temperature Alert (>75°C)',
      trigger: 'iot.telemetry.received',
      conditions: 'metrics.temperature > 75',
      action: 'emit: iot.alert.triggered (severity: critical)',
      approved: true,
      enabled: true,
    },
    {
      id: 'rule-2',
      name: 'VIP Lead Escalation (> $50,000)',
      trigger: 'crm.lead.created',
      conditions: 'lead.value >= 50000',
      action: 'emit: crm.vip_lead.assigned',
      approved: true,
      enabled: true,
    },
    {
      id: 'rule-3',
      name: 'Device Offline Auto-Ticket',
      trigger: 'iot.device.offline',
      conditions: 'device.kind == "power_gateway"',
      action: 'emit: ops.incident.created',
      approved: false,
      enabled: true,
    },
  ] as Rule[],
  stages: ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'],
  leads: [
    { id: 'lead-1', title: 'Global Fleet IoT Expansion', company: 'LogiTrans Int', value: 85000, currency: 'USD', stage: 'Proposal' },
    { id: 'lead-2', title: 'Smart Factory Integration', company: 'Apex Robotics', value: 120000, currency: 'USD', stage: 'Negotiation' },
    { id: 'lead-3', title: 'Cold Chain Compliance Suite', company: 'PharmaCore Lab', value: 45000, currency: 'USD', stage: 'Qualified' },
    { id: 'lead-4', title: 'Energy Microgrid Telemetry', company: 'EcoGrid Dynamics', value: 210000, currency: 'USD', stage: 'Closed Won' },
    { id: 'lead-5', title: 'Edge Sensor Pilot', company: 'Nordic Agro', value: 18000, currency: 'USD', stage: 'New' },
  ] as Lead[],
  consents: [
    { id: 'c-1', subjectId: 'usr_emma_watson@corp.io', purpose: 'telemetry_processing', legalBasis: 'contract', grantedAt: '2026-10-01 10:24:00', revokedAt: null },
    { id: 'c-2', subjectId: 'usr_david_k@enterprise.com', purpose: 'marketing_analytics', legalBasis: 'consent', grantedAt: '2026-09-18 14:12:00', revokedAt: null },
    { id: 'c-3', subjectId: 'usr_alina_p@tech.de', purpose: 'crm_profiling', legalBasis: 'legitimate_interests', grantedAt: '2026-08-11 09:00:00', revokedAt: '2026-10-10 18:30:00' },
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
  if (state.events.length > 25) state.events.pop();
  renderEventLog();
}

// ── Initial Seed Events ──────────────────────────────────────────────────────
logBusEvent('zexcore.system.boot', { status: 'healthy', modules: ['cms', 'crm', 'iot', 'rules', 'compliance'] });
logBusEvent('iot.telemetry.received', { deviceId: 'dev-1', metrics: { temperature: 24.8, humidity: 58 } });
logBusEvent('compliance.consent.granted', { subjectId: 'usr_emma_watson@corp.io', purpose: 'telemetry_processing' });

// ── Render Shell ─────────────────────────────────────────────────────────────
function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="brand-header">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div class="brand-info">
            <h1>ZexCore Control</h1>
            <span>v1.0.0 Enterprise</span>
          </div>
        </div>

        <nav class="nav-menu">
          <div class="nav-item active" data-tab="overview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Overview &amp; Health
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
            CRM Pipeline
            <span class="nav-badge">${state.leads.length}</span>
          </div>
          <div class="nav-item" data-tab="compliance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Compliance &amp; Vault
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="pulse-indicator">
            <div class="pulse-dot"></div>
            <span>RLS Active</span>
          </div>
          <span style="font-family: var(--font-mono); color: var(--text-dim); font-size: 0.75rem;">PostgreSQL 17</span>
        </div>
      </aside>

      <!-- Main Layout -->
      <main class="main-wrapper">
        <header class="topbar">
          <div class="topbar-left">
            <div class="tenant-selector">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              <select id="tenantSelect">
                <option value="acme_corp">Acme Corp (prod-us-east)</option>
                <option value="globex_corp">Globex Labs (dev-eu-west)</option>
                <option value="soylent_ind">Soylent Ind (staging-apac)</option>
              </select>
              <span class="tier-pill">ENTERPRISE TIER</span>
            </div>
          </div>

          <div class="module-badges">
            <div class="module-tag"><span class="dot"></span>core</div>
            <div class="module-tag"><span class="dot"></span>iot</div>
            <div class="module-tag"><span class="dot"></span>rules</div>
            <div class="module-tag"><span class="dot"></span>crm</div>
            <div class="module-tag"><span class="dot"></span>compliance</div>
          </div>
        </header>

        <div class="page-container">
          <!-- OVERVIEW TAB -->
          <div id="tab-overview" class="tab-content active">
            <div class="grid-4" style="margin-bottom: 24px;">
              <div class="stat-box">
                <div class="stat-label">Platform Status</div>
                <div class="stat-value" style="color: var(--accent-emerald);">All Healthy</div>
                <div class="stat-subtext">5 Modules Active</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Connected Devices</div>
                <div class="stat-value" id="stat-online-devices">2 / 3</div>
                <div class="stat-subtext">Telemetry Ingest Active</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Rules Evaluated</div>
                <div class="stat-value">1,428</div>
                <div class="stat-subtext">Zero Runtime Eval()</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Pipeline Value</div>
                <div class="stat-value" id="stat-total-pipeline">$478,000</div>
                <div class="stat-subtext">5 Sales Opportunities</div>
              </div>
            </div>

            <div class="grid-2" style="margin-bottom: 24px;">
              <div class="card">
                <div class="card-header">
                  <div>
                    <div class="card-title">Tenant Security &amp; Isolation Architecture</div>
                    <div class="card-subtitle">Zero data leakage guarantee enforced by Postgres FORCE RLS</div>
                  </div>
                </div>
                <div style="font-size: 0.88rem; line-height: 1.6; color: var(--text-muted);">
                  <p style="margin-bottom: 12px;">
                    Every transaction is guarded with <code>set_config('app.current_tenant_id', :id, true)</code>. All module tables implement composite primary/foreign keys preventing cross-tenant leakage.
                  </p>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px;">
                    <span class="module-tag">FORCE ROW LEVEL SECURITY</span>
                    <span class="module-tag">Composite Foreign Keys</span>
                    <span class="module-tag">AES-256-GCM Vault</span>
                    <span class="module-tag">Tamper-evident Hash Chain</span>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-header">
                  <div>
                    <div class="card-title">Quick Actions</div>
                    <div class="card-subtitle">Test and trigger workflows directly</div>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <button class="btn btn-secondary" id="btn-quick-telemetry">
                    📡 Ingest Simulated High-Temp IoT Reading (79.4°C)
                  </button>
                  <button class="btn btn-secondary" id="btn-quick-lead">
                    💼 Create High-Value Enterprise Deal ($95,000)
                  </button>
                  <button class="btn btn-secondary" id="btn-quick-encrypt">
                    🔐 Encrypt New PII Record with Tenant Key
                  </button>
                </div>
              </div>
            </div>

            <!-- Event Bus Live Stream -->
            <div class="terminal-window">
              <div class="terminal-header">
                <div class="terminal-dot" style="background: #ef4444;"></div>
                <div class="terminal-dot" style="background: #eab308;"></div>
                <div class="terminal-dot" style="background: #22c55e;"></div>
                <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim); margin-left: 8px;">
                  Core EventBus Real-Time Stream (Cross-Module Broker)
                </span>
              </div>
              <div class="terminal-body" id="event-stream-body">
                <!-- Log entries dynamically rendered -->
              </div>
            </div>
          </div>

          <!-- IOT HUB TAB -->
          <div id="tab-iot" class="tab-content">
            <div class="card-header" style="margin-bottom: 24px;">
              <div>
                <h2 style="font-size: 1.4rem; font-weight: 800;">IoT Device Fleet &amp; Telemetry Gateway</h2>
                <div class="card-subtitle">Secure hardware token ingest via <code>POST /api/iot/ingest</code></div>
              </div>
              <button class="btn btn-primary" id="btn-open-register-device">+ Register Edge Device</button>
            </div>

            <div class="device-grid" id="device-cards-container">
              <!-- Rendered devices -->
            </div>
          </div>

          <!-- RULES TAB -->
          <div id="tab-rules" class="tab-content">
            <div class="card-header" style="margin-bottom: 16px;">
              <div>
                <h2 style="font-size: 1.4rem; font-weight: 800;">Deterministic Rules Engine &amp; AI Author</h2>
                <div class="card-subtitle">AI authors draft ASTs; engine executes deterministically after human approval</div>
              </div>
            </div>

            <!-- AI Authoring Box -->
            <div class="ai-prompt-box">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-weight: 700; font-size: 0.95rem; color: var(--primary-light);">
                  ✨ Natural Language Rule Authoring (LLM Validation Loop)
                </span>
                <span style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--accent-cyan);">POST /api/rules/ai-draft</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
                Enter a business policy in plain English. The AI synthesizes a strict AST validated against <code>RuleDraftSchema</code>. It is saved in <code>approved=false</code> status until verified by human review.
              </p>
              <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                <input type="text" class="input" id="ai-rule-prompt" placeholder="e.g. Notify operations team if factory temperature exceeds 80 degrees..." value="Notify operations if temperature exceeds 75°C for 3 consecutive readings" />
                <button class="btn btn-primary" id="btn-generate-ai-rule" style="white-space: nowrap;">Synthesize Rule</button>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('Alert sales VP when a CRM deal over $100k is closed won')">Deal Won Alert</button>
                <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('When IoT battery level falls below 15% queue recharge command')">Battery Low Command</button>
                <button class="btn btn-secondary btn-sm" onclick="setAiPrompt('If customer revokes GDPR consent anonymize personal data immediately')">Consent Erasure</button>
              </div>

              <!-- Output AST Preview -->
              <div id="ai-rule-preview" style="display: none; margin-top: 18px;">
                <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">Generated Validated AST (Ready for Human Approval Gate):</div>
                <pre class="code-viewer" id="ai-rule-json"></pre>
                <div style="margin-top: 12px; display: flex; gap: 10px;">
                  <button class="btn btn-primary btn-sm" id="btn-approve-ai-draft">Approve &amp; Activate Rule (Human Gate)</button>
                  <button class="btn btn-secondary btn-sm" id="btn-discard-ai-draft">Discard Draft</button>
                </div>
              </div>
            </div>

            <!-- Existing Rules Table -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">Registered Automation Rules</div>
              </div>
              <div id="rules-list-container" style="display: flex; flex-direction: column; gap: 12px;">
                <!-- Rendered rules -->
              </div>
            </div>
          </div>

          <!-- CRM TAB -->
          <div id="tab-crm" class="tab-content">
            <div class="card-header" style="margin-bottom: 24px;">
              <div>
                <h2 style="font-size: 1.4rem; font-weight: 800;">Enterprise CRM Sales Pipeline</h2>
                <div class="card-subtitle">Tenant-isolated contacts, pipeline stages, and lead deal tracking</div>
              </div>
              <button class="btn btn-primary" id="btn-add-lead">+ Create Opportunity</button>
            </div>

            <div class="kanban-board" id="kanban-container">
              <!-- Kanban columns rendered -->
            </div>
          </div>

          <!-- COMPLIANCE TAB -->
          <div id="tab-compliance" class="tab-content">
            <div class="card-header" style="margin-bottom: 24px;">
              <div>
                <h2 style="font-size: 1.4rem; font-weight: 800;">Compliance, Data Protection &amp; Crypto Vault</h2>
                <div class="card-subtitle">GDPR / NDPR Subject Rights, AES-256-GCM Envelope Encryption, and Audit Trails</div>
              </div>
            </div>

            <div class="grid-2" style="margin-bottom: 24px;">
              <!-- Cryptographic Envelope Simulator -->
              <div class="card">
                <div class="card-title">🔐 Live Field-Level AEAD Encryption</div>
                <div class="card-subtitle" style="margin-bottom: 16px;">
                  Keys derived per-tenant via <code>HMAC-SHA256(masterKey, 'tenant:<id>')</code>
                </div>
                <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Plaintext Sensitive PII:</label>
                <input type="text" class="input" id="pii-input" value="john.enterprise@finance-corp.gov" style="margin: 6px 0 14px 0;" />
                
                <div style="font-size: 0.78rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">AES-256-GCM AEAD Envelope:</div>
                <div class="crypto-block" id="crypto-envelope-display">enc:v1:7f4c9a2d...</div>

                <div style="font-size: 0.78rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; margin-top: 12px;">HMAC Blind Search Index:</div>
                <div class="crypto-block" id="crypto-blind-display" style="color: #67e8f9;">blind:e8b417c...</div>
              </div>

              <!-- Right to be Forgotten / Erasure -->
              <div class="card">
                <div class="card-title">🗑️ Right to be Forgotten (GDPR / NDPR)</div>
                <div class="card-subtitle" style="margin-bottom: 16px;">
                  Automatic pseudonymization of PII across CRM and Consent records
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 14px;">
                  <input type="text" class="input" id="erasure-subject-input" placeholder="Subject Email or UUID" value="usr_david_k@enterprise.com" />
                  <button class="btn btn-danger" id="btn-execute-erasure" style="white-space: nowrap;">Execute Erasure</button>
                </div>
                <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md); font-size: 0.82rem; line-height: 1.5;">
                  <div>Total Fulfilled Erasure Purges: <strong style="color: var(--accent-emerald);" id="erasure-counter">${state.erasureRequestsCount}</strong></div>
                  <div>Anonymized Fields Sanitized: <strong style="color: var(--accent-cyan);" id="anonymized-counter">${state.anonymizedCount}</strong></div>
                  <div style="color: var(--text-muted); font-size: 0.78rem; margin-top: 6px;">
                    Replaces PII with <code>[REDACTED]</code>, wipes phone numbers, and invalidates active consent grants.
                  </div>
                </div>
              </div>
            </div>

            <!-- Consent Registry -->
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title">GDPR / NDPR Explicit Consent Registry</div>
                  <div class="card-subtitle">Immutable timestamps, lawful basis verification, and revocations</div>
                </div>
                <button class="btn btn-secondary btn-sm" id="btn-grant-consent">+ Grant Subject Consent</button>
              </div>

              <div id="consent-table-container">
                <!-- Rendered consents -->
              </div>
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

// ── Navigation & Events ──────────────────────────────────────────────────────
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

  // Tenant switch
  const tenantSelect = document.getElementById('tenantSelect') as HTMLSelectElement;
  tenantSelect?.addEventListener('change', (e) => {
    const val = (e.target as HTMLSelectElement).value;
    state.activeTenant = val;
    logBusEvent('tenant.context.switched', { tenantId: val, rlsStatus: 'enforced' });
  });

  // Quick action buttons
  document.getElementById('btn-quick-telemetry')?.addEventListener('click', () => {
    triggerTelemetryPing('dev-1', 79.4, 55, 3.2);
  });

  document.getElementById('btn-quick-lead')?.addEventListener('click', () => {
    createLead('Enterprise Analytics Platform', 'CloudScale Inc', 95000, 'Qualified');
  });

  document.getElementById('btn-quick-encrypt')?.addEventListener('click', () => {
    const input = document.getElementById('pii-input') as HTMLInputElement;
    if (input) {
      input.value = `confidential_${Date.now()}@secure-domain.org`;
      updateCryptoPreview();
    }
  });

  // PII input live reactive encrypt
  document.getElementById('pii-input')?.addEventListener('input', updateCryptoPreview);

  // AI Rule generation
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
    const name = prompt('Enter device name:', 'Warehouse Environmental Probe');
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
      lastSeen: 'Just now',
    });
    const token = `zex_dev_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    renderDevices();
    logBusEvent('iot.device.registered', { deviceKey: key, tokenHash: 'sha256_verified' });
    alert(`Device successfully registered!\n\nSingle-Use Secret Token:\n${token}\n\n(Saved to tenant ledger with SHA-256 token hashing)`);
  });

  // Add lead
  document.getElementById('btn-add-lead')?.addEventListener('click', () => {
    const title = prompt('Opportunity Title:', 'Smart Metering Contract');
    if (!title) return;
    const company = prompt('Company Name:', 'Metropolis Power');
    if (!company) return;
    const val = parseInt(prompt('Estimated Deal Value ($):', '65000') || '65000', 10);
    createLead(title, company, val, 'New');
  });

  // Grant consent
  document.getElementById('btn-grant-consent')?.addEventListener('click', () => {
    const sub = prompt('Subject Email or ID:', 'user_patricia@global.com');
    if (!sub) return;
    const purpose = prompt('Purpose (e.g. data_analytics, marketing):', 'data_analytics');
    if (!purpose) return;
    state.consents.unshift({
      id: `c-${Date.now()}`,
      subjectId: sub,
      purpose,
      legalBasis: 'consent',
      grantedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
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

// ── IoT Render & Handlers ────────────────────────────────────────────────────
function renderDevices() {
  const container = document.getElementById('device-cards-container');
  if (!container) return;

  container.innerHTML = state.devices.map((d) => `
    <div class="device-card">
      <div class="device-card-header">
        <div>
          <div style="font-weight: 700; font-size: 1.05rem;">${d.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-mono);">${d.key}</div>
        </div>
        <span class="device-badge ${d.status}">${d.status}</span>
      </div>

      <div class="metric-strip">
        <div class="metric-item">
          <div class="metric-key">Temp</div>
          <div class="metric-val" style="color: ${d.temperature > 70 ? 'var(--accent-rose)' : 'var(--accent-cyan)'};">${d.temperature}°C</div>
        </div>
        <div class="metric-item">
          <div class="metric-key">Humidity</div>
          <div class="metric-val">${d.humidity}%</div>
        </div>
        <div class="metric-item">
          <div class="metric-key">Voltage</div>
          <div class="metric-val">${d.voltage}V</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; font-size: 0.8rem; color: var(--text-muted);">
        <span>Last seen: ${d.lastSeen}</span>
        <button class="btn btn-secondary btn-sm" onclick="window.pingDevice('${d.id}')">📡 Ingest Ping</button>
      </div>
    </div>
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

  // Evaluate alerts
  if (temp > 75) {
    logBusEvent('iot.alert.triggered', {
      deviceId,
      metric: 'temperature',
      actualValue: temp,
      threshold: 75,
      severity: 'critical',
      action: 'rules_engine_notified',
    });
  }
}

// ── Rules Render & Handlers ──────────────────────────────────────────────────
let currentDraftRule: Rule | null = null;

function renderRules() {
  const container = document.getElementById('rules-list-container');
  if (!container) return;

  container.innerHTML = state.rules.map((r) => `
    <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <strong style="font-size: 0.95rem;">${r.name}</strong>
          ${r.approved ? '<span class="tier-pill" style="background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald); border-color: rgba(16, 185, 129, 0.4);">APPROVED</span>' : '<span class="tier-pill" style="background: rgba(245, 158, 11, 0.2); color: var(--accent-amber); border-color: rgba(245, 158, 11, 0.4);">PENDING APPROVAL</span>'}
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); margin-top: 6px;">
          <span>Trigger: <strong style="color: var(--primary-light);">${r.trigger}</strong></span> |
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
  const intent = input?.value || 'High temperature alert';

  currentDraftRule = {
    id: `rule-${Date.now()}`,
    name: intent.length > 40 ? `${intent.substring(0, 37)}...` : intent,
    trigger: intent.toLowerCase().includes('crm') || intent.toLowerCase().includes('deal') ? 'crm.lead.won' : 'iot.telemetry.received',
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

// ── CRM Render & Handlers ────────────────────────────────────────────────────
function renderKanban() {
  const container = document.getElementById('kanban-container');
  if (!container) return;

  container.innerHTML = state.stages.map((stage) => {
    const stageLeads = state.leads.filter((l) => l.stage === stage);
    const totalVal = stageLeads.reduce((acc, l) => acc + l.value, 0);

    return `
      <div class="kanban-column">
        <div class="kanban-header">
          <span>${stage}</span>
          <span class="kanban-count">${stageLeads.length} · $${totalVal.toLocaleString()}</span>
        </div>
        <div class="kanban-cards">
          ${stageLeads.map((l) => `
            <div class="lead-card">
              <div class="lead-title">${l.title}</div>
              <div style="font-size: 0.78rem; color: var(--text-dim); margin-bottom: 6px;">${l.company}</div>
              <div class="lead-value">$${l.value.toLocaleString()} ${l.currency}</div>
              <div class="lead-footer">
                <span>Stage: ${l.stage}</span>
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

// ── Compliance & Crypto Render ───────────────────────────────────────────────
function updateCryptoPreview() {
  const input = document.getElementById('pii-input') as HTMLInputElement;
  const val = input ? input.value : 'user@example.com';

  // Deterministic demonstration hex generation
  const hex = Array.from(val).map((c) => c.charCodeAt(0).toString(16)).join('');
  const iv = '4a9f1c7e8b02135d9a24';
  const tag = '9b2c3d4e5f6a7b8c';
  const envelope = `enc:v1:${iv}:${tag}:${hex.substring(0, 48)}`;
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
    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 12px;">
      <thead>
        <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-dim); text-align: left;">
          <th style="padding: 10px 8px;">Subject ID</th>
          <th style="padding: 10px 8px;">Purpose</th>
          <th style="padding: 10px 8px;">Legal Basis</th>
          <th style="padding: 10px 8px;">Granted At</th>
          <th style="padding: 10px 8px;">Status</th>
          <th style="padding: 10px 8px; text-align: right;">Action</th>
        </tr>
      </thead>
      <tbody>
        ${state.consents.map((c) => `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
            <td style="padding: 12px 8px; font-family: var(--font-mono);">${c.subjectId}</td>
            <td style="padding: 12px 8px;"><code>${c.purpose}</code></td>
            <td style="padding: 12px 8px;"><span class="tier-pill" style="font-size: 0.65rem;">${c.legalBasis}</span></td>
            <td style="padding: 12px 8px; color: var(--text-muted);">${c.grantedAt}</td>
            <td style="padding: 12px 8px;">
              ${c.revokedAt ? '<span style="color: var(--accent-rose); font-weight: 600;">REVOKED</span>' : '<span style="color: var(--accent-emerald); font-weight: 600;">ACTIVE</span>'}
            </td>
            <td style="padding: 12px 8px; text-align: right;">
              ${!c.revokedAt ? `<button class="btn btn-danger btn-sm" onclick="window.revokeConsent('${c.id}')">Revoke</button>` : '<span style="color: var(--text-dim); font-size: 0.75rem;">Processed</span>'}
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
    c.revokedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    renderConsents();
    logBusEvent('compliance.consent.revoked', { subjectId: c.subjectId, purpose: c.purpose });
  }
};

function executeSubjectErasure(subjectId: string) {
  state.erasureRequestsCount++;
  state.anonymizedCount += 3;

  // Revoke any active consents for subject
  state.consents.forEach((c) => {
    if (c.subjectId.includes(subjectId) || subjectId.includes(c.subjectId)) {
      c.revokedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
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

  alert(`GDPR/NDPR Right to be Forgotten Executed for: ${subjectId}\n\n- CRM Personal Records: Wiped to [REDACTED]\n- Consents: Revoked\n- Tamper-evident Audit Ledger Entry Created`);
}

// ── Real-Time Event Stream Log ───────────────────────────────────────────────
function renderEventLog() {
  const container = document.getElementById('event-stream-body');
  if (!container) return;

  container.innerHTML = state.events.map((e) => `
    <div class="log-entry">
      <span class="log-ts">[${e.ts}]</span>
      <span class="log-event">${e.name}</span>
      <span class="log-payload">${e.payload}</span>
    </div>
  `).join('');
}

// ── App Init ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initApp);
