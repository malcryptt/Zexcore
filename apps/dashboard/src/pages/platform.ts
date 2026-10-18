/**
 * ZexCore Platform & Capabilities Page
 * Per-module dedicated sub-pages with modular sub-navigation
 * Enterprise Red & White Design System — No emojis, no vibe-coded clutter
 */

import { renderNavbar } from '../components/navbar';
import { renderFooter } from '../components/footer';

export interface PlatformModuleDef {
  id: string;
  name: string;
  pkg: string;
  badge: string;
  eyebrow: string;
  summary: string;
  capabilities: Array<{
    title: string;
    desc: string;
    tags: string[];
    icon: string;
  }>;
  schemas: Array<{
    table: string;
    desc: string;
    columns: string;
  }>;
  endpoints: Array<{
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    path: string;
    desc: string;
  }>;
  events: Array<{
    name: string;
    trigger: string;
  }>;
  codeSnippet: string;
}

const PLATFORM_MODULES: Record<string, PlatformModuleDef> = {
  core: {
    id: 'core',
    name: 'Sovereign Tenancy & Core Foundation',
    pkg: '@zexcore/core',
    badge: 'Micro-Kernel Root',
    eyebrow: 'FOUNDATION 01',
    summary: 'The immutable micro-kernel foundation. Provides AsyncLocalStorage context propagation, PostgreSQL 17 Row-Level Security enforcement, capability-based RBAC, and append-only cryptographic audit logging.',
    capabilities: [
      {
        title: 'AsyncLocalStorage Tenancy Propagation',
        desc: 'Every inbound HTTP request, WebSocket frame, and background worker job is wrapped into an isolated Node.js AsyncLocalStorage store, guaranteeing zero cross-tenant thread leakage.',
        tags: ['AsyncLocalStorage', 'Fastify PreHandler', 'Thread Safe'],
        icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
      },
      {
        title: 'Hardware-Enforced PostgreSQL 17 RLS',
        desc: 'PostgreSQL FORCE ROW LEVEL SECURITY binds every query to SET LOCAL app.current_tenant_id. Leaks are mathematically prohibited at the SQL engine layer, independent of application code.',
        tags: ['Postgres 17', 'FORCE RLS', 'Session Variables'],
        icon: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
      },
      {
        title: 'Capability-Based Principal RBAC',
        desc: 'Explicit capability matrices for tenant_admin, owner, member, viewer, and device principals. No role conflation or hardcoded authorization checks.',
        tags: ['RBAC', 'Principal Evaluator', 'Zero Trust'],
        icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      },
      {
        title: 'SHA-256 Chained Immutable Audit Trail',
        desc: 'Every state mutation appends a signed ledger record with hash chaining back to the previous entry. UPDATE and DELETE permissions are revoked from the database role.',
        tags: ['SHA-256 Chain', 'Non-Repudiation', 'Append Only'],
        icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
      },
    ],
    schemas: [
      { table: 'tenants', desc: 'Sovereign workspace definition and isolation tier', columns: 'id (UUID PK), slug, name, plan, rls_enforced, created_at' },
      { table: 'users', desc: 'Tenant-scoped identities with bcrypt authentication', columns: 'id, tenant_id (FK), email, role, status, last_login' },
      { table: 'audit_log', desc: 'Cryptographically chained tamper-evident audit ledger', columns: 'id, tenant_id, actor_id, event, prev_hash, current_hash, signature' },
    ],
    endpoints: [
      { method: 'POST', path: '/api/auth/login', desc: 'Authenticate user and initialize tenant AsyncLocalStorage context' },
      { method: 'GET', path: '/api/tenants/current', desc: 'Retrieve isolated tenant metadata and active capability grants' },
      { method: 'GET', path: '/api/tenants/:id/members', desc: 'Query tenant-scoped memberships with RLS boundary enforcement' },
      { method: 'POST', path: '/api/audit/query', desc: 'Query cryptographic audit log with proof verification' },
    ],
    events: [
      { name: 'auth.session.created', trigger: 'Dispatched upon successful user or machine token verification' },
      { name: 'tenant.context.switched', trigger: 'Dispatched when an operator switches tenant sandbox scope' },
      { name: 'audit.mutation.recorded', trigger: 'Dispatched on all state changes before transaction commit' },
    ],
    codeSnippet: `import { runWithTenant, getTenantContext } from '@zexcore/core';

// Inbound Fastify preHandler hook
fastify.addHook('preHandler', async (req, reply) => {
  const tenantId = req.headers['x-tenant-id'] || parseTenantFromHost(req.hostname);
  
  return runWithTenant({ tenantId }, async () => {
    // Isolated PostgreSQL transaction session
    await db.execute(sql\`SET LOCAL app.current_tenant_id = \${tenantId}\`);
  });
});`,
  },

  iot: {
    id: 'iot',
    name: 'Industrial IoT & Telemetry Gateway',
    pkg: '@zexcore/module-iot',
    badge: 'Edge Ingestion Engine',
    eyebrow: 'MODULE 02',
    summary: 'High-throughput edge sensor ingestion engine with SHA-256 token authentication, time-series partitioning, threshold-based EventBus dispatch, and bidirectional remote command execution.',
    capabilities: [
      {
        title: 'SHA-256 Device Token Registry',
        desc: 'Edge sensors authenticate via X-Device-Token headers. Secrets are salted and hashed with bcrypt, enabling instant token revocation without firmware reflashing.',
        tags: ['X-Device-Token', 'Bcrypt Secret', 'Revocable'],
        icon: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
      },
      {
        title: '10,000+ msgs/sec Ingestion Pipeline',
        desc: 'Engineered for industrial telemetry nodes. Captures temperature, vibration, pressure, voltage, and GPS coordinates with sub-millisecond buffering and PostgreSQL partitioning.',
        tags: ['Time-Series', 'Sub-millisecond', 'Zero Buffer Bloat'],
        icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
      },
      {
        title: 'Real-Time Threshold Event Bus Dispatch',
        desc: 'Telemetry anomalies automatically trigger iot.threshold.alert domain events on the internal EventBus, invoking automated WhatsApp alerts, cooling switches, or safety shutdowns.',
        tags: ['Threshold Rules', 'EventBus Mesh', 'WhatsApp Alerts'],
        icon: '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>',
      },
      {
        title: 'Bidirectional Command Queue',
        desc: 'Dispatch remote configuration updates and hardware controls over HTTP long-poll or MQTT with delivery acknowledgement tracking in device_commands.',
        tags: ['Ack Tracking', 'Remote Commands', 'MQTT Ready'],
        icon: '<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/>',
      },
    ],
    schemas: [
      { table: 'devices', desc: 'Registered hardware edge nodes and authentication credentials', columns: 'id, tenant_id (FK), name, key, kind, token_hash, status, firmware, last_seen' },
      { table: 'device_telemetry', desc: 'Time-series partitioned metrics and sensor readings', columns: 'id, tenant_id, device_id, temperature, humidity, voltage, metrics_json, recorded_at' },
      { table: 'device_commands', desc: 'Bidirectional command queue with acknowledgement state', columns: 'id, tenant_id, device_id, command, payload_json, status, ack_at' },
    ],
    endpoints: [
      { method: 'POST', path: '/api/iot/telemetry', desc: 'Ingest real-time device metrics authenticated via X-Device-Token' },
      { method: 'POST', path: '/api/iot/devices/register', desc: 'Register a new industrial node and generate initial device secret' },
      { method: 'GET', path: '/api/iot/devices', desc: 'List tenant devices with live online/offline status and telemetry' },
      { method: 'POST', path: '/api/iot/commands/send', desc: 'Dispatch remote command to device queue with ack tracking' },
    ],
    events: [
      { name: 'iot.telemetry.received', trigger: 'Dispatched on every authenticated telemetry payload ingest' },
      { name: 'iot.threshold.alert', trigger: 'Dispatched when a sensor crosses safety or operational bounds' },
      { name: 'iot.device.offline', trigger: 'Dispatched when a node heartbeat exceeds the watchdog timeout' },
    ],
    codeSnippet: `// Edge device HTTP telemetry ingest
POST /api/iot/telemetry
Headers:
  X-Device-Token: dtok_live_89b21f92e01a89c
  Content-Type: application/json

Payload:
{
  "temperature": -18.4,
  "humidity": 78,
  "voltage": 24.1,
  "vibration": 1.2,
  "recordedAt": "2026-10-18T18:30:00Z"
}`,
  },

  rules: {
    id: 'rules',
    name: 'Deterministic Rules Engine & AI Author',
    pkg: '@zexcore/rules',
    badge: 'AST Evaluation Engine',
    eyebrow: 'MODULE 03',
    summary: 'Abstract Syntax Tree safe rule evaluation with zero JavaScript eval(), strict 50ms execution timeouts, instruction caps to prevent denial-of-service, and Gemini AI assistance for validated rule authoring.',
    capabilities: [
      {
        title: 'Zero eval() Abstract Syntax Tree',
        desc: 'Rule expressions are parsed into validated AST nodes. The custom runtime evaluates logic without eval() or Function(), eliminating code injection vulnerabilities completely.',
        tags: ['Zero Eval', 'AST Compiler', 'Sandbox Safe'],
        icon: '<polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
      },
      {
        title: '50ms Timeout & Instruction Caps',
        desc: 'Protects the cluster against runaway tenant formulas. Execution steps are bounded to a maximum instruction counter and hard 50ms wall-clock ceiling.',
        tags: ['DoS Protection', 'Instruction Bound', '< 1ms Execution'],
        icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
      },
      {
        title: 'AI Rule Authoring with Gemini',
        desc: 'Convert plain-English business rules into validated RuleDraft structures. Generates conditions, triggers, and actions matching the strict Zod schema.',
        tags: ['Gemini 2.5', 'Natural Language', 'Zod Validated'],
        icon: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
      },
      {
        title: 'Human-in-the-Loop Approval Gate',
        desc: 'AI-drafted rules are staged with approved: false. Deployment requires explicit operator authorization, writing an immutable record to the audit ledger.',
        tags: ['Approval Workflow', 'Operator Sign-off', 'Audit Trail'],
        icon: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
      },
    ],
    schemas: [
      { table: 'rules', desc: 'Tenant automation rules with AST definition and activation state', columns: 'id, tenant_id (FK), name, trigger_event, ast_json, approved, enabled' },
      { table: 'rule_executions', desc: 'Execution audit records with evaluation duration and output', columns: 'id, tenant_id, rule_id, trigger_event_id, result, duration_ms, executed_at' },
    ],
    endpoints: [
      { method: 'POST', path: '/api/rules/evaluate', desc: 'Dry-run or evaluate an AST expression against a mock context' },
      { method: 'GET', path: '/api/rules', desc: 'List active and staged rules for the authenticated tenant' },
      { method: 'POST', path: '/api/rules/create', desc: 'Create and validate an AST rule definition' },
      { method: 'POST', path: '/api/rules/author/ai', desc: 'Synthesize a validated rule draft from natural language prompt' },
    ],
    events: [
      { name: 'rules.rule.evaluated', trigger: 'Dispatched after deterministic AST condition evaluation' },
      { name: 'rules.action.emitted', trigger: 'Dispatched when rule action emits an event to the EventBus' },
      { name: 'rules.approval.granted', trigger: 'Dispatched when a human operator authorizes an AI-drafted rule' },
    ],
    codeSnippet: `// Sample AST Rule Definition
{
  "name": "Thermal Emergency Alert",
  "trigger": "iot.telemetry.received",
  "conditions": {
    "operator": "AND",
    "rules": [
      { "field": "metrics.temperature", "op": "GREATER_THAN", "value": -10.0 },
      { "field": "device.kind", "op": "EQUALS", "value": "chiller_probe" }
    ]
  },
  "action": {
    "type": "EMIT_EVENT",
    "event": "logistics.alert.thermal_breach"
  }
}`,
  },

  crm: {
    id: 'crm',
    name: 'Multi-Channel CRM, WhatsApp & Appointments',
    pkg: '@zexcore/module-crm',
    badge: 'Commerce & Pipeline Engine',
    eyebrow: 'MODULE 04',
    summary: 'WhatsApp-first communication hub, shareable online booking engine with Paystack and Flutterwave slot deposits, multi-currency Kanban pipeline, and tenant-isolated contact management.',
    capabilities: [
      {
        title: 'Meta WhatsApp Cloud API Hub',
        desc: 'Direct integration with Meta WhatsApp Business Cloud API. Webhook signature verification, multi-agent chat, auto-replies, and instant conversion to pipeline deals.',
        tags: ['WhatsApp Cloud API', 'Webhook Verified', 'Quick Replies'],
        icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      },
      {
        title: 'Self-Serve Booking & Deposits',
        desc: 'Public shareable booking link. Clients select time slots and pay an upfront reservation deposit via Paystack, Flutterwave, or Stripe to eliminate customer no-shows.',
        tags: ['Paystack Deposit', 'Flutterwave', 'Calendar Sync'],
        icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
      },
      {
        title: 'Automated 24h & 1h WhatsApp & SMS Reminders',
        desc: 'Scheduler automatically dispatches reminder pings 24 hours and 1 hour before scheduled appointments, confirming attendance with zero-friction reschedule options.',
        tags: ['Multi-Channel Pings', 'Attendance Confirmation', 'Scheduler'],
        icon: '<path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/>',
      },
      {
        title: 'Multi-Currency Opportunity Kanban',
        desc: 'Track sales deals through customizable stages (New, Qualified, Proposal, Negotiation, Won). Supports USD, NGN, KES, GHS, and EUR with conversion tracking.',
        tags: ['Multi-Currency', 'Kanban Pipeline', 'Stage Transitions'],
        icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
      },
    ],
    schemas: [
      { table: 'crm_leads', desc: 'Inbound leads and qualified pipeline opportunities', columns: 'id, tenant_id (FK), title, company, contact_name, value, currency, stage, created_at' },
      { table: 'crm_whatsapp_threads', desc: 'WhatsApp Business API threads and customer chat sessions', columns: 'id, tenant_id, client_phone, client_name, unread_count, last_message, updated_at' },
      { table: 'crm_bookings', desc: 'Confirmed appointments with deposit transaction reference', columns: 'id, tenant_id, client_name, client_phone, service, date_time, deposit_amount, deposit_status' },
    ],
    endpoints: [
      { method: 'GET', path: '/api/crm/leads', desc: 'Retrieve tenant opportunity pipeline with Kanban stage grouping' },
      { method: 'POST', path: '/api/crm/opportunities', desc: 'Create new commercial opportunity or convert from chat thread' },
      { method: 'PATCH', path: '/api/crm/opportunities/:id/stage', desc: 'Advance opportunity stage and dispatch transition event' },
      { method: 'POST', path: '/api/crm/bookings/create', desc: 'Book appointment with Paystack/Flutterwave deposit verification' },
    ],
    events: [
      { name: 'crm.lead.created', trigger: 'Dispatched when new lead arrives via web inquiry or WhatsApp' },
      { name: 'crm.stage.transitioned', trigger: 'Dispatched when an opportunity is advanced to a new stage' },
      { name: 'booking.reminder.dispatched', trigger: 'Dispatched when automated WhatsApp reminder is sent' },
    ],
    codeSnippet: `// Convert WhatsApp chat inquiry to CRM Opportunity
POST /api/crm/opportunities
{
  "title": "Cold Storage Reefer Fleet Haul",
  "company": "BioMed Logistics",
  "contactName": "Dr. Amina Bello",
  "contactPhone": "+2348031234567",
  "value": 48000,
  "currency": "USD",
  "stage": "Qualified",
  "source": "whatsapp"
}`,
  },

  compliance: {
    id: 'compliance',
    name: 'Cryptographic Privacy Vault & GDPR',
    pkg: '@zexcore/compliance',
    badge: 'Security & Privacy Engine',
    eyebrow: 'MODULE 05',
    summary: 'AES-256-GCM envelope encryption with per-tenant data encryption keys, HMAC-SHA256 blind indexing for encrypted exact search, consent ledger, and GDPR Article 17 Right-to-be-Forgotten erasure pipelines.',
    capabilities: [
      {
        title: 'AES-256-GCM Envelope Encryption',
        desc: 'Field-level encryption at rest. Each sensitive record is encrypted with a unique data key wrapped by the tenant master key, preventing multi-tenant cryptographic compromise.',
        tags: ['AES-256-GCM', 'Envelope Encryption', 'Unique DEKs'],
        icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
      },
      {
        title: 'HMAC-SHA256 Blind Indexing',
        desc: 'Enables exact-match database queries over encrypted PII without decrypting tables. Queries compute an HMAC blind index token and query indexed hashes directly.',
        tags: ['HMAC-SHA256', 'Blind Index', 'Encrypted Search'],
        icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      },
      {
        title: 'Consent Ledger & Legal Basis',
        desc: 'Track lawful processing bases under GDPR Article 6 (consent, contract, legal obligation). Full timestamped audit trail of consent grants and withdrawals.',
        tags: ['GDPR Art. 6', 'Consent Ledger', 'Audit Trail'],
        icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
      },
      {
        title: 'GDPR Article 17 Erasure Pipeline',
        desc: 'Right-to-be-Forgotten automation. Cascades across tenant tables, replaces PII with [REDACTED], and records a tamper-evident erasure certificate in the audit ledger.',
        tags: ['GDPR Art. 17', 'Erasure Pipeline', 'Redaction Cert'],
        icon: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
      },
    ],
    schemas: [
      { table: 'compliance_vault', desc: 'Encrypted payload store with ciphertext and initialization vector', columns: 'id, tenant_id (FK), key_id, ciphertext, iv, auth_tag, blind_index, created_at' },
      { table: 'consent_ledger', desc: 'Subject consent history with purpose and withdrawal timestamps', columns: 'id, tenant_id, subject_id, purpose, lawful_basis, status, timestamp' },
      { table: 'erasure_requests', desc: 'GDPR Right-to-be-Forgotten audit records and execution receipts', columns: 'id, tenant_id, subject_id, requester, status, cert_hash, executed_at' },
    ],
    endpoints: [
      { method: 'POST', path: '/api/compliance/encrypt', desc: 'Encrypt sensitive payload using tenant-scoped AES-256-GCM key' },
      { method: 'POST', path: '/api/compliance/decrypt', desc: 'Decrypt ciphertext with tenant key and verify integrity auth tag' },
      { method: 'POST', path: '/api/compliance/erasure', desc: 'Initiate GDPR Article 17 Right-to-be-Forgotten erasure pipeline' },
      { method: 'GET', path: '/api/compliance/consent', desc: 'Query subject consent record and lawful processing basis' },
    ],
    events: [
      { name: 'compliance.data.encrypted', trigger: 'Dispatched upon envelope encryption of sensitive field' },
      { name: 'compliance.erasure.executed', trigger: 'Dispatched when GDPR Article 17 erasure completes' },
      { name: 'compliance.consent.granted', trigger: 'Dispatched when customer opts in to data processing' },
    ],
    codeSnippet: `// Encrypting PII with HMAC Blind Indexing
import { encryptField } from '@zexcore/compliance';

const encrypted = await encryptField({
  tenantId: 'acme_corp',
  plaintext: 'patient-ssn-00124',
  purpose: 'healthcare_diagnostics'
});

// Stored in PostgreSQL:
// ciphertext: 'a9f0...82b'
// iv: 'e31b...19a'
// authTag: 'f92c...01e'
// blindIndex: 'hmac_sha256_hash_for_lookups'`,
  },
};

