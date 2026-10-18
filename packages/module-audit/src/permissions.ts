import type { CapabilityDefinition } from '@zexcore/core';

export const AUDIT_CAPABILITIES = {
  VIEW:           'audit:view',
  RUN:            'audit:run',
  RULE_TUNE:      'audit:rule.tune',
  RULE_DISABLE:   'audit:rule.disable',
  RULE_APPROVE:   'audit:rule.approve',
  FINDING_DISMISS:'audit:finding.dismiss',
  EXPORT:         'audit:export',
  AUDITOR:        'audit:auditor',
} as const;

export const auditCapabilityDefinitions: CapabilityDefinition[] = [
  {
    name: AUDIT_CAPABILITIES.VIEW,
    description: 'Inspect workspace security findings, finance health scores, and score trends',
    module: 'audit',
  },
  {
    name: AUDIT_CAPABILITIES.RUN,
    description: 'Trigger full deterministic evaluation of workspace security and finance checks',
    module: 'audit',
  },
  {
    name: AUDIT_CAPABILITIES.RULE_TUNE,
    description: 'Modify parameters of tunable rules within allowed ranges (tightening is instant; loosening requires dual-approval)',
    module: 'audit',
  },
  {
    name: AUDIT_CAPABILITIES.RULE_DISABLE,
    description: 'Request deactivation of non-locked rules (requires dual-approver sign-off + fresh step-up MFA)',
    module: 'audit',
  },
  {
    name: AUDIT_CAPABILITIES.RULE_APPROVE,
    description: 'Provide second-operator approval with step-up MFA for loosening or disabling rules',
    module: 'audit',
  },
  {
    name: AUDIT_CAPABILITIES.FINDING_DISMISS,
    description: 'Mark finding as false positive or acceptable risk with mandatory recorded justification',
    module: 'audit',
  },
  {
    name: AUDIT_CAPABILITIES.EXPORT,
    description: 'Download cryptographically signed evidence packs for regulators and external accountants',
    module: 'audit',
  },
  {
    name: AUDIT_CAPABILITIES.AUDITOR,
    description: 'Dedicated immutable read-only view including reconciliation ledgers, logs, and cryptographic chains',
    module: 'audit',
  },
];
