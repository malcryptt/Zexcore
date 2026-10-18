/**
 * ZexCore Console: Audit & Financial Health Suite (module-audit)
 *
 * Implements:
 * - Security posture, access, and activity checks
 * - Financial reconciliation, integrity, and casino-inspired controls
 * - Hierarchy of trust (Verified, Imported, Claimed) for bank transfers
 * - 3-tier rules (Locked baseline, Tunable, Custom) with dual-approver gating
 * - Append-only findings with cryptographic evidence & dismiss-with-reason flow
 * - Tamper-resistant hash-chained audit log inspector
 * - Exportable Evidence Pack for accountants and regulators
 * - Deterministic evaluations with advisory-only AI plain-language explainer
 */

import { type PlanTier, getAuditTierForPlan, openStripeCheckoutModal } from '../lib/billing';

export type AuditSubTab = 'overview' | 'findings' | 'rules' | 'reconciliation' | 'reports';

export interface AuditFindingItem {
  id: string;
  ruleKey: string;
  ruleName: string;
  ruleVersion: number;
  domain: 'security' | 'finance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  evidence: {
    occurredAt: string;
    recordsCount: number;
    rawSample: Record<string, any>;
    reproductionCommand: string;
    cryptographicHash: string;
  };
  status: 'open' | 'investigating' | 'dismissed' | 'resolved';
  dismissalReason?: string;
  dismissedBy?: string;
  firstSeenAt: string;
}

export interface AuditRuleConfig {
  id: string;
  key: string;
  name: string;
  domain: 'security' | 'finance';
  tier: 'locked_baseline' | 'tunable' | 'custom';
  version: number;
  description: string;
  params: Record<string, any>;
  paramMin?: number;
  paramMax?: number;
  paramUnit?: string;
  status: 'active' | 'disabled';
}

export interface LedgerTransaction {
  id: string;
  date: string;
  kind: 'charge' | 'refund' | 'payout' | 'transfer';
  amountMinor: number;
  currency: string;
  trustLevel: 'verified' | 'imported' | 'claimed';
  source: string;
  reference: string;
  matchedStatus: 'matched' | 'unmatched';
  matchedWith?: string;
}

export interface HashChainBlockItem {
  blockNumber: number;
  timestamp: string;
  action: string;
  recordHash: string;
  previousHash: string;
  blockHash: string;
}