const MODULE_LIST = [
  { id: 'core', name: 'Core Foundation', pkg: '@zexcore/core', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>' },
  { id: 'iot', name: 'Industrial IoT', pkg: '@zexcore/module-iot', icon: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>' },
  { id: 'rules', name: 'Rules & AI Author', pkg: '@zexcore/rules', icon: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>' },
  { id: 'crm', name: 'CRM & Pipeline', pkg: '@zexcore/module-crm', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
  { id: 'compliance', name: 'Compliance & Vault', pkg: '@zexcore/compliance', icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' },
];

export function renderPlatformPage(activeModuleId = 'core'): string {
  const currentMod = PLATFORM_MODULES[activeModuleId] || PLATFORM_MODULES.core;

  return `
    <div class="page-wrapper">
      ${renderNavbar('platform')}

      <main>
        <!-- Compact Clean Header without Tacky Badges -->
        <section class="platform-page-hero">
          <div class="site-container">
            <div class="platform-hero-content">
              <div class="section-eyebrow" style="color: #e50920; letter-spacing: 0.08em; font-weight: 800; font-size: 0.75rem; margin-bottom: 6px;">
                PLATFORM ARCHITECTURE &amp; DOMAIN ENGINES
              </div>
              <h1 class="platform-hero-title">Platform Architecture</h1>
              <p class="platform-hero-desc">
                ZexCore modules are isolated workspace packages with distinct database schemas, REST endpoints, EventBus listeners, and capabilities. Select a module below to inspect its dedicated specification.
              </p>
            </div>

            <!-- Horizontal Module Tabs Bar -->
            <div class="platform-module-nav-bar" role="tablist">
              ${MODULE_LIST.map((m) => {
                const isActive = m.id === currentMod.id;
                return `
                  <a
                    href="#/platform/${m.id}"
                    class="platform-nav-tab ${isActive ? 'active' : ''}"
                    role="tab"
                    aria-selected="${isActive}"
                  >
                    <span class="platform-tab-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        ${m.icon}
                      </svg>
                    </span>
                    <span class="platform-tab-text">
                      <span class="platform-tab-name">${m.name}</span>
                      <span class="platform-tab-pkg">${m.pkg}</span>
                    </span>
                  </a>
                `;
              }).join('')}
            </div>
          </div>
        </section>

        <!-- Dedicated Module View -->
        <section class="platform-module-dedicated-section">
          <div class="site-container">
            
            <!-- Module Header Banner -->
            <div class="platform-dedicated-header-card">
              <div class="platform-dedicated-header-top">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div class="platform-mod-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e50920" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      ${MODULE_LIST.find((m) => m.id === currentMod.id)?.icon || ''}
                    </svg>
                  </div>
                  <div>
                    <div style="font-size: 0.72rem; font-weight: 800; color: #e50920; letter-spacing: 0.06em; text-transform: uppercase;">
                      ${currentMod.eyebrow} &bull; <code>${currentMod.pkg}</code>
                    </div>
                    <h2 class="platform-mod-title">${currentMod.name}</h2>
                  </div>
                </div>

                <div style="display: flex; gap: 8px;">
                  <a href="#/console" class="btn btn-primary btn-sm">
                    Open in Console &rarr;
                  </a>
                  <a href="#/docs" class="btn btn-secondary btn-sm">
                    API Docs
                  </a>
                </div>
              </div>

              <p class="platform-mod-summary">${currentMod.summary}</p>
            </div>

            <!-- 2x2 Architectural Capabilities Grid -->
            <div style="margin-bottom: 40px;">
              <h3 class="platform-section-title">Engine Capabilities</h3>
              <div class="platform-capabilities-grid">
                ${currentMod.capabilities.map((c) => `
                  <div class="platform-cap-card">
                    <div class="platform-cap-header">
                      <div class="platform-cap-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e50920" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          ${c.icon}
                        </svg>
                      </div>
                      <h4 class="platform-cap-title">${c.title}</h4>
                    </div>
                    <p class="platform-cap-desc">${c.desc}</p>
                    <div class="platform-cap-tags">
                      ${c.tags.map((t) => `<span class="platform-tag">${t}</span>`).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Two-Column Technical Deep Dive: Schemas & Endpoints -->
            <div class="platform-tech-columns" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px;">
              
              <!-- Left Column: Database Tables -->
              <div class="platform-tech-box">
                <div class="platform-tech-box-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                  <span>Registered PostgreSQL Tables</span>
                </div>
                <div class="platform-tech-table-list">
                  ${currentMod.schemas.map((s) => `
                    <div class="platform-schema-item">
                      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                        <code class="platform-table-name">${s.table}</code>
                      </div>
                      <div class="platform-schema-desc">${s.desc}</div>
                      <div class="platform-schema-cols"><code>${s.columns}</code></div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Right Column: Exposed REST Endpoints -->
              <div class="platform-tech-box">
                <div class="platform-tech-box-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  <span>Exposed REST Endpoints</span>
                </div>
                <div class="platform-endpoint-list">
                  ${currentMod.endpoints.map((e) => `
                    <div class="platform-endpoint-item">
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span class="platform-method-badge ${e.method.toLowerCase()}">${e.method}</span>
                        <code class="platform-endpoint-path">${e.path}</code>
                      </div>
                      <div class="platform-endpoint-desc">${e.desc}</div>
                    </div>
                  `).join('')}
                </div>
              </div>

            </div>

            <!-- Published Domain Events -->
            <div class="platform-tech-box" style="margin-bottom: 40px;">
              <div class="platform-tech-box-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>Published Domain Events (EventBus Mesh)</span>
              </div>
              <div class="platform-events-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; padding: 16px;">
                ${currentMod.events.map((ev) => `
                  <div class="platform-event-card">
                    <code class="platform-event-name">${ev.name}</code>
                    <p class="platform-event-trigger">${ev.trigger}</p>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Code Sample Preview -->
            <div class="platform-code-card">
              <div class="platform-code-header">
                <span style="font-size: 0.74rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Implementation Specification</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #e50920;">${currentMod.pkg}</span>
              </div>
              <pre class="platform-code-pre"><code>${currentMod.codeSnippet}</code></pre>
            </div>

          </div>
        </section>

        <!-- Bottom Clean Call to Action -->
        <section class="section-white" style="border-top: 1px solid #e2e8f0; padding: 60px 0;">
          <div class="site-container" style="text-align: center; max-width: 640px; margin: 0 auto;">
            <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0 0 10px; letter-spacing: -0.02em;">Ready to explore ZexCore Control?</h2>
            <p style="color: #64748b; font-size: 0.92rem; line-height: 1.6; margin: 0 0 24px;">
              Experience the multi-tenant architecture with sample IoT nodes, deterministic rules, and multi-channel WhatsApp CRM.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <a href="#/console" class="btn btn-primary btn-lg">Launch Console &rarr;</a>
              <a href="#/solutions" class="btn btn-secondary btn-lg">Explore Solutions</a>
            </div>
          </div>
        </section>
      </main>

      ${renderFooter()}
    </div>
  `;
}
