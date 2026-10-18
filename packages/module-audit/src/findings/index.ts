import type {
  AuditFinding,
  AuditFindingEvent,
  FindingStatus,
} from '../types.js';

export function createFindingEvent(
  finding: AuditFinding,
  action: AuditFindingEvent['action'],
  actor: string,
  reason?: string,
  newStatus?: FindingStatus
): AuditFindingEvent {
  return {
    id: `fe-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    findingId: finding.id,
    action,
    reason,
    actor,
    previousStatus: finding.status,
    newStatus: newStatus || finding.status,
    createdAt: new Date().toISOString(),
  };
}

export function dismissFinding(
  finding: AuditFinding,
  actor: string,
  reason: string
): { updatedFinding: AuditFinding; event: AuditFindingEvent } {
  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed operational reason is required to dismiss an audit finding.');
  }

  const nowIso = new Date().toISOString();
  const updatedFinding: AuditFinding = {
    ...finding,
    status: 'dismissed',
    dismissalReason: reason.trim(),
    dismissedBy: actor,
    dismissedAt: nowIso,
  };

  const event = createFindingEvent(
    finding,
    'dismissed',
    actor,
    reason.trim(),
    'dismissed'
  );

  return { updatedFinding, event };
}

export function resolveFinding(
  finding: AuditFinding,
  actor: string,
  resolutionNotes?: string
): { updatedFinding: AuditFinding; event: AuditFindingEvent } {
  const nowIso = new Date().toISOString();
  const updatedFinding: AuditFinding = {
    ...finding,
    status: 'resolved',
    resolvedAt: nowIso,
  };

  const event = createFindingEvent(
    finding,
    'resolved',
    actor,
    resolutionNotes || 'Remediated in live environment',
    'resolved'
  );

  return { updatedFinding, event };
}

/**
 * AI Explainer Helper
 * Note: Per the specification: "Where AI fits: Explaining a finding in plain language, drafting
 * a suggested fix as a proposal... AI never decides what counts as a finding and never changes a number."
 */
export function generatePlainLanguageSummary(finding: AuditFinding): {
  executiveExplanation: string;
  remediationProposal: string;
  regulatoryReference?: string;
} {
  switch (finding.ruleKey) {
    case 'sec.posture.admin_mfa':
      return {
        executiveExplanation:
          'One or more users with full system administration rights are logging in using only passwords. If their password is leaked in a phishing or third-party breach, attackers gain immediate control over customer databases.',
        remediationProposal:
          'Enforce mandatory TOTP/WebAuthn hardware keys in Settings > Identity > MFA Enforcement, and require immediate step-up authentication on their next session.',
        regulatoryReference: 'ISO 27001 A.9.4.2 / SOC 2 CC6.1 / NDPR Art. 2.6',
      };
    case 'sec.posture.dormant_accounts':
      return {
        executiveExplanation:
          'Accounts have been inactive for over the configured retention threshold. Former employees or unmonitored accounts are prime vectors for persistent backdoors.',
        remediationProposal:
          'Archive or suspend the inactive user credentials. Revoke their active OAuth tokens and API access keys.',
        regulatoryReference: 'CIS Benchmark 1.3 / HIPAA 45 CFR § 164.308',
      };
    case 'sec.posture.stale_keys':
      return {
        executiveExplanation:
          'API access keys have remained in continuous production use without cryptographic rotation past the recommended lifecycle.',
        remediationProposal:
          'Issue replacement keys with designated expiration dates, transition external microservices, and deprecate the old keys with zero downtime.',
        regulatoryReference: 'PCI-DSS v4.0 Req 8.6.3',
      };
    case 'fin.integrity.duplicate_payments':
      return {
        executiveExplanation:
          'Identical amounts were debited from the same customer within minutes, indicating a double submission bug, unhandled network retry, or customer double-click.',
        remediationProposal:
          'Verify transaction IDs in the payment provider console (Stripe/Paystack) and initiate an automated refund for the duplicate charge to prevent dispute fees.',
        regulatoryReference: 'GAAP Internal Controls / Payment Network Cardholder Protection Rules',
      };
    case 'fin.integrity.refund_over_payment':
      return {
        executiveExplanation:
          'Total refunds issued against an order exceed the money originally collected, resulting in an immediate capital deficit.',
        remediationProposal:
          'Lock outbound refund permissions on this account immediately and initiate a reconciliation review with the finance manager.',
        regulatoryReference: 'SOX Section 404 / Financial Integrity Controls',
      };
    case 'fin.casino.structuring_detection':
      return {
        executiveExplanation:
          'A series of financial transactions have been submitted just below the $5,000 threshold that mandates second-manager sign-off.',
        remediationProposal:
          'Route all transactions from this operator into the manual escrow queue for AML and supervisor review.',
        regulatoryReference: 'FinCEN 31 CFR § 1010.314 Anti-Structuring Provisions',
      };
    default:
      return {
        executiveExplanation: `The deterministic check "${finding.ruleName}" flagged ${finding.evidence.records.length} record(s) with severity "${finding.severity}".`,
        remediationProposal:
          'Review the cryptographic evidence payload, verify the underlying workspace state, and apply recommended operational policies.',
        regulatoryReference: 'ZexCore Deterministic Control Framework v1.0',
      };
  }
}