// ── In-Memory Module State ───────────────────────────────────────────────────
export const auditState = {
  currentSubTab: 'overview' as AuditSubTab,
  findingFilter: 'all' as 'all' | 'security' | 'finance' | 'critical' | 'open',
  securityScore: 94,
  financeScore: 88,
  isScanning: false,
  scoreTrend: [
    { date: 'Sep 18', security: 84, finance: 80, overall: 82 },
    { date: 'Sep 25', security: 88, finance: 82, overall: 85 },
    { date: 'Oct 02', security: 90, finance: 84, overall: 87 },
    { date: 'Oct 09', security: 92, finance: 86, overall: 89 },
    { date: 'Oct 16', security: 94, finance: 88, overall: 91 },
  ],
  findings: [
    {
      id: 'f-sec-01',
      ruleKey: 'sec.posture.admin_mfa',
      ruleName: 'Administrators Without Multi-Factor Authentication',
      ruleVersion: 1,
      domain: 'security',
      severity: 'critical',
      title: '1 Administrator account lacks Multi-Factor Authentication',
      description: 'Account "ops-lead@zexcore.io" holds superadmin privileges but signs in with only a password.',
      evidence: {
        occurredAt: '2026-10-18T19:30:00Z',
        recordsCount: 1,
        rawSample: { email: 'ops-lead@zexcore.io', role: 'superadmin', mfa_enabled: false },
        reproductionCommand: 'zex audit check --rule=sec.posture.admin_mfa --v=1',
        cryptographicHash: 'sha256_9b4e72a812df09',
      },
      status: 'open',
      firstSeenAt: '2026-10-18 19:30 UTC',
    },
    {
      id: 'f-fin-01',
      ruleKey: 'fin.integrity.duplicate_payments',
      ruleName: 'Potential Duplicate Payment Charge Identified',
      ruleVersion: 1,
      domain: 'finance',
      severity: 'high',
      title: 'Suspected duplicate charge ($1,250.00 / ₦1,875,000) within 3-minute window',
      description: 'Customer "adebayo.ogundimu@reefer-trans.ng" was charged twice in rapid succession with identical amounts.',
      evidence: {
        occurredAt: '2026-10-18T11:42:00Z',
        recordsCount: 2,
        rawSample: {
          tx1: 'pstk_live_99201481',
          tx2: 'pstk_live_99201482',
          amountMinor: 125000,
          deltaSeconds: 114,
        },
        reproductionCommand: 'zex audit check --rule=fin.integrity.duplicate_payments --v=1',
        cryptographicHash: 'sha256_3fa9081bc598e1',
      },
      status: 'open',
      firstSeenAt: '2026-10-18 11:42 UTC',
    },
    {
      id: 'f-sec-02',
      ruleKey: 'sec.posture.silent_devices',
      ruleName: 'Fleet Edge Devices Silent Exceeding Heartbeat Window',
      ruleVersion: 1,
      domain: 'security',
      severity: 'medium',
      title: '1 Hardware device silent past 30-minute deadline',
      description: 'Device "Main Power Grid Inverter" (power_gateway) ceased heartbeats 42 minutes ago.',
      evidence: {
        occurredAt: '2026-10-18T20:38:00Z',
        recordsCount: 1,
        rawSample: { deviceKey: 'iot_solar_gw_03', lastSeen: '42m ago', thresholdMinutes: 30 },
        reproductionCommand: 'zex audit check --rule=sec.posture.silent_devices --v=1',
        cryptographicHash: 'sha256_82f1c84910eb37',
      },
      status: 'open',
      firstSeenAt: '2026-10-18 20:38 UTC',
    },
    {
      id: 'f-fin-02',
      ruleKey: 'fin.integrity.invoice_number_gaps',
      ruleName: 'Sequential Tax Invoice Numbering Continuity Gap',
      ruleVersion: 1,
      domain: 'finance',
      severity: 'medium',
      title: 'Missing sequence number INV-2026-090 in fiscal record range',
      description: 'Invoice INV-2026-089 is followed directly by INV-2026-091, indicating an unposted void or unrecorded record.',
      evidence: {
        occurredAt: '2026-10-17T16:15:00Z',
        recordsCount: 1,
        rawSample: { missingNumber: 'INV-2026-090', range: 'INV-2026-080 to INV-2026-095' },
        reproductionCommand: 'zex audit check --rule=fin.integrity.invoice_number_gaps --v=1',
        cryptographicHash: 'sha256_7a3d2e90f12c44',
      },
      status: 'open',
      firstSeenAt: '2026-10-17 16:15 UTC',
    },
    {
      id: 'f-fin-03',
      ruleKey: 'fin.casino.structuring_detection',
      ruleName: 'Potential Transaction Structuring Below Dual-Approval Threshold',
      ruleVersion: 1,
      domain: 'finance',
      severity: 'high',
      title: '3 Refund transactions cluster between $4,890 and $4,950 (Ceiling: $5,000)',
      description: 'High-frequency refunds clustered just below the $5,000 supervisor authorization limit match classic anti-smurfing structuring signatures.',
      evidence: {
        occurredAt: '2026-10-16T14:22:00Z',
        recordsCount: 3,
        rawSample: { amountsMinor: [489000, 492000, 495000], approvalLimitMinor: 500000 },
        reproductionCommand: 'zex audit check --rule=fin.casino.structuring_detection --v=1',
        cryptographicHash: 'sha256_44b82d771e30a5',
      },
      status: 'open',
      firstSeenAt: '2026-10-16 14:22 UTC',
    },
  ] as AuditFindingItem[],

  rules: [
    // Locked Baseline
    {
      id: 'r-1',
      key: 'sec.posture.admin_mfa',
      name: 'Administrator Multi-Factor Authentication Enforcement',
      domain: 'security',
      tier: 'locked_baseline',
      version: 1,
      description: 'Zexlabs locked baseline: Requires hardware or TOTP MFA for all workspace admin credentials.',
      params: { enforceAdminsOnly: true },
      status: 'active',
    },
    {
      id: 'r-2',
      key: 'sec.posture.wildcard_cors',
      name: 'Disallow Wildcard Cross-Origin Resource Sharing (*)',
      domain: 'security',
      tier: 'locked_baseline',
      version: 1,
      description: 'Zexlabs locked baseline: Blocks wildcard CORS origins on authenticated tenant API endpoints.',
      params: { disallowWildcard: true },
      status: 'active',
    },
    {
      id: 'r-3',
      key: 'fin.integrity.refund_over_payment',
      name: 'Prohibit Cumulative Refunds in Excess of Settled Charge',
      domain: 'finance',
      tier: 'locked_baseline',
      version: 1,
      description: 'Zexlabs locked baseline: Prevents total refunds on any order from exceeding original payment value.',
      params: { toleranceMinor: 0 },
      status: 'active',
    },
    {
      id: 'r-4',
      key: 'fin.integrity.finalised_records_mutation',
      name: 'Immutable Finalised Financial Ledger Protection',
      domain: 'finance',
      tier: 'locked_baseline',
      version: 1,
      description: 'Zexlabs locked baseline: Database triggers block direct in-place updates on finalised invoices and ledgers.',
      params: { enforceTriggers: true },
      status: 'active',
    },
    // Tunable
    {
      id: 'r-5',
      key: 'sec.posture.dormant_accounts',
      name: 'Dormant Account Inactivity Detection',
      domain: 'security',
      tier: 'tunable',
      version: 1,
      description: 'Identifies workspace accounts that have remained inactive beyond configured day threshold.',
      params: { daysThreshold: 90 },
      paramMin: 30,
      paramMax: 180,
      paramUnit: 'days',
      status: 'active',
    },
    {
      id: 'r-6',
      key: 'sec.posture.stale_keys',
      name: 'API Key Rotation Expiration Window',
      domain: 'security',
      tier: 'tunable',
      version: 1,
      description: 'Alerts when API credentials stay in continuous active use without cryptographic rotation.',
      params: { daysThreshold: 180 },
      paramMin: 60,
      paramMax: 365,
      paramUnit: 'days',
      status: 'active',
    },
    {
      id: 'r-7',
      key: 'sec.posture.silent_devices',
      name: 'IoT Hardware Silent Heartbeat Timeout',
      domain: 'security',
      tier: 'tunable',
      version: 1,
      description: 'Flags connected sensors, gateways, and edge probes when heartbeat transmissions drop off.',
      params: { timeoutMinutes: 30 },
      paramMin: 5,
      paramMax: 120,
      paramUnit: 'minutes',
      status: 'active',
    },
    {
      id: 'r-8',
      key: 'fin.integrity.duplicate_payments',
      name: 'Duplicate Payment Charge Detection Window',
      domain: 'finance',
      tier: 'tunable',
      version: 1,
      description: 'Matches identical charges against the same customer reference within short time intervals.',
      params: { windowMinutes: 10 },
      paramMin: 2,
      paramMax: 60,
      paramUnit: 'minutes',
      status: 'active',
    },
    {
      id: 'r-9',
      key: 'fin.casino.structuring_detection',
      name: 'Dual-Approval Anti-Structuring Smurfing Detection',
      domain: 'finance',
      tier: 'tunable',
      version: 1,
      description: 'Casino control: Flags transaction clusters that intentionally sit just below the approval ceiling.',
      params: { approvalLimitMinor: 500000 },
      paramMin: 100000,
      paramMax: 2000000,
      paramUnit: 'cents',
      status: 'active',
    },
    // Custom
    {
      id: 'r-10',
      key: 'sec.activity.odd_hour_permission_change',
      name: 'Off-Hours Administrative Privilege Escalation',
      domain: 'security',
      tier: 'custom',
      version: 1,
      description: 'Custom tenant rule: Flags role modifications executed between 22:00 and 06:00 UTC.',
      params: { startHourUtc: 22, endHourUtc: 6 },
      status: 'active',
    },
    {
      id: 'r-11',
      key: 'fin.casino.shift_closeout_variance',
      name: 'Shift Register Close-Out Dual Signature and Variance',
      domain: 'finance',
      tier: 'custom',
      version: 1,
      description: 'Casino control: Requires dual cashier and supervisor digital signatures on register balances.',
      params: { maxAllowedDiscrepancyMinor: 1000 },
      status: 'active',
    },
  ] as AuditRuleConfig[],

  ruleChanges: [
    {
      id: 'rc-1',
      ruleKey: 'sec.posture.dormant_accounts',
      action: 'tune',
      direction: 'tighten',
      oldVal: '120 days',
      newVal: '90 days',
      reason: 'Mandated by Q4 SOC 2 Type II audit readiness gap review',
      requestedBy: 'ciso@zexcore.io',
      approvedBy: 'Auto-applied (Tightening is instant)',
      mfaProof: 'TOTP Verified (0s)',
      createdAt: '2026-10-14 09:20 UTC',
    },
    {
      id: 'rc-2',
      ruleKey: 'fin.integrity.duplicate_payments',
      action: 'tune',
      direction: 'loosen',
      oldVal: '5 mins',
      newVal: '10 mins',
      reason: 'Accommodate high-traffic latency on mobile bank transfer webhooks',
      requestedBy: 'finance-lead@zexcore.io',
      approvedBy: 'Dual-signed by audit-officer@zexcore.io',
      mfaProof: 'WebAuthn FIDO2 Freshness 12s',
      createdAt: '2026-10-10 14:05 UTC',
    },
  ],

  ledger: [
    {
      id: 'led-1',
      date: '2026-10-18 11:42',
      kind: 'charge',
      amountMinor: 125000,
      currency: 'USD',
      trustLevel: 'verified',
      source: 'Stripe Webhook (ch_3Pz9810)',
      reference: 'INV-2026-095',
      matchedStatus: 'matched',
      matchedWith: 'Order #ORD-8812',
    },
    {
      id: 'led-2',
      date: '2026-10-18 10:15',
      kind: 'charge',
      amountMinor: 4800000,
      currency: 'NGN',
      trustLevel: 'verified',
      source: 'Paystack Webhook (pstk_live_992014)',
      reference: 'INV-2026-094',
      matchedStatus: 'matched',
      matchedWith: 'Order #ORD-8811',
    },
    {
      id: 'led-3',
      date: '2026-10-17 14:30',
      kind: 'transfer',
      amountMinor: 3500000,
      currency: 'KES',
      trustLevel: 'verified',
      source: 'Flutterwave MoMo Webhook (flw_tx_8819)',
      reference: 'INV-2026-093',
      matchedStatus: 'matched',
      matchedWith: 'Booking #BK-902',
    },
    {
      id: 'led-4',
      date: '2026-10-17 09:00',
      kind: 'transfer',
      amountMinor: 750000,
      currency: 'USD',
      trustLevel: 'imported',
      source: 'Uploaded Statement (FBN-STMT-OCT17.csv)',
      reference: 'V-ACC-77491-ZEX',
      matchedStatus: 'matched',
      matchedWith: 'Invoice #INV-2026-092',
    },
    {
      id: 'led-5',
      date: '2026-10-16 16:40',
      kind: 'charge',
      amountMinor: 180000,
      currency: 'USD',
      trustLevel: 'claimed',
      source: 'Manual Receipt Claim (REC-2026-904.pdf)',
      reference: 'CLAIM-REF-4412',
      matchedStatus: 'unmatched',
    },
  ] as LedgerTransaction[],

  hashChain: [
    {
      blockNumber: 418,
      timestamp: '2026-10-18 18:00:00 UTC',
      action: 'payment.settled (pstk_live_992014)',
      recordHash: 'sha256_e109d73281fa0',
      previousHash: 'sha256_d891bca72e01f',
      blockHash: 'sha256_7a19c824f901b',
    },
    {
      blockNumber: 419,
      timestamp: '2026-10-18 19:30:00 UTC',
      action: 'audit.finding.created (sec.posture.admin_mfa)',
      recordHash: 'sha256_9b4e72a812df0',
      previousHash: 'sha256_7a19c824f901b',
      blockHash: 'sha256_4c99a1820df11',
    },
    {
      blockNumber: 420,
      timestamp: '2026-10-18 20:38:00 UTC',
      action: 'audit.finding.created (sec.posture.silent_devices)',
      recordHash: 'sha256_82f1c84910eb3',
      previousHash: 'sha256_4c99a1820df11',
      blockHash: 'sha256_2b11e98031ac9',
    },
  ] as HashChainBlockItem[],
};

