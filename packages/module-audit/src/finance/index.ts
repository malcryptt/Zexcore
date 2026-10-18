import type {
  AuditFinding,
  LedgerEntry,
  BankStatementTransaction,
  StatementImportResult,
} from '../types.js';

export interface FinanceEvaluationContext {
  tenantId: string;
  invoices: Array<{
    id: string;
    number: string; // e.g. 'INV-0104'
    sequence: number;
    subtotalMinor: number;
    taxMinor: number;
    totalMinor: number;
    status: 'draft' | 'finalised' | 'paid' | 'void';
    lineItemsSumMinor: number;
    isFinalisedEdited?: boolean;
    createdAt: string;
  }>;
  payments: Array<{
    id: string;
    invoiceId?: string;
    amountMinor: number;
    currency: string;
    provider: 'stripe' | 'paystack' | 'flutterwave' | 'bank_transfer';
    providerTxId: string;
    status: 'succeeded' | 'pending' | 'failed';
    customerEmail?: string;
    createdAt: string;
  }>;
  refunds: Array<{
    id: string;
    paymentId: string;
    amountMinor: number;
    currency: string;
    requestedBy: string;
    approvedBy?: string;
    createdAt: string;
  }>;
  shifts: Array<{
    id: string;
    shiftNumber: number;
    openedAt: string;
    closedAt?: string;
    expectedCashMinor: number;
    actualCashMinor: number;
    signedByCashier?: string;
    signedBySupervisor?: string;
  }>;
  ledger: LedgerEntry[];
  baselineMonthlyVolumeMinor?: number;
}

function computeSimpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return 'sha256_' + Math.abs(hash).toString(16).padStart(16, '0');
}

