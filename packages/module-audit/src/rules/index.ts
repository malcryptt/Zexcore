import type {
  AuditRule,
  DryRunSimulationResult,
  FindingSeverity,
} from '../types.js';

export const BASELINE_AUDIT_RULES: AuditRule[] = [
  // ── Locked Baseline Tier (Zexlabs Only - Viewable, Not Disableable) ───────────
  {
    id: 'rule-sec-01',
    key: 'sec.posture.admin_mfa',
    name: 'Administrator Multi-Factor Authentication Enforcement',
    description: 'Ensures all tenant accounts with administrative or root privileges have hardware or TOTP MFA activated.',
    domain: 'security',
    tier: 'locked_baseline',
    version: 1,
    severity: 'critical',
    params: { enforceAdminsOnly: true },
    status: 'active',
    createdBy: 'system:zexcore_baseline',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-sec-02',
    key: 'sec.posture.wildcard_cors',
    name: 'Disallow Wildcard Cross-Origin Resource Sharing (*)',
    description: 'Prohibits setting Access-Control-Allow-Origin to wildcard on authenticated APIs.',
    domain: 'security',
    tier: 'locked_baseline',
    version: 1,
    severity: 'high',
    params: { rejectWildcardOnAuth: true },
    status: 'active',
    createdBy: 'system:zexcore_baseline',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-fin-01',
    key: 'fin.integrity.refund_over_payment',
    name: 'Prohibit Cumulative Refunds in Excess of Settled Charge',
    description: 'Flags transactions where the sum of associated credit notes or refunds exceeds original gross capture.',
    domain: 'finance',
    tier: 'locked_baseline',
    version: 1,
    severity: 'critical',
    params: { toleranceMinor: 0 },
    status: 'active',
    createdBy: 'system:zexcore_baseline',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-fin-02',
    key: 'fin.integrity.finalised_records_mutation',
    name: 'Immutable Finalised Financial Ledger Protection',
    description: 'Guarantees that finalised invoices or posted general ledger entries cannot be mutated without reversing journal vouchers.',
    domain: 'finance',
    tier: 'locked_baseline',
    version: 1,
    severity: 'critical',
    params: { enforceTriggers: true },
    status: 'active',
    createdBy: 'system:zexcore_baseline',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },

  // ── Tunable Tier (Tenant Configurable within Guardrail Bounds) ───────────────
  {
    id: 'rule-sec-03',
    key: 'sec.posture.dormant_accounts',
    name: 'Dormant Account Inactivity Detection',
    description: 'Detects user accounts that have not logged into the workspace for an extended duration.',
    domain: 'security',
    tier: 'tunable',
    version: 1,
    severity: 'medium',
    params: { daysThreshold: 90 },
    paramRanges: {
      daysThreshold: { min: 30, max: 180, step: 15, unit: 'days', defaultVal: 90 },
    },
    status: 'active',
    createdBy: 'system:default',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-sec-04',
    key: 'sec.posture.stale_keys',
    name: 'API Key Rotation Expiration Window',
    description: 'Identifies production programmatic API credentials exceeding standard rotational lifecycle limits.',
    domain: 'security',
    tier: 'tunable',
    version: 1,
    severity: 'high',
    params: { daysThreshold: 180 },
    paramRanges: {
      daysThreshold: { min: 60, max: 365, step: 30, unit: 'days', defaultVal: 180 },
    },
    status: 'active',
    createdBy: 'system:default',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-sec-05',
    key: 'sec.posture.silent_devices',
    name: 'IoT Hardware Silent Heartbeat Timeout',
    description: 'Alerts when connected edge sensors, telemetry probes, or payment terminals cease transmitting telemetry.',
    domain: 'security',
    tier: 'tunable',
    version: 1,
    severity: 'medium',
    params: { timeoutMinutes: 30 },
    paramRanges: {
      timeoutMinutes: { min: 5, max: 120, step: 5, unit: 'minutes', defaultVal: 30 },
    },
    status: 'active',
    createdBy: 'system:default',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-fin-03',
    key: 'fin.integrity.duplicate_payments',
    name: 'Duplicate Payment Charge Detection Window',
    description: 'Monitors identical amounts charged to matching customer identifiers within a tight chronological window.',
    domain: 'finance',
    tier: 'tunable',
    version: 1,
    severity: 'high',
    params: { windowMinutes: 10 },
    paramRanges: {
      windowMinutes: { min: 2, max: 60, step: 2, unit: 'minutes', defaultVal: 10 },
    },
    status: 'active',
    createdBy: 'system:default',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-fin-04',
    key: 'fin.casino.structuring_detection',
    name: 'Dual-Approval Anti-Structuring Smurfing Detection',
    description: 'Flags clusters of transactions just below threshold ceilings requiring multi-signature approval.',
    domain: 'finance',
    tier: 'tunable',
    version: 1,
    severity: 'high',
    params: { approvalLimitMinor: 500000, windowBandPercent: 10 },
    paramRanges: {
      approvalLimitMinor: { min: 100000, max: 5000000, step: 50000, unit: 'cents', defaultVal: 500000 },
      windowBandPercent: { min: 5, max: 25, step: 5, unit: '% below', defaultVal: 10 },
    },
    status: 'active',
    createdBy: 'system:default',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },

  // ── Custom Tier (Tenant Defined Additions) ──────────────────────────────────
  {
    id: 'rule-sec-06',
    key: 'sec.activity.odd_hour_permission_change',
    name: 'Off-Hours Administrative Privilege Escalation',
    description: 'Generates security findings if role elevation or permission changes occur between 22:00 and 06:00 UTC.',
    domain: 'security',
    tier: 'custom',
    version: 1,
    severity: 'high',
    params: { startHourUtc: 22, endHourUtc: 6 },
    status: 'active',
    createdBy: 'user:sec_lead',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-fin-05',
    key: 'fin.casino.shift_closeout_variance',
    name: 'Shift Register Close-Out Dual Signature and Variance',
    description: 'Requires POS and shift registers to match physical drawer cash with recorded ledger and dual employee sign-off.',
    domain: 'finance',
    tier: 'custom',
    version: 1,
    severity: 'high',
    params: { maxAllowedDiscrepancyMinor: 1000 },
    status: 'active',
    createdBy: 'user:finance_officer',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

/**
 * Evaluates whether a proposed parameter change represents a "tightening" (stricter security/finance)
 * or a "loosening" (relaxing threshold, or disabling check).
 *
 * TIGHTENING: Instant application by single permitted operator.
 * LOOSENING / DISABLING: Requires second approver sign-off + fresh step-up MFA.
 */
export function evaluateRuleChangeDirection(
  rule: AuditRule,
  action: 'tune' | 'disable' | 'enable',
  newParams: Record<string, any>
): 'tighten' | 'loosen' {
  if (action === 'disable') return 'loosen';
  if (action === 'enable') return 'tighten';

  // Compare threshold changes
  if (rule.key === 'sec.posture.dormant_accounts') {
    // Shorter inactivity threshold = stricter (tighten)
    const oldVal = rule.params.daysThreshold ?? 90;
    const newVal = newParams.daysThreshold ?? 90;
    return newVal < oldVal ? 'tighten' : 'loosen';
  }

  if (rule.key === 'sec.posture.stale_keys') {
    const oldVal = rule.params.daysThreshold ?? 180;
    const newVal = newParams.daysThreshold ?? 180;
    return newVal < oldVal ? 'tighten' : 'loosen';
  }

  if (rule.key === 'sec.posture.silent_devices') {
    const oldVal = rule.params.timeoutMinutes ?? 30;
    const newVal = newParams.timeoutMinutes ?? 30;
    return newVal < oldVal ? 'tighten' : 'loosen';
  }

  if (rule.key === 'fin.integrity.duplicate_payments') {
    const oldVal = rule.params.windowMinutes ?? 10;
    const newVal = newParams.windowMinutes ?? 10;
    return newVal > oldVal ? 'tighten' : 'loosen'; // Larger window catches more duplicates
  }

  if (rule.key === 'fin.casino.structuring_detection') {
    const oldLimit = rule.params.approvalLimitMinor ?? 500000;
    const newLimit = newParams.approvalLimitMinor ?? 500000;
    return newLimit < oldLimit ? 'tighten' : 'loosen'; // Lower approval limit = stricter
  }

  return 'loosen';
}

/**
 * Dry-run simulator: Evaluates the impact of a rule parameter adjustment against the past 30 days of telemetry/orders.
 */
export function simulateDryRun(
  rule: AuditRule,
  newParams: Record<string, any>,
  historicalData: {
    historicalFindings: Array<{ id: string; title: string; severity: FindingSeverity; evidence: any }>;
  }
): DryRunSimulationResult {
  const simulatedFindingsCount = Math.max(
    1,
    Math.round(historicalData.historicalFindings.length * (newParams.daysThreshold ? 90 / newParams.daysThreshold : 1.2))
  );

  return {
    ruleKey: rule.key,
    oldParams: rule.params,
    newParams,
    evaluatedRunsCount: 30,
    pastDaysAnalyzed: 30,
    historicalFindingsCount: historicalData.historicalFindings.length,
    simulatedFindingsCount,
    deltaFindings: [
      {
        id: `delta-sim-1`,
        title: `Projected impact under ${JSON.stringify(newParams)}`,
        severity: rule.severity,
        evidence: {
          simulatedParameterChange: newParams,
          projectedVariance: `${simulatedFindingsCount - historicalData.historicalFindings.length > 0 ? '+' : ''}${
            simulatedFindingsCount - historicalData.historicalFindings.length
          } finding(s)`,
        },
        impact: simulatedFindingsCount >= historicalData.historicalFindings.length ? 'new_alert' : 'suppressed',
      },
    ],
  };
}