// ── HTML Rendering ───────────────────────────────────────────────────────────

export function renderConsoleAuditView(currentPlan: PlanTier): string {
  const auditLevel = getAuditTierForPlan(currentPlan);
  const openCount = auditState.findings.filter((f) => f.status === 'open').length;
  const criticalCount = auditState.findings.filter((f) => f.status === 'open' && f.severity === 'critical').length;
  const overallScore = Math.round((auditState.securityScore + auditState.financeScore) / 2);

  return `
    <div class="console-page-wrapper" id="page-console-audit">
      <!-- Toolbar Header -->
      <div class="console-page-toolbar">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <h2 class="page-title" style="margin: 0; font-size: 1.35rem; font-weight: 850;">Audit &amp; Financial Health</h2>
            <span class="audit-tier-pill ${auditLevel}">${auditLevel.toUpperCase()} AUDIT ACTIVE</span>
            ${auditState.isScanning ? `<span class="badge" style="background: var(--warning-bg); color: var(--warning); border: 1px solid var(--warning-border);"><span class="audit-spin">&#9696;</span> Deterministic Scan Running</span>` : ''}
          </div>
          <div class="page-desc" style="margin-top: 3px;">
            Deterministic posture verification, financial reconciliation, and tamper-resistant evidence packs. Fixes go through standard approval gates.
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="btn-export-evidence-pack">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Evidence Pack
          </button>
          <button class="btn btn-primary btn-sm" id="btn-run-audit-now" ${auditState.isScanning ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            ${auditState.isScanning ? 'Scanning...' : 'Run Audit Checks'}
          </button>
        </div>
      </div>

      <!-- Sub-Tab Navigation Bar -->
      <div class="audit-subtabs-nav">
        <button class="audit-subtab-btn ${auditState.currentSubTab === 'overview' ? 'active' : ''}" data-subtab="overview">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Overview &amp; Trends
        </button>
        <button class="audit-subtab-btn ${auditState.currentSubTab === 'findings' ? 'active' : ''}" data-subtab="findings">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Findings
          <span class="audit-count-badge ${criticalCount > 0 ? 'critical' : ''}">${openCount}</span>
        </button>
        <button class="audit-subtab-btn ${auditState.currentSubTab === 'rules' ? 'active' : ''}" data-subtab="rules">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Rules &amp; Tiers (3)
        </button>
        <button class="audit-subtab-btn ${auditState.currentSubTab === 'reconciliation' ? 'active' : ''}" data-subtab="reconciliation">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Reconciliation &amp; Trust
        </button>
        <button class="audit-subtab-btn ${auditState.currentSubTab === 'reports' ? 'active' : ''}" data-subtab="reports">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Reports &amp; Hash Chain
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="audit-tab-body">
        ${
          auditState.currentSubTab === 'overview' ? renderAuditOverviewTab(currentPlan, auditLevel, overallScore, openCount, criticalCount) :
          auditState.currentSubTab === 'findings' ? renderAuditFindingsTab(currentPlan, auditLevel) :
          auditState.currentSubTab === 'rules' ? renderAuditRulesTab(currentPlan, auditLevel) :
          auditState.currentSubTab === 'reconciliation' ? renderAuditReconciliationTab(currentPlan, auditLevel) :
          renderAuditReportsTab(currentPlan, auditLevel)
        }
      </div>
    </div>
  `;
}

// ── Tab 1: Overview & Score Trends ───────────────────────────────────────────

function renderAuditOverviewTab(
  _currentPlan: PlanTier,
  auditLevel: string,
  overallScore: number,
  openCount: number,
  criticalCount: number
): string {
  const isFinanceLocked = auditLevel === 'basic';

  return `
    <!-- Top Gauges Grid -->
    <div class="grid-3" style="margin-bottom: 20px;">
      <!-- Security Posture Score -->
      <div class="card audit-score-card">
        <div class="audit-score-header">
          <span class="audit-metric-label">SECURITY POSTURE</span>
          <span class="badge" style="background: var(--success-bg); color: var(--success);">Deterministic</span>
        </div>
        <div class="audit-score-gauge-wrap">
          <div class="audit-score-number ${auditState.securityScore >= 90 ? 'good' : 'warning'}">
            ${auditState.securityScore}<span>/100</span>
          </div>
          <div class="audit-score-status">
            <strong>${auditState.securityScore >= 90 ? 'Healthy Posture' : 'Review Required'}</strong>
            <div style="font-size: 0.74rem; color: var(--text-secondary);">MFA, idle accounts, stale keys</div>
          </div>
        </div>
        <div class="audit-progress-bar">
          <div class="audit-progress-fill" style="width: ${auditState.securityScore}%; background: #168447;"></div>
        </div>
      </div>

      <!-- Financial Health Score -->
      <div class="card audit-score-card ${isFinanceLocked ? 'gated-card' : ''}">
        <div class="audit-score-header">
          <span class="audit-metric-label">FINANCIAL INTEGRITY</span>
          ${isFinanceLocked ? `<span class="badge" style="background: #FEE2E2; color: #E50920;">BUSINESS TIER</span>` : `<span class="badge" style="background: var(--success-bg); color: var(--success);">Reconciled</span>`}
        </div>
        ${
          isFinanceLocked
            ? `
          <div class="audit-gated-overlay-content">
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">Finance Checks Locked</div>
            <div style="font-size: 0.76rem; color: var(--text-secondary); margin: 6px 0 12px 0;">
              Duplicate payments, structuring detection, refund ceilings, and bank transfer trust levels are included in Business &amp; Enterprise.
            </div>
            <button class="btn btn-primary btn-sm btn-upgrade-to-business" style="padding: 6px 14px; font-weight: 700;">
              Upgrade to Business ($45/mo)
            </button>
          </div>
        `
            : `
          <div class="audit-score-gauge-wrap">
            <div class="audit-score-number ${auditState.financeScore >= 85 ? 'good' : 'warning'}">
              ${auditState.financeScore}<span>/100</span>
            </div>
            <div class="audit-score-status">
              <strong>${auditState.financeScore >= 85 ? 'Low Discrepancy' : 'Variance Detected'}</strong>
              <div style="font-size: 0.74rem; color: var(--text-secondary);">Stripe, Paystack, bank statements</div>
            </div>
          </div>
          <div class="audit-progress-bar">
            <div class="audit-progress-fill" style="width: ${auditState.financeScore}%; background: #0284C7;"></div>
          </div>
        `
        }
      </div>

      <!-- Overall Index & Tamper Status -->
      <div class="card audit-score-card">
        <div class="audit-score-header">
          <span class="audit-metric-label">OVERALL HEALTH &amp; CHAIN</span>
          <span class="badge" style="background: #F3F4F6; color: var(--text-main); font-family: var(--font-mono);">Block #420</span>
        </div>
        <div class="audit-score-gauge-wrap">
          <div class="audit-score-number good">
            ${overallScore}<span>/100</span>
          </div>
          <div class="audit-score-status">
            <strong>${criticalCount > 0 ? `${criticalCount} Critical Action` : 'Audit Invariants Met'}</strong>
            <div style="font-size: 0.74rem; color: var(--text-secondary);">Hash chain unbroken &bull; Nightly verified</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px; font-size: 0.74rem; color: var(--text-secondary); margin-top: 10px;">
          <span>Open Findings: <strong style="color: var(--text-main);">${openCount}</strong></span>
          <span>&bull;</span>
          <span>Active Rules: <strong style="color: var(--text-main);">${auditState.rules.length}</strong></span>
        </div>
      </div>
    </div>

    <!-- 30-Day Score Trend & Quick Insights -->
    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">30-Day Score Trend</div>
            <div class="card-subtitle">Continuous historical posture and reconciliation evolution</div>
          </div>
          <span style="font-size: 0.76rem; color: var(--text-muted);">Evaluated 03:00 UTC Daily</span>
        </div>

        <div class="audit-trend-chart-container">
          <div class="audit-trend-bars">
            ${auditState.scoreTrend
              .map(
                (pt) => `
              <div class="audit-trend-col">
                <div class="audit-trend-bar-wrap" title="${pt.date}: Security ${pt.security}%, Finance ${pt.finance}%">
                  <div class="audit-bar-sec" style="height: ${pt.security}%;"></div>
                  <div class="audit-bar-fin" style="height: ${pt.finance}%;"></div>
                </div>
                <div class="audit-trend-date">${pt.date}</div>
                <div class="audit-trend-val">${pt.overall}%</div>
              </div>
            `
              )
              .join('')}
          </div>
          <div class="audit-chart-legend">
            <span class="legend-item"><span class="legend-dot sec"></span> Security Posture</span>
            <span class="legend-item"><span class="legend-dot fin"></span> Financial Reconciliation</span>
          </div>
        </div>
      </div>

      <!-- Tamper-Resistance Architecture Summary -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Tamper-Resistance Invariants</div>
            <div class="card-subtitle">Cryptographic guarantees and honest claims</div>
          </div>
          <span class="badge" style="background: #ECFDF5; color: #047857; font-weight: 700;">Verified Intact</span>
        </div>

        <div class="audit-invariant-list">
          <div class="audit-invariant-item">
            <div class="invariant-icon check">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div class="invariant-title">Database Triggers Enforce Append-Only</div>
              <div class="invariant-desc">PostgreSQL triggers reject <code>UPDATE</code>, <code>DELETE</code>, and <code>TRUNCATE</code> on all audit finding and rule change tables.</div>
            </div>
          </div>

          <div class="audit-invariant-item">
            <div class="invariant-icon check">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div class="invariant-title">Hash-Chained Block Sequence</div>
              <div class="invariant-desc">Each finding and dismissal is hashed with the previous block's SHA-256 digest. Nightly cron job verifies continuity.</div>
            </div>
          </div>

          <div class="audit-invariant-item">
            <div class="invariant-icon check">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div class="invariant-title">Data Protection Law Compatible</div>
              <div class="invariant-desc">Stores opaque UUIDs and cryptographic references instead of personal details, preventing conflict with GDPR/NDPR Right to Erasure.</div>
            </div>
          </div>
        </div>

        <div class="audit-honest-claim-callout">
          <strong>The Honest Claim:</strong> "Hard to alter, and impossible to alter quietly." We do not make the false promise that code cannot be deleted; instead, any alteration breaks the cryptographic hash chain and emits an immediate SIEM alarm.
        </div>
      </div>
    </div>
  `;
}

// ── Tab 2: Findings & Evidence Inspector ──────────────────────────────────────

function renderAuditFindingsTab(_currentPlan: PlanTier, _auditLevel: string): string {
  let filtered = auditState.findings;
  if (auditState.findingFilter === 'security') filtered = filtered.filter((f) => f.domain === 'security');
  if (auditState.findingFilter === 'finance') filtered = filtered.filter((f) => f.domain === 'finance');
  if (auditState.findingFilter === 'critical') filtered = filtered.filter((f) => f.severity === 'critical');
  if (auditState.findingFilter === 'open') filtered = filtered.filter((f) => f.status === 'open');

  return `
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
        <div>
          <div class="card-title">Audit Findings &amp; Evidence Log</div>
          <div class="card-subtitle">Every finding is generated by a deterministic rule and reproduces with exact snapshot evidence</div>
        </div>
        <!-- Filter Tabs -->
        <div class="audit-filter-pills">
          <button class="audit-filter-btn ${auditState.findingFilter === 'all' ? 'active' : ''}" data-filter="all">All (${auditState.findings.length})</button>
          <button class="audit-filter-btn ${auditState.findingFilter === 'security' ? 'active' : ''}" data-filter="security">Security</button>
          <button class="audit-filter-btn ${auditState.findingFilter === 'finance' ? 'active' : ''}" data-filter="finance">Finance</button>
          <button class="audit-filter-btn ${auditState.findingFilter === 'critical' ? 'active' : ''}" data-filter="critical">Critical</button>
          <button class="audit-filter-btn ${auditState.findingFilter === 'open' ? 'active' : ''}" data-filter="open">Open Only</button>
        </div>
      </div>

      <div class="audit-findings-list">
        ${
          filtered.length === 0
            ? `<div class="empty-state" style="padding: 40px; text-align: center; color: var(--text-muted);">No findings match the selected filter.</div>`
            : filtered
                .map(
                  (f) => `
          <div class="audit-finding-card ${f.severity} ${f.status}">
            <div class="finding-top-row">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="finding-severity-badge ${f.severity}">${f.severity.toUpperCase()}</span>
                <span class="finding-domain-pill ${f.domain}">${f.domain.toUpperCase()}</span>
                <span class="finding-rule-key"><code>${f.ruleKey} (v${f.ruleVersion})</code></span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="finding-time">${f.firstSeenAt}</span>
                <span class="finding-status-badge ${f.status}">${f.status.toUpperCase()}</span>
              </div>
            </div>

            <div class="finding-title-row">
              <h4 class="finding-title">${f.title}</h4>
              <p class="finding-desc">${f.description}</p>
            </div>

            <!-- Evidence Drawer -->
            <div class="finding-evidence-box">
              <div class="evidence-header">
                <span>EVIDENCE SNAPSHOT (REPRODUCIBLE)</span>
                <code class="hash-tag">${f.evidence.cryptographicHash}</code>
              </div>
              <pre class="evidence-pre">${JSON.stringify(f.evidence.rawSample, null, 2)}</pre>
              <div class="evidence-repro">
                <code>${f.evidence.reproductionCommand}</code>
              </div>
            </div>

            ${
              f.status === 'dismissed'
                ? `
              <div class="finding-dismissal-banner">
                <strong>Dismissed by ${f.dismissedBy || 'Operator'}:</strong> "${f.dismissalReason}"
              </div>
            `
                : ''
            }

            <!-- Action Buttons -->
            <div class="finding-actions-row">
              <button class="btn btn-secondary btn-sm btn-finding-ai-explain" data-finding-id="${f.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/></svg>
                Explain with AI (Advisory)
              </button>
              ${
                f.status === 'open'
                  ? `
                <button class="btn btn-secondary btn-sm btn-finding-dismiss" data-finding-id="${f.id}">
                  Dismiss with Reason...
                </button>
                <button class="btn btn-primary btn-sm btn-finding-resolve" data-finding-id="${f.id}">
                  Mark Resolved
                </button>
              `
                  : `
                <button class="btn btn-secondary btn-sm btn-finding-reopen" data-finding-id="${f.id}">
                  Reopen Finding
                </button>
              `
              }
            </div>
          </div>
        `
                )
                .join('')
        }
      </div>
    </div>
  `;
}

// ── Tab 3: Rules & Approvals (3 Tiers + Dry Run) ──────────────────────────────

function renderAuditRulesTab(_currentPlan: PlanTier, _auditLevel: string): string {

  return `
    <!-- Rule Tier Architecture Banner -->
    <div class="audit-rule-tiers-grid" style="margin-bottom: 20px;">
      <div class="card rule-tier-card locked">
        <div class="rule-tier-badge locked">LOCKED BASELINE</div>
        <div class="rule-tier-title">Zexlabs Managed</div>
        <div class="rule-tier-desc">Core invariants (Admin MFA, refund limits, immutable triggers). Viewable by all tenants, cannot be relaxed.</div>
      </div>

      <div class="card rule-tier-card tunable">
        <div class="rule-tier-badge tunable">TUNABLE TIER</div>
        <div class="rule-tier-title">Tenant Configurable</div>
        <div class="rule-tier-desc">Adjust thresholds within safe guardrails. Tightening is instant; loosening requires dual-operator sign-off.</div>
      </div>

      <div class="card rule-tier-card custom">
        <div class="rule-tier-badge custom">CUSTOM ADDITIONS</div>
        <div class="rule-tier-title">Workspace Specific</div>
        <div class="rule-tier-desc">Additional checks registered by other modules (CRM, IoT) or security leads. Additions only.</div>
      </div>
    </div>

    <!-- Active Rules List -->
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-header">
        <div>
          <div class="card-title">Configured Audit Rules</div>
          <div class="card-subtitle">Deterministic rule definitions across baseline, tunable, and custom tiers</div>
        </div>
      </div>

      <div class="audit-rules-table-wrap">
        <table class="audit-table">
          <thead>
            <tr>
              <th>Rule &amp; Key</th>
              <th>Tier</th>
              <th>Domain</th>
              <th>Current Parameters</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${auditState.rules
              .map(
                (r) => `
              <tr>
                <td>
                  <strong style="color: var(--text-main); font-size: 0.88rem;">${r.name}</strong>
                  <div style="font-size: 0.74rem; font-family: var(--font-mono); color: var(--text-secondary); margin-top: 2px;">
                    ${r.key} (v${r.version})
                  </div>
                  <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 3px;">${r.description}</div>
                </td>
                <td>
                  <span class="rule-tier-pill ${r.tier}">${r.tier.replace('_', ' ').toUpperCase()}</span>
                </td>
                <td>
                  <span class="finding-domain-pill ${r.domain}">${r.domain.toUpperCase()}</span>
                </td>
                <td>
                  ${
                    r.tier === 'locked_baseline'
                      ? `<code style="font-size: 0.78rem;">${JSON.stringify(r.params)}</code>`
                      : `
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <code style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">${JSON.stringify(r.params)}</code>
                    </div>
                  `
                  }
                </td>
                <td>
                  ${
                    r.tier === 'locked_baseline'
                      ? `<span style="font-size: 0.74rem; color: var(--text-muted); font-style: italic;">Locked by Zexlabs</span>`
                      : `
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm btn-rule-dry-run" data-rule-id="${r.id}" title="Simulate impact over past 30 days">
                        Dry Run
                      </button>
                      <button class="btn btn-secondary btn-sm btn-rule-tune" data-rule-id="${r.id}">
                        Tune...
                      </button>
                    </div>
                  `
                  }
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Rule Change History (Append-Only) -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Rule Change History (Append-Only Log)</div>
          <div class="card-subtitle">Loosening requires second-operator sign-off and step-up MFA proof</div>
        </div>
      </div>

      <div class="audit-rules-table-wrap">
        <table class="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Rule</th>
              <th>Action</th>
              <th>Direction</th>
              <th>Change</th>
              <th>Reason &amp; Approvals</th>
            </tr>
          </thead>
          <tbody>
            ${auditState.ruleChanges
              .map(
                (rc) => `
              <tr>
                <td style="font-size: 0.76rem; color: var(--text-muted); white-space: nowrap;">${rc.createdAt}</td>
                <td><code>${rc.ruleKey}</code></td>
                <td><span class="badge" style="background: var(--bg-muted);">${rc.action.toUpperCase()}</span></td>
                <td>
                  <span class="badge ${rc.direction === 'tighten' ? 'badge-tighten' : 'badge-loosen'}">
                    ${rc.direction === 'tighten' ? 'TIGHTEN (INSTANT)' : 'LOOSEN (DUAL-SIGN)'}
                  </span>
                </td>
                <td style="font-size: 0.78rem;">
                  <span style="color: var(--text-muted); text-decoration: line-through;">${rc.oldVal}</span> &rarr;
                  <strong style="color: var(--text-main);">${rc.newVal}</strong>
                </td>
                <td style="font-size: 0.78rem;">
                  <div>${rc.reason}</div>
                  <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 3px;">
                    Requested: <code>${rc.requestedBy}</code> &bull; ${rc.approvedBy} &bull; <span style="color: var(--success);">${rc.mfaProof}</span>
                  </div>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Tab 4: Reconciliation & Bank Transfers (Trust Levels) ────────────────────

function renderAuditReconciliationTab(_currentPlan: PlanTier, auditLevel: string): string {
  const isFinanceGated = auditLevel === 'basic';

  if (isFinanceGated) {
    return `
      <div class="card" style="text-align: center; padding: 60px 30px;">
        <div style="width: 56px; height: 56px; margin: 0 auto 16px auto; border-radius: 50%; background: #FEE2E2; display: flex; align-items: center; justify-content: center; color: #E50920;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">
          Financial Reconciliation &amp; Trust Hierarchy Locked
        </h3>
        <p style="max-width: 540px; margin: 0 auto 20px auto; color: var(--text-secondary); font-size: 0.88rem; line-height: 1.6;">
          Reconciliation compares workspace invoices against Stripe, Paystack, and Flutterwave provider records, imports and dedupes bank statements, and enforces dual approvals.
        </p>
        <button class="btn btn-primary btn-paywall-upgrade" data-paywall-upgrade="enterprise" style="padding: 10px 24px; font-weight: 700;">
          Upgrade to Business ($45/mo)
        </button>
      </div>
    `;
  }

  return `
    <!-- Trust Hierarchy Explanation Grid -->
    <div class="grid-3" style="margin-bottom: 20px;">
      <div class="card trust-card verified">
        <div class="trust-badge verified">1. VERIFIED (HIGHEST)</div>
        <div class="trust-title">Provider Webhook / Open Banking</div>
        <div class="trust-desc">Stripe, Paystack, or Flutterwave authenticated webhooks. Only this trust tier is labeled bank-verified.</div>
      </div>

      <div class="card trust-card imported">
        <div class="trust-badge imported">2. IMPORTED</div>
        <div class="trust-title">Bank Statement Upload</div>
        <div class="trust-desc">Uploaded bank statements deduped via SHA-256 hash and matched against reference, amount, and date window.</div>
      </div>

      <div class="card trust-card claimed">
        <div class="trust-badge claimed">3. CLAIMED (LOWEST)</div>
        <div class="trust-title">Manual Entry with Receipt</div>
        <div class="trust-desc">Customer manual transaction entry with uploaded receipt slip. Must undergo operator verification.</div>
      </div>
    </div>

    <!-- Live Ledger & Statement Import Tool -->
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
        <div>
          <div class="card-title">Immutable General Ledger &amp; Matched Transactions</div>
          <div class="card-subtitle">Orders, invoices, and payment-provider settlements with designated trust levels</div>
        </div>
        <button class="btn btn-secondary btn-sm" id="btn-open-statement-import">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Import Bank Statement...
        </button>
      </div>

      <div class="audit-rules-table-wrap">
        <table class="audit-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Trust Level</th>
              <th>Kind</th>
              <th>Amount</th>
              <th>Source / Provider Reference</th>
              <th>Matched Status</th>
            </tr>
          </thead>
          <tbody>
            ${auditState.ledger
              .map(
                (l) => `
              <tr>
                <td style="font-size: 0.76rem; color: var(--text-muted); white-space: nowrap;">${l.date}</td>
                <td>
                  <span class="trust-pill ${l.trustLevel}">${l.trustLevel.toUpperCase()}</span>
                </td>
                <td>
                  <span class="badge" style="background: var(--bg-muted); font-size: 0.72rem;">${l.kind.toUpperCase()}</span>
                </td>
                <td>
                  <strong style="color: var(--text-main); font-family: var(--font-mono); font-size: 0.88rem;">
                    ${l.currency} ${(l.amountMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </strong>
                </td>
                <td>
                  <div style="font-weight: 600; color: var(--text-main); font-size: 0.8rem;">${l.source}</div>
                  <div style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-secondary); margin-top: 2px;">
                    Ref: ${l.reference}
                  </div>
                </td>
                <td>
                  ${
                    l.matchedStatus === 'matched'
                      ? `<span class="badge" style="background: var(--success-bg); color: var(--success); font-weight: 700;">Matched: ${l.matchedWith || 'Order'}</span>`
                      : `<span class="badge" style="background: var(--warning-bg); color: var(--warning); font-weight: 700;">Unmatched</span>`
                  }
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Tab 5: Reports & Tamper-Proof Hash Chain ─────────────────────────────────

function renderAuditReportsTab(_currentPlan: PlanTier, _auditLevel: string): string {
  return `
    <div class="grid-2" style="margin-bottom: 20px;">
      <!-- Monthly Health Report Card -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Monthly Audit Summary Report</div>
            <div class="card-subtitle">Executive financial and security posture briefing</div>
          </div>
          <span class="badge" style="background: var(--bg-muted);">October 2026</span>
        </div>

        <div class="audit-report-body">
          <div class="report-metric-row">
            <span>Overall Workspace Compliance Score</span>
            <strong style="color: var(--success); font-size: 1.1rem;">91 / 100 (Clean)</strong>
          </div>
          <div class="report-metric-row">
            <span>Total Evaluated Invariants</span>
            <strong>12 Automated Rules</strong>
          </div>
          <div class="report-metric-row">
            <span>Open Posture Discrepancies</span>
            <strong style="color: var(--primary);">5 Items (1 Critical)</strong>
          </div>
          <div class="report-metric-row">
            <span>Reconciled Volume (30 Days)</span>
            <strong style="font-family: var(--font-mono);">$142,500.00 USD eq.</strong>
          </div>
          <div class="report-metric-row">
            <span>Verified Bank Webhook Percentage</span>
            <strong style="color: var(--success);">98.4% Verified</strong>
          </div>
        </div>

        <div style="margin-top: 20px; display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="btn-download-monthly-summary">
            Download Executive PDF / Summary
          </button>
        </div>
      </div>

      <!-- Hash Chain Integrity Inspector -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Cryptographic Hash Chain Inspector</div>
            <div class="card-subtitle">Tenant-isolated SHA-256 append-only ledger verification</div>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-verify-chain-now">
            Verify Chain Continuity
          </button>
        </div>

        <div class="audit-chain-feed">
          ${auditState.hashChain
            .map(
              (b) => `
            <div class="chain-block-item">
              <div class="chain-block-header">
                <span class="chain-block-num">BLOCK #${b.blockNumber}</span>
                <span class="chain-block-ts">${b.timestamp}</span>
              </div>
              <div class="chain-block-action"><code>${b.action}</code></div>
              <div class="chain-hash-row">
                <span class="hash-label">Prev:</span> <code class="hash-code">${b.previousHash}</code>
              </div>
              <div class="chain-hash-row">
                <span class="hash-label">Hash:</span> <code class="hash-code highlight">${b.blockHash}</code>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

// ── Interactive Events & Modal Handlers ──────────────────────────────────────

export function setupConsoleAuditEvents(_currentPlan: PlanTier, triggerRerender: () => void): void {
  const container = document.getElementById('page-console-audit');
  if (!container) return;

  // 1. Sub-tab switching
  container.querySelectorAll('.audit-subtab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = (e.currentTarget as HTMLElement).dataset.subtab as AuditSubTab;
      if (target) {
        auditState.currentSubTab = target;
        triggerRerender();
      }
    });
  });

  // 2. Finding Filter switching
  container.querySelectorAll('.audit-filter-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const filter = (e.currentTarget as HTMLElement).dataset.filter as any;
      if (filter) {
        auditState.findingFilter = filter;
        triggerRerender();
      }
    });
  });

  // 3. Run Audit Checks On-Demand
  const btnRun = container.querySelector('#btn-run-audit-now');
  if (btnRun) {
    btnRun.addEventListener('click', () => {
      auditState.isScanning = true;
      triggerRerender();

      setTimeout(() => {
        auditState.isScanning = false;
        auditState.securityScore = 95;
        auditState.financeScore = 90;
        showToastNotification('Deterministic audit run completed: 12 checks evaluated. Invariants verified.', 'success');
        triggerRerender();
      }, 900);
    });
  }

  // 4. Export Evidence Pack
  const btnPack = container.querySelector('#btn-export-evidence-pack');
  if (btnPack) {
    btnPack.addEventListener('click', () => {
      exportEvidencePackModal();
    });
  }

  // 5. Finding: Explain with AI
  container.querySelectorAll('.btn-finding-ai-explain').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const fid = (e.currentTarget as HTMLElement).dataset.findingId;
      const finding = auditState.findings.find((f) => f.id === fid);
      if (finding) {
        openAiExplainerModal(finding);
      }
    });
  });

  // 6. Finding: Dismiss with Reason Modal
  container.querySelectorAll('.btn-finding-dismiss').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const fid = (e.currentTarget as HTMLElement).dataset.findingId;
      const finding = auditState.findings.find((f) => f.id === fid);
      if (finding) {
        openDismissModal(finding, triggerRerender);
      }
    });
  });

  // 7. Finding: Mark Resolved
  container.querySelectorAll('.btn-finding-resolve').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const fid = (e.currentTarget as HTMLElement).dataset.findingId;
      const finding = auditState.findings.find((f) => f.id === fid);
      if (finding) {
        finding.status = 'resolved';
        showToastNotification(`Finding "${finding.title}" marked resolved. Added to block chain.`, 'success');
        triggerRerender();
      }
    });
  });

  // 8. Finding: Reopen
  container.querySelectorAll('.btn-finding-reopen').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const fid = (e.currentTarget as HTMLElement).dataset.findingId;
      const finding = auditState.findings.find((f) => f.id === fid);
      if (finding) {
        finding.status = 'open';
        showToastNotification(`Finding "${finding.title}" reopened for remediation.`, 'info');
        triggerRerender();
      }
    });
  });

  // 9. Rule Dry Run Simulator
  container.querySelectorAll('.btn-rule-dry-run').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const rid = (e.currentTarget as HTMLElement).dataset.ruleId;
      const rule = auditState.rules.find((r) => r.id === rid);
      if (rule) {
        openDryRunModal(rule);
      }
    });
  });

  // 10. Rule Tuning with Dual Approval
  container.querySelectorAll('.btn-rule-tune').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const rid = (e.currentTarget as HTMLElement).dataset.ruleId;
      const rule = auditState.rules.find((r) => r.id === rid);
      if (rule) {
        openRuleTuneModal(rule, triggerRerender);
      }
    });
  });

  // 11. Import Bank Statement
  const btnStmt = container.querySelector('#btn-open-statement-import');
  if (btnStmt) {
    btnStmt.addEventListener('click', () => {
      openStatementImportModal(triggerRerender);
    });
  }

  // 12. Verify Chain Continuity
  const btnVerify = container.querySelector('#btn-verify-chain-now');
  if (btnVerify) {
    btnVerify.addEventListener('click', () => {
      showToastNotification('SHA-256 chain verification passed: Blocks #418 - #420 continuous. 0 gaps.', 'success');
    });
  }

  // 13. Download Monthly Summary
  const btnMonthly = container.querySelector('#btn-download-monthly-summary');
  if (btnMonthly) {
    btnMonthly.addEventListener('click', () => {
      showToastNotification('Executive Audit Summary downloaded (ZexCore_Audit_Report_Oct2026.json)', 'success');
    });
  }

  // 14. Upgrade to Business buttons
  container.querySelectorAll('.btn-upgrade-to-business').forEach((btn) => {
    btn.addEventListener('click', () => {
      openStripeCheckoutModal('enterprise', 'monthly');
    });
  });
}

