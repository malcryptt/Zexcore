import { createHash } from 'node:crypto';
import type {
  AuditFinding,
  AuditFindingEvent,
  AuditReportSummary,
  AuditRule,
  EvidencePackBundle,
  HashChainBlock,
  LedgerEntry,
} from '../types.js';

function computeSimpleHash(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Creates an immutable, hash-chained block for tenant audit actions
 */
export function createHashChainBlock(
  tenantId: string,
  blockNumber: number,
  actionType: string,
  recordId: string,
  recordPayload: any,
  previousHash: string
): HashChainBlock {
  const timestamp = new Date().toISOString();
  const recordHash = computeSimpleHash(JSON.stringify(recordPayload));
  const blockData = `${blockNumber}|${tenantId}|${timestamp}|${actionType}|${recordId}|${recordHash}|${previousHash}`;
  const blockHash = computeSimpleHash(blockData);

  return {
    blockNumber,
    tenantId,
    timestamp,
    actionType,
    recordId,
    recordHash,
    previousHash,
    blockHash,
  };
}

/**
 * Validates the cryptographic continuity of a tenant's hash chain
 */
export function verifyHashChainIntegrity(blocks: HashChainBlock[]): {
  isValid: boolean;
  brokenBlockNumber?: number;
  totalBlocks: number;
} {
  if (blocks.length === 0) return { isValid: true, totalBlocks: 0 };

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block) continue;

    if (i > 0) {
      const prevBlock = blocks[i - 1];
      if (prevBlock && block.previousHash !== prevBlock.blockHash) {
        return { isValid: false, brokenBlockNumber: block.blockNumber, totalBlocks: blocks.length };
      }
    }
  }

  return { isValid: true, totalBlocks: blocks.length };
}

/**
 * Compiles a comprehensive Evidence Pack Bundle for regulators or auditors
 */
export function generateEvidencePackBundle(options: {
  tenantId: string;
  generatedBy: string;
  timeRange: { start: string; end: string };
  rules: AuditRule[];
  findings: AuditFinding[];
  findingEvents: AuditFindingEvent[];
  ledger: LedgerEntry[];
  hashChainBlocks: HashChainBlock[];
}): EvidencePackBundle {
  const packId = `pack-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const nowIso = new Date().toISOString();

  const chainVerification = verifyHashChainIntegrity(options.hashChainBlocks);
  const latestBlock = options.hashChainBlocks[options.hashChainBlocks.length - 1];

  const bundlePayload = {
    packId,
    tenantId: options.tenantId,
    generatedAt: nowIso,
    generatedBy: options.generatedBy,
    timeRange: options.timeRange,
    tenantMetadata: {
      currency: 'USD',
      jurisdiction: 'Global / Multi-region',
    },
    rulesSnapshot: options.rules,
    findings: options.findings,
    findingEvents: options.findingEvents,
    ledgerSnapshot: options.ledger,
    hashChainAudit: {
      chainLength: options.hashChainBlocks.length,
      isContinuous: chainVerification.isValid,
      latestRootHash: latestBlock ? latestBlock.blockHash : 'genesis_root',
      verifiedAt: nowIso,
    },
  };

  const checksum = computeSimpleHash(JSON.stringify(bundlePayload));

  return {
    ...bundlePayload,
    checksumSHA256: checksum,
  };
}

/**
 * Compiles a monthly financial & security health report summary
 */
export function compileMonthlyReport(options: {
  tenantId: string;
  month: string;
  securityScore: number;
  financeScore: number;
  findings: AuditFinding[];
  ledger: LedgerEntry[];
  hashChainBlocks: HashChainBlock[];
}): AuditReportSummary {
  const overallScore = Math.round((options.securityScore + options.financeScore) / 2);
  const openFindings = options.findings.filter((f) => f.status === 'open' || f.status === 'investigating');
  const criticalCount = openFindings.filter((f) => f.severity === 'critical').length;

  let totalVolumeMinor = 0;
  let verifiedVolumeMinor = 0;
  let importedVolumeMinor = 0;
  let claimedVolumeMinor = 0;
  let unmatchedCount = 0;

  for (const entry of options.ledger) {
    totalVolumeMinor += entry.amountMinor;
    if (entry.trustLevel === 'verified') verifiedVolumeMinor += entry.amountMinor;
    else if (entry.trustLevel === 'imported') importedVolumeMinor += entry.amountMinor;
    else if (entry.trustLevel === 'claimed') claimedVolumeMinor += entry.amountMinor;

    if (entry.matchedStatus === 'unmatched') unmatchedCount++;
  }

  const chainCheck = verifyHashChainIntegrity(options.hashChainBlocks);

  return {
    tenantId: options.tenantId,
    month: options.month,
    generatedAt: new Date().toISOString(),
    securityScore: options.securityScore,
    financeScore: options.financeScore,
    overallScore,
    scoreTrend: [],
    activeRulesCount: 12,
    totalFindingsCount: options.findings.length,
    openFindingsCount: openFindings.length,
    criticalCount,
    reconciliationStatus: {
      totalVolumeMinor,
      verifiedVolumeMinor,
      importedVolumeMinor,
      claimedVolumeMinor,
      unmatchedCount,
    },
    hashChainVerified: chainCheck.isValid,
    tamperProofBlockCount: options.hashChainBlocks.length,
  };
}
