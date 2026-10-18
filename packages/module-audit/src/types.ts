/**
 * @zexcore/module-audit - Type Definitions
 * Deterministic Workspace Security Posture and Financial Health Engine
 */

export type RuleTier = 'locked_baseline' | 'tunable' | 'custom';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type FindingStatus = 'open' | 'investigating' | 'dismissed' | 'resolved';

export type TrustLevel = 'verified' | 'imported' | 'claimed';

export type CheckDomain = 'security' | 'finance' | 'iot' | 'crm' | 'core';

export interface AuditRuleParameterRange {
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  unit?: string;
  defaultVal: any;
}

export interface AuditRule {
  id: string;
  key: string;
  name: string;
  description: string;
  domain: CheckDomain;
  tier: RuleTier;
  version: number;
  severity: FindingSeverity;
  params: Record<string, any>;
  paramRanges?: Record<string, AuditRuleParameterRange>;
  status: 'active' | 'disabled' | 'pending_approval';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditRuleChange {
  id: string;
  ruleId: string;
  ruleKey: string;
  action: 'tune' | 'disable' | 'enable';
  direction: 'tighten' | 'loosen';
  oldParams: Record<string, any>;
  newParams: Record<string, any>;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  mfaProof?: {
    method: 'totp' | 'webauthn' | 'sms_otp';
    freshnessSeconds: number;
    verifiedAt: string;
  };
  status: 'applied' | 'pending_second_approval' | 'rejected';
  createdAt: string;
  appliedAt?: string;
}

export interface FindingEvidence {
  ruleKey: string;
  ruleVersion: number;
  domain: CheckDomain;
  occurredAt: string;
  records: Array<{
    id: string;
    type: string;
    reference?: string;
    details: Record<string, any>;
  }>;
  calculatedValues: Record<string, any>;
  reproductionCommand: string;
  cryptographicHash: string;
}

export interface AuditFinding {
  id: string;
  tenantId: string;
  ruleKey: string;
  ruleName: string;
  ruleVersion: number;
  domain: CheckDomain;
  severity: FindingSeverity;
  title: string;
  description: string;
  evidence: FindingEvidence;
  status: FindingStatus;
  dismissalReason?: string;
  dismissedBy?: string;
  dismissedAt?: string;
  resolvedAt?: string;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface AuditFindingEvent {
  id: string;
  findingId: string;
  action: 'created' | 'status_changed' | 'dismissed' | 'reopened' | 'resolved';
  reason?: string;
  actor: string;
  previousStatus?: FindingStatus;
  newStatus?: FindingStatus;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  tenantId: string;
  kind: 'charge' | 'refund' | 'payout' | 'transfer' | 'fee' | 'adjustment';
  amountMinor: number;
  currency: string;
  trustLevel: TrustLevel;
  source: 'stripe' | 'paystack' | 'flutterwave' | 'bank_statement' | 'manual_claim' | 'open_banking';
  reference: string;
  statementHash?: string;
  narration?: string;
  matchedRecordId?: string;
  matchedStatus: 'unmatched' | 'matched' | 'ambiguous' | 'disputed';
  actorId?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface BankStatementTransaction {
  id: string;
  date: string;
  amountMinor: number;
  currency: string;
  reference: string;
  narration: string;
  rawHash: string;
}

export interface StatementImportResult {
  statementHash: string;
  importedCount: number;
  duplicateCount: number;
  matchedCount: number;
  unmatchedCount: number;
  transactions: Array<{
    tx: BankStatementTransaction;
    matchStatus: 'matched' | 'unmatched' | 'duplicate';
    matchedWith?: string;
  }>;
}

export interface AuditRun {
  id: string;
  tenantId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  rulesEvaluated: number;
  ruleVersions: Record<string, number>;
  findingsGenerated: number;
  securityScore: number;
  financeScore: number;
  overallScore: number;
  dryRun?: boolean;
}

export interface HashChainBlock {
  blockNumber: number;
  tenantId: string;
  timestamp: string;
  actionType: string;
  recordId: string;
  recordHash: string;
  previousHash: string;
  blockHash: string;
}

export interface AuditReportSummary {
  tenantId: string;
  month: string;
  generatedAt: string;
  securityScore: number;
  financeScore: number;
  overallScore: number;
  scoreTrend: Array<{ date: string; security: number; finance: number; overall: number }>;
  activeRulesCount: number;
  totalFindingsCount: number;
  openFindingsCount: number;
  criticalCount: number;
  reconciliationStatus: {
    totalVolumeMinor: number;
    verifiedVolumeMinor: number;
    importedVolumeMinor: number;
    claimedVolumeMinor: number;
    unmatchedCount: number;
  };
  hashChainVerified: boolean;
  tamperProofBlockCount: number;
}

export interface EvidencePackBundle {
  packId: string;
  tenantId: string;
  generatedAt: string;
  generatedBy: string;
  timeRange: { start: string; end: string };
  tenantMetadata: {
    legalEntity?: string;
    jurisdiction?: string;
    currency: string;
  };
  rulesSnapshot: AuditRule[];
  findings: AuditFinding[];
  findingEvents: AuditFindingEvent[];
  ledgerSnapshot: LedgerEntry[];
  hashChainAudit: {
    chainLength: number;
    isContinuous: boolean;
    latestRootHash: string;
    verifiedAt: string;
  };
  checksumSHA256: string;
}

export interface DryRunSimulationResult {
  ruleKey: string;
  oldParams: Record<string, any>;
  newParams: Record<string, any>;
  evaluatedRunsCount: number;
  pastDaysAnalyzed: number;
  historicalFindingsCount: number;
  simulatedFindingsCount: number;
  deltaFindings: Array<{
    id: string;
    title: string;
    severity: FindingSeverity;
    evidence: Record<string, any>;
    impact: 'new_alert' | 'suppressed';
  }>;
}