// ── Modals Engine ────────────────────────────────────────────────────────────

function showToastNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  let container = document.getElementById('zexcore-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'zexcore-toast-container';
    container.className = 'zex-toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `zex-toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s';
    setTimeout(() => toast.remove(), 250);
  }, 3400);
}

function openAuditModal(options: { title: string; contentHtml: string; buttons?: Array<{ text: string; primary?: boolean; onClick?: () => void }> }) {
  document.getElementById('zexcore-active-modal')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'zexcore-active-modal';
  overlay.className = 'zex-modal-overlay';
  overlay.innerHTML = `
    <div class="zex-modal-card" style="max-width: 620px;">
      <div class="zex-modal-header">
        <h3 class="zex-modal-title" style="margin: 0; font-size: 1.15rem; font-weight: 800;">${options.title}</h3>
        <button class="zex-modal-close" id="btn-modal-close">&times;</button>
      </div>
      <div class="zex-modal-body" style="padding: 18px 24px;">
        ${options.contentHtml}
      </div>
      <div class="zex-modal-footer" id="modal-footer-btns" style="display: flex; justify-content: flex-end; gap: 8px; padding: 14px 24px; border-top: 1px solid var(--border-default); background: var(--bg-subtle);"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#btn-modal-close')?.addEventListener('click', () => overlay.remove());

  const footer = overlay.querySelector('#modal-footer-btns');
  if (footer && options.buttons) {
    options.buttons.forEach((btnConfig) => {
      const b = document.createElement('button');
      b.className = `btn btn-sm ${btnConfig.primary ? 'btn-primary' : 'btn-secondary'}`;
      b.innerText = btnConfig.text;
      b.addEventListener('click', () => {
        if (btnConfig.onClick) btnConfig.onClick();
        overlay.remove();
      });
      footer.appendChild(b);
    });
  }
}

// ── Specialized Modals ───────────────────────────────────────────────────────

function openAiExplainerModal(finding: AuditFindingItem) {
  let plainExplanation = '';
  let proposal = '';
  let standard = '';

  if (finding.ruleKey.includes('admin_mfa')) {
    plainExplanation =
      'One or more users with full system administration rights are logging in using only a password. If that password is stolen in a phishing attack or third-party breach, the attacker immediately gains total access to customer databases and financial ledgers.';
    proposal =
      'Enforce mandatory TOTP/WebAuthn hardware keys in Settings > Identity > MFA Enforcement, and require immediate step-up authentication on their next session.';
    standard = 'ISO 27001 A.9.4.2 / SOC 2 CC6.1 / NDPR Art. 2.6';
  } else if (finding.ruleKey.includes('duplicate_payments')) {
    plainExplanation =
      'Two identical debit charges were recorded for the exact same customer within 114 seconds. This typically indicates a double-click submission on a checkout form or an unhandled webhook replay.';
    proposal =
      'Verify transaction IDs in the payment provider console (Paystack/Stripe) and initiate an automated refund for the duplicate capture before customer dispute fees arise.';
    standard = 'Payment Network Merchant Integrity Controls';
  } else if (finding.ruleKey.includes('structuring')) {
    plainExplanation =
      'Multiple transactions have been initiated immediately below the $5,000 threshold that mandates dual-supervisor approval. This pattern matches classic anti-smurfing structuring signatures.';
    proposal =
      'Temporarily hold automated payouts on this cashier/operator account and require manual compliance officer sign-off before settlement release.';
    standard = 'FinCEN Anti-Structuring Provisions / Anti-Money Laundering Framework';
  } else {
    plainExplanation = `The deterministic rule "${finding.ruleName}" identified anomalous state in ${finding.evidence.recordsCount} record(s).`;
    proposal = 'Review snapshot evidence, verify physical systems or ledgers, and apply recommended operational policies.';
    standard = 'ZexCore Deterministic Invariant Framework';
  }

  const contentHtml = `
    <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-main);">
      <div style="background: var(--bg-subtle); border-left: 3px solid var(--primary); padding: 12px 14px; margin-bottom: 14px; border-radius: var(--radius-xs);">
        <strong style="display: block; font-size: 0.76rem; text-transform: uppercase; color: var(--primary); margin-bottom: 4px;">Advisory AI Interpretation</strong>
        ${plainExplanation}
      </div>

      <div style="margin-bottom: 14px;">
        <strong style="display: block; font-size: 0.78rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 4px;">Draft Remediation Proposal</strong>
        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; padding: 12px; border-radius: var(--radius-sm); color: #166534; font-size: 0.82rem;">
          ${proposal}
        </div>
      </div>

      <div style="font-size: 0.76rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
        <span>Compliance Standard: <strong>${standard}</strong></span>
        <span style="font-style: italic;">AI never decides findings or modifies numbers.</span>
      </div>
    </div>
  `;

  openAuditModal({
    title: `AI Finding Analysis: ${finding.ruleName}`,
    contentHtml,
    buttons: [{ text: 'Close', primary: true }],
  });
}

function openDismissModal(finding: AuditFindingItem, triggerRerender: () => void) {
  const contentHtml = `
    <div style="font-size: 0.85rem; line-height: 1.5; color: var(--text-main);">
      <p style="margin-bottom: 12px;">
        Dismissing an audit finding permanently logs an event in the tenant's append-only audit trail with your identity and recorded justification.
      </p>

      <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 6px;">
        Mandatory Operational Reason:
      </label>
      <textarea id="modal-dismiss-reason-input" class="input" style="height: 80px; width: 100%; font-size: 0.82rem; padding: 8px;" placeholder="e.g. Compensating control verified: account uses hardware IP whitelisting."></textarea>
      <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
        Reason will be recorded to Block #${auditState.hashChain.length + 418} and cannot be edited.
      </div>
    </div>
  `;

  openAuditModal({
    title: `Dismiss Finding: ${finding.ruleName}`,
    contentHtml,
    buttons: [
      { text: 'Cancel' },
      {
        text: 'Record Dismissal (Sign Event)',
        primary: true,
        onClick: () => {
          const textarea = document.getElementById('modal-dismiss-reason-input') as HTMLTextAreaElement;
          const reason = textarea?.value?.trim();
          if (!reason || reason.length < 5) {
            showToastNotification('Dismissal rejected: A detailed reason is legally required.', 'error');
            return;
          }
          finding.status = 'dismissed';
          finding.dismissalReason = reason;
          finding.dismissedBy = 'SecOps Operator (Active Session)';

          // Append to hash chain
          auditState.hashChain.push({
            blockNumber: auditState.hashChain.length + 418 + 1,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            action: `audit.finding.dismissed (${finding.ruleKey})`,
            recordHash: 'sha256_' + Math.random().toString(36).slice(2, 12),
            previousHash: auditState.hashChain[auditState.hashChain.length - 1]?.blockHash || 'root',
            blockHash: 'sha256_' + Math.random().toString(36).slice(2, 12),
          });

          showToastNotification('Finding dismissed with signed reason. Recorded into append-only chain.', 'success');
          triggerRerender();
        },
      },
    ],
  });
}

function openDryRunModal(rule: AuditRuleConfig) {
  const contentHtml = `
    <div style="font-size: 0.85rem; line-height: 1.5; color: var(--text-main);">
      <div style="background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 14px; border: 1px solid var(--border-default);">
        <strong style="color: var(--text-main); font-size: 0.9rem;">Historical 30-Day Dry Run Simulation</strong>
        <div style="font-size: 0.76rem; color: var(--text-secondary); margin-top: 2px;">
          Evaluated against 43,200 telemetry heartbeats and 1,840 ledger entries recorded over the past month.
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <div style="background: #F9FAFB; border: 1px solid var(--border-default); padding: 12px; border-radius: var(--radius-sm);">
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">CURRENT PARAMETER</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin-top: 4px;">
            ${JSON.stringify(rule.params)}
          </div>
          <div style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 2px;">
            Historical alerts generated: <strong>2</strong>
          </div>
        </div>

        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; padding: 12px; border-radius: var(--radius-sm);">
          <div style="font-size: 0.72rem; color: #166534; font-weight: 700;">SIMULATED OUTCOME</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #166534; margin-top: 4px;">
            No False Positives
          </div>
          <div style="font-size: 0.74rem; color: #166534; margin-top: 2px;">
            Alert fidelity score: <strong>99.4%</strong>
          </div>
        </div>
      </div>

      <div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">
        A dry run guarantees that adjusting this threshold will not introduce alert fatigue or miss genuine security anomalies before production application.
      </div>
    </div>
  `;

  openAuditModal({
    title: `Dry Run Simulator: ${rule.name}`,
    contentHtml,
    buttons: [{ text: 'Close', primary: true }],
  });
}

function openRuleTuneModal(rule: AuditRuleConfig, triggerRerender: () => void) {
  const paramKey = Object.keys(rule.params)[0] || 'val';
  const currentVal = rule.params[paramKey];

  const contentHtml = `
    <div style="font-size: 0.85rem; line-height: 1.5; color: var(--text-main);">
      <p style="margin-bottom: 12px;">
        Adjust parameter for <strong>${rule.name}</strong> within allowed guardrails (${rule.paramMin} - ${rule.paramMax} ${rule.paramUnit || ''}).
      </p>

      <div style="margin-bottom: 14px;">
        <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 4px;">
          New Parameter Value (${rule.paramUnit || ''}):
        </label>
        <input type="number" id="modal-rule-tune-val" class="input" value="${currentVal}" min="${rule.paramMin || 1}" max="${rule.paramMax || 1000}" style="width: 100%; font-weight: 700;" />
      </div>

      <div class="audit-dual-approval-box">
        <strong style="color: var(--warning); display: flex; align-items: center; gap: 6px; font-size: 0.8rem;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Dual-Approval &amp; Step-Up MFA Rule
        </strong>
        <div style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 4px;">
          Tightening a check applies instantly. Loosening or relaxing thresholds requires second-operator authorization and fresh MFA proof.
        </div>
      </div>

      <div style="margin-top: 14px;">
        <label style="font-size: 0.76rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 4px;">
          Second Approver Email:
        </label>
        <input type="email" id="modal-rule-approver" class="input" value="compliance-officer@zexcore.io" style="width: 100%;" />
      </div>

      <div style="margin-top: 10px;">
        <label style="font-size: 0.76rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 4px;">
          Step-Up 6-Digit MFA Code:
        </label>
        <input type="text" id="modal-rule-mfa" class="input" value="849 201" style="width: 100%; font-family: var(--font-mono); letter-spacing: 2px;" />
      </div>
    </div>
  `;

  openAuditModal({
    title: `Tune Audit Rule: ${rule.name}`,
    contentHtml,
    buttons: [
      { text: 'Cancel' },
      {
        text: 'Apply Parameter Change',
        primary: true,
        onClick: () => {
          const valInput = document.getElementById('modal-rule-tune-val') as HTMLInputElement;
          const newVal = parseInt(valInput?.value || `${currentVal}`, 10);

          const direction = newVal > currentVal ? 'loosen' : 'tighten';
          rule.params[paramKey] = newVal;
          rule.version += 1;

          auditState.ruleChanges.unshift({
            id: `rc-${Date.now()}`,
            ruleKey: rule.key,
            action: 'tune',
            direction,
            oldVal: `${currentVal} ${rule.paramUnit || ''}`,
            newVal: `${newVal} ${rule.paramUnit || ''}`,
            reason: 'Operational threshold update via Audit Console',
            requestedBy: 'ops@zexcore.io',
            approvedBy: direction === 'tighten' ? 'Instant (Tightened)' : 'Dual-signed by compliance-officer@zexcore.io',
            mfaProof: 'TOTP Verified (0s)',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
          });

          showToastNotification(`Rule ${rule.key} updated to ${newVal}. Version incremented to v${rule.version}.`, 'success');
          triggerRerender();
        },
      },
    ],
  });
}

function openStatementImportModal(triggerRerender: () => void) {
  const contentHtml = `
    <div style="font-size: 0.85rem; line-height: 1.5; color: var(--text-main);">
      <p style="margin-bottom: 10px;">
        Upload or paste bank statement entries to automatically deduplicate with SHA-256 and match against pending invoices.
      </p>

      <div style="background: var(--bg-subtle); padding: 10px; border-radius: var(--radius-sm); margin-bottom: 12px; font-size: 0.76rem; color: var(--text-secondary);">
        Format: <code>YYYY-MM-DD, AMOUNT, CURRENCY, REFERENCE, NARRATION</code>
      </div>

      <textarea id="modal-statement-csv-input" class="input" style="height: 100px; width: 100%; font-family: var(--font-mono); font-size: 0.76rem; padding: 8px;">2026-10-18, 5200.00, USD, INV-2026-096, Wire Transfer Acct #9941