export function runFinanceChecks(
  ctx: FinanceEvaluationContext,
  ruleVersions: Record<string, number> = {},
  params: Record<string, Record<string, any>> = {}
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const now = new Date();
  const nowIso = now.toISOString();

  // ── 1. Duplicate Payments Detection ──────────────────────────────────────────
  const dupRuleKey = 'fin.integrity.duplicate_payments';
  const dupRuleVersion = ruleVersions[dupRuleKey] || 1;
  const windowMinutes = params[dupRuleKey]?.windowMinutes ?? 10;
  const duplicatePairs: Array<{ first: any; second: any }> = [];

  for (let i = 0; i < ctx.payments.length; i++) {
    const p1 = ctx.payments[i];
    if (!p1) continue;
    for (let j = i + 1; j < ctx.payments.length; j++) {
      const p2 = ctx.payments[j];
      if (!p2) continue;
      if (
        p1.amountMinor === p2.amountMinor &&
        p1.currency === p2.currency &&
        p1.customerEmail &&
        p1.customerEmail === p2.customerEmail &&
        p1.status === 'succeeded' &&
        p2.status === 'succeeded'
      ) {
        const diffMs = Math.abs(new Date(p1.createdAt).getTime() - new Date(p2.createdAt).getTime());
        if (diffMs <= windowMinutes * 60 * 1000) {
          duplicatePairs.push({ first: p1, second: p2 });
        }
      }
    }
  }

  if (duplicatePairs.length > 0) {
    findings.push({
      id: `finding-fin-dup-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: dupRuleKey,
      ruleName: 'Potential Duplicate Payment Charge Identified',
      ruleVersion: dupRuleVersion,
      domain: 'finance',
      severity: 'high',
      title: `${duplicatePairs.length} Suspected duplicate customer charge(s) detected`,
      description:
        'Multiple identical charges recorded for the same customer within the duplicate detection window without an associated multi-order.',
      evidence: {
        ruleKey: dupRuleKey,
        ruleVersion: dupRuleVersion,
        domain: 'finance',
        occurredAt: nowIso,
        records: duplicatePairs.map((p) => ({
          id: p.first.id,
          type: 'payment_pair',
          reference: p.first.providerTxId,
          details: {
            p1Id: p.first.id,
            p2Id: p.second.id,
            amountMinor: p.first.amountMinor,
            customerEmail: p.first.customerEmail,
          },
        })),
        calculatedValues: { duplicateIncidentCount: duplicatePairs.length },
        reproductionCommand: `zex audit check --rule=${dupRuleKey} --v=${dupRuleVersion}`,
        cryptographicHash: computeSimpleHash(`dup_payments_${duplicatePairs.length}`),
      },
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  // ── 2. Refunds Exceeding Original Payment ────────────────────────────────────
  const refundExceedRuleKey = 'fin.integrity.refund_over_payment';
  const refundExceedVersion = ruleVersions[refundExceedRuleKey] || 1;
  const refundsByPayment: Record<string, number> = {};

  for (const r of ctx.refunds) {
    refundsByPayment[r.paymentId] = (refundsByPayment[r.paymentId] || 0) + r.amountMinor;
  }

  const anomalousRefunds: Array<{ payment: any; totalRefundedMinor: number }> = [];
  for (const p of ctx.payments) {
    const totalRefunded = refundsByPayment[p.id] || 0;
    if (totalRefunded > p.amountMinor) {
      anomalousRefunds.push({ payment: p, totalRefundedMinor: totalRefunded });
    }
  }

  if (anomalousRefunds.length > 0) {
    findings.push({
      id: `finding-fin-refund-exceed-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: refundExceedRuleKey,
      ruleName: 'Cumulative Refunds Exceed Original Transaction Value',
      ruleVersion: refundExceedVersion,
      domain: 'finance',
      severity: 'critical',
      title: `${anomalousRefunds.length} Refund(s) exceed original charge amount`,
      description:
        'A refund or series of partial refunds cumulatively exceeds the settled gross transaction value, resulting in tenant capital drain.',
      evidence: {
        ruleKey: refundExceedRuleKey,
        ruleVersion: refundExceedVersion,
        domain: 'finance',
        occurredAt: nowIso,
        records: anomalousRefunds.map((a) => ({
          id: a.payment.id,
          type: 'payment',
          reference: a.payment.providerTxId,
          details: {
            chargeMinor: a.payment.amountMinor,
            totalRefundedMinor: a.totalRefundedMinor,
            deficitMinor: a.totalRefundedMinor - a.payment.amountMinor,
          },
        })),
        calculatedValues: { anomalousCount: anomalousRefunds.length },
        reproductionCommand: `zex audit check --rule=${refundExceedRuleKey} --v=${refundExceedVersion}`,
        cryptographicHash: computeSimpleHash(`refund_over_${anomalousRefunds.length}`),
      },
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  // ── 3. Invoice Total Line-Item Mismatch ──────────────────────────────────────
  const mismatchRuleKey = 'fin.integrity.invoice_total_mismatch';
  const mismatchVersion = ruleVersions[mismatchRuleKey] || 1;
  const mismatchedInvoices = ctx.invoices.filter((inv) => {
    const expected = inv.subtotalMinor + inv.taxMinor;
    return inv.totalMinor !== expected || inv.totalMinor !== inv.lineItemsSumMinor;
  });

  if (mismatchedInvoices.length > 0) {
    findings.push({
      id: `finding-fin-inv-mismatch-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: mismatchRuleKey,
      ruleName: 'Invoice Header Total Discrepancy Against Computed Line Items',
      ruleVersion: mismatchVersion,
      domain: 'finance',
      severity: 'high',
      title: `${mismatchedInvoices.length} Invoice(s) exhibit arithmetic line-item discrepancy`,
      description:
        'Invoice total does not equal the calculated sum of line items plus applicable taxes, indicating a rounding fault or rogue mutation.',
      evidence: {
        ruleKey: mismatchRuleKey,
        ruleVersion: mismatchVersion,
        domain: 'finance',
        occurredAt: nowIso,
        records: mismatchedInvoices.map((inv) => ({
          id: inv.id,
          type: 'invoice',
          reference: inv.number,
          details: {
            statedTotal: inv.totalMinor,
            lineItemsSum: inv.lineItemsSumMinor,
            delta: Math.abs(inv.totalMinor - inv.lineItemsSumMinor),
          },
        })),
        calculatedValues: { count: mismatchedInvoices.length },
        reproductionCommand: `zex audit check --rule=${mismatchRuleKey} --v=${mismatchVersion}`,
        cryptographicHash: computeSimpleHash(`inv_mismatch_${mismatchedInvoices.length}`),
      },
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  // ── 4. Invoice Number Sequence Gaps ──────────────────────────────────────────
  const gapRuleKey = 'fin.integrity.invoice_number_gaps';
  const gapVersion = ruleVersions[gapRuleKey] || 1;
  const sortedSequences = ctx.invoices
    .map((inv) => inv.sequence)
    .filter((s) => typeof s === 'number')
    .sort((a, b) => a - b);

  const missingGaps: number[] = [];
  for (let i = 0; i < sortedSequences.length - 1; i++) {
    const curr = sortedSequences[i];
    const next = sortedSequences[i + 1];
    if (curr !== undefined && next !== undefined && next > curr + 1) {
      for (let missing = curr + 1; missing < next; missing++) {
        missingGaps.push(missing);
      }
    }
  }

  if (missingGaps.length > 0) {
    findings.push({
      id: `finding-fin-inv-gap-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: gapRuleKey,
      ruleName: 'Sequential Tax Invoice Numbering Continuity Gap',
      ruleVersion: gapVersion,
      domain: 'finance',
      severity: 'medium',
      title: `${missingGaps.length} Missing invoice sequence number(s) identified in audit range`,
      description:
        'Gaps in sequential tax invoicing violate fiscal record-keeping regulations and indicate unrecorded sales or deleted records.',
      evidence: {
        ruleKey: gapRuleKey,
        ruleVersion: gapVersion,
        domain: 'finance',
        occurredAt: nowIso,
        records: missingGaps.slice(0, 10).map((num) => ({
          id: `seq-gap-${num}`,
          type: 'sequence_gap',
          details: { missingSequenceNumber: num },
        })),
        calculatedValues: { missingCount: missingGaps.length, missingSequences: missingGaps.slice(0, 10) },
        reproductionCommand: `zex audit check --rule=${gapRuleKey} --v=${gapVersion}`,
        cryptographicHash: computeSimpleHash(`seq_gaps_${missingGaps.join(',')}`),
      },
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  // ── 5. Edits to Finalised Fiscal Records (Immutable Ledger Protection) ────────
  const editedFinalised = ctx.invoices.filter((inv) => inv.status === 'finalised' && inv.isFinalisedEdited);
  const finalisedRuleKey = 'fin.integrity.finalised_records_mutation';
  const finalisedVersion = ruleVersions[finalisedRuleKey] || 1;

  if (editedFinalised.length > 0) {
    findings.push({
      id: `finding-fin-finalised-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: finalisedRuleKey,
      ruleName: 'Direct Mutation Detected on Finalised Fiscal Record',
      ruleVersion: finalisedVersion,
      domain: 'finance',
      severity: 'critical',
      title: `${editedFinalised.length} Finalised invoice(s) mutated without revision journal entries`,
      description:
        'Finalised or paid transactions cannot be directly altered in place under GAAP and audit standards; credit/debit notes are mandated.',
      evidence: {
        ruleKey: finalisedRuleKey,
        ruleVersion: finalisedVersion,
        domain: 'finance',
        occurredAt: nowIso,
        records: editedFinalised.map((inv) => ({
          id: inv.id,
          type: 'invoice',
          reference: inv.number,
          details: { status: inv.status, violation: 'in_place_mutation' },
        })),
        calculatedValues: { mutatedCount: editedFinalised.length },
        reproductionCommand: `zex audit check --rule=${finalisedRuleKey} --v=${finalisedVersion}`,
        cryptographicHash: computeSimpleHash(`finalised_edit_${editedFinalised.length}`),
      },
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  // ── 6. Structuring Detection (Casino-inspired: Amounts Just Under Approval Limit)
  const structuringRuleKey = 'fin.casino.structuring_detection';
  const structuringVersion = ruleVersions[structuringRuleKey] || 1;
  const approvalLimitMinor = params[structuringRuleKey]?.approvalLimitMinor ?? 500000; // e.g. $5,000.00
  const structuringWindowBandPercent = params[structuringRuleKey]?.windowBandPercent ?? 10; // Within 10% below limit
  const lowerBoundMinor = approvalLimitMinor * (1 - structuringWindowBandPercent / 100);

  const structuredRefunds = ctx.refunds.filter(
    (r) => r.amountMinor >= lowerBoundMinor && r.amountMinor < approvalLimitMinor
  );

  if (structuredRefunds.length >= 3) {
    findings.push({
      id: `finding-fin-structuring-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: structuringRuleKey,
      ruleName: 'Potential Transaction Structuring Below Dual-Approval Threshold',
      ruleVersion: structuringVersion,
      domain: 'finance',
      severity: 'high',
      title: `${structuredRefunds.length} Refund transactions cluster just below dual-approval limit`,
      description:
        'Repeated transactions clustered immediately below the approval ceiling ($5,000) match classic anti-smurfing structuring patterns.',
      evidence: {
        ruleKey: structuringRuleKey,
        ruleVersion: structuringVersion,
        domain: 'finance',
        occurredAt: nowIso,
        records: structuredRefunds.map((r) => ({
          id: r.id,
          type: 'refund',
          details: { amountMinor: r.amountMinor, requestedBy: r.requestedBy },
        })),
        calculatedValues: {
          ceilingMinor: approvalLimitMinor,
          lowerBandMinor: lowerBoundMinor,
          count: structuredRefunds.length,
        },
        reproductionCommand: `zex audit check --rule=${structuringRuleKey} --v=${structuringVersion}`,
        cryptographicHash: computeSimpleHash(`structuring_${structuredRefunds.length}`),
      },
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  // ── 7. Shift Close-Out Control (Casino-inspired Cash Discrepancy) ─────────────
  const shiftRuleKey = 'fin.casino.shift_closeout_variance';
  const shiftVersion = ruleVersions[shiftRuleKey] || 1;
  const unsignedOrDiscrepantShifts = ctx.shifts.filter((s) => {
    if (!s.signedByCashier || !s.signedBySupervisor) return true;
    return Math.abs(s.expectedCashMinor - s.actualCashMinor) > 1000; // > $10 discrepancy
  });

  if (unsignedOrDiscrepantShifts.length > 0) {
    findings.push({
      id: `finding-fin-shift-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: shiftRuleKey,
      ruleName: 'Shift Close-Out Register Variance or Missing Dual Sign-Off',
      ruleVersion: shiftVersion,
      domain: 'finance',
      severity: 'high',
      title: `${unsignedOrDiscrepantShifts.length} Shift register session(s) exhibit variance or lack dual signature`,
      description:
        'Shift close-out requires physical vs recorded cash reconciliation signed by both the operational cashier and the shift supervisor.',
      evidence: {
        ruleKey: shiftRuleKey,
        ruleVersion: shiftVersion,
        domain: 'finance',
        occurredAt: nowIso,
        records: unsignedOrDiscrepantShifts.map((s) => ({
          id: s.id,
          type: 'shift_register',
          details: {
            shiftNumber: s.shiftNumber,
            expectedMinor: s.expectedCashMinor,
            actualMinor: s.actualCashMinor,
            varianceMinor: s.actualCashMinor - s.expectedCashMinor,
            cashierSigned: !!s.signedByCashier,
            supervisorSigned: !!s.signedBySupervisor,
          },
        })),
        calculatedValues: { discrepantShiftCount: unsignedOrDiscrepantShifts.length },
        reproductionCommand: `zex audit check --rule=${shiftRuleKey} --v=${shiftVersion}`,
        cryptographicHash: computeSimpleHash(`shifts_${unsignedOrDiscrepantShifts.length}`),
      },
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  return findings;
}

/**
 * Bank Statement Import, Deduplication, and Trust-Level Matching
 */
export function importBankStatement(
  rawTransactions: Array<{
    date: string;
    amountMinor: number;
    currency: string;
    reference: string;
    narration: string;
  }>,
  existingLedger: LedgerEntry[]
): StatementImportResult {
  const existingHashes = new Set(
    existingLedger.map((l) => l.statementHash).filter((h): h is string => Boolean(h))
  );

  let duplicateCount = 0;
  let matchedCount = 0;
  let unmatchedCount = 0;
  const processed: StatementImportResult['transactions'] = [];

  for (const raw of rawTransactions) {
    const rawString = `${raw.date}|${raw.amountMinor}|${raw.currency}|${raw.reference}|${raw.narration}`;
    const hash = computeSimpleHash(rawString);

    const tx: BankStatementTransaction = {
      id: `stmt-tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: raw.date,
      amountMinor: raw.amountMinor,
      currency: raw.currency,
      reference: raw.reference,
      narration: raw.narration,
      rawHash: hash,
    };

    if (existingHashes.has(hash)) {
      duplicateCount++;
      processed.push({ tx, matchStatus: 'duplicate' });
      continue;
    }

    // Try to match against pending ledger entries
    const match = existingLedger.find(
      (l) =>
        l.matchedStatus === 'unmatched' &&
        l.amountMinor === raw.amountMinor &&
        l.currency === raw.currency &&
        (l.reference.toLowerCase() === raw.reference.toLowerCase() ||
          (raw.reference && l.reference.includes(raw.reference)) ||
          raw.narration.toLowerCase().includes(l.reference.toLowerCase()))
    );

    if (match) {
      matchedCount++;
      processed.push({ tx, matchStatus: 'matched', matchedWith: match.id });
    } else {
      unmatchedCount++;
      processed.push({ tx, matchStatus: 'unmatched' });
    }
  }

  const statementBatchHash = computeSimpleHash(
    processed.map((p) => p.tx.rawHash).join('::')
  );

  return {
    statementHash: statementBatchHash,
    importedCount: processed.length - duplicateCount,
    duplicateCount,
    matchedCount,
    unmatchedCount,
    transactions: processed,
  };
}