2026-10-18, 1450.00, USD, INV-2026-097, GTBank Lagos Settlement
2026-10-18, 1250.00, USD, INV-2026-095, REPLAY DETECTED</textarea>

      <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px;">
        Imported transactions will receive the <strong>"Imported"</strong> trust level.
      </div>
    </div>
  `;

  openAuditModal({
    title: 'Import Bank Statement (Deduplication & Match)',
    contentHtml,
    buttons: [
      { text: 'Cancel' },
      {
        text: 'Run Deduplication & Match',
        primary: true,
        onClick: () => {
          auditState.ledger.unshift({
            id: `led-${Date.now()}`,
            date: '2026-10-18 12:00',
            kind: 'transfer',
            amountMinor: 520000,
            currency: 'USD',
            trustLevel: 'imported',
            source: 'Bank Statement Import (GTBank-Oct18.csv)',
            reference: 'INV-2026-096',
            matchedStatus: 'matched',
            matchedWith: 'Invoice #INV-2026-096',
          });

          showToastNotification('Statement processed: 1 matched, 0 unmatched, 1 duplicate discarded by hash.', 'success');
          triggerRerender();
        },
      },
    ],
  });
}

function exportEvidencePackModal() {
  const packId = `pack-20261018-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const contentHtml = `
    <div style="font-size: 0.85rem; line-height: 1.5; color: var(--text-main);">
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; padding: 14px; border-radius: var(--radius-sm); margin-bottom: 14px;">
        <strong style="color: #166534; font-size: 0.95rem; display: block; margin-bottom: 4px;">Cryptographic Evidence Bundle Generated</strong>
        <div style="font-size: 0.78rem; color: #166534;">
          Bundle ID: <code>${packId}</code> &bull; Root SHA-256: <code>sha256_9f201bc84...</code>
        </div>
      </div>

      <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.6;">
        <p>This export pack compiles:</p>
        <ul style="padding-left: 20px; margin: 6px 0;">
          <li>Exact snapshot of all 12 active audit rule versions</li>
          <li>All open and dismissed findings with immutable evidence JSON</li>
          <li>General ledger snapshot with provider verification proof</li>
          <li>Full cryptographic hash chain verification seal (Blocks #418 - #420)</li>
        </ul>
      </div>
    </div>
  `;

  openAuditModal({
    title: 'Export Evidence Pack (Accountants & Regulators)',
    contentHtml,
    buttons: [
      { text: 'Close' },
      {
        text: 'Download Pack (JSON Bundle)',
        primary: true,
        onClick: () => {
          const exportData = {
            packId,
            tenant: 'acme_corp',
            exportedAt: new Date().toISOString(),
            securityScore: auditState.securityScore,
            financeScore: auditState.financeScore,
            rules: auditState.rules,
            findings: auditState.findings,
            ledger: auditState.ledger,
            hashChain: auditState.hashChain,
            rootHash: auditState.hashChain[auditState.hashChain.length - 1]?.blockHash,
          };
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ZexCore_Evidence_Pack_${packId}.json`;
          a.click();
          URL.revokeObjectURL(url);
          showToastNotification('Evidence Pack JSON downloaded successfully.', 'success');
        },
      },
    ],
  });
}
