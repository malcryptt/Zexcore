import type { CapabilityDefinition } from '@zexcore/core';

export const COMPLIANCE_CAPABILITIES = {
  CONSENT_READ:       'compliance:consent:read',
  CONSENT_MANAGE:     'compliance:consent:manage',
  ERASURE_REQUEST:    'compliance:erasure:request',
  ERASURE_EXECUTE:    'compliance:erasure:execute',
  EXPORT_REQUEST:     'compliance:export:request',
  RETENTION_READ:     'compliance:retention:read',
  RETENTION_MANAGE:   'compliance:retention:manage',
  ACCESS_LOGS_READ:   'compliance:logs:read',
} as const;

export type ComplianceCapability = (typeof COMPLIANCE_CAPABILITIES)[keyof typeof COMPLIANCE_CAPABILITIES];

export const complianceCapabilityDefinitions: CapabilityDefinition[] = [
  { name: COMPLIANCE_CAPABILITIES.CONSENT_READ,     description: 'View user and subject consent records', module: 'compliance' },
  { name: COMPLIANCE_CAPABILITIES.CONSENT_MANAGE,   description: 'Record or revoke consents',             module: 'compliance' },
  { name: COMPLIANCE_CAPABILITIES.ERASURE_REQUEST,  description: 'Submit GDPR/NDPR erasure requests',     module: 'compliance' },
  { name: COMPLIANCE_CAPABILITIES.ERASURE_EXECUTE,  description: 'Execute right-to-be-forgotten purges',  module: 'compliance' },
  { name: COMPLIANCE_CAPABILITIES.EXPORT_REQUEST,   description: 'Generate portable data export bundles', module: 'compliance' },
  { name: COMPLIANCE_CAPABILITIES.RETENTION_READ,   description: 'View tenant data retention policies',  module: 'compliance' },
  { name: COMPLIANCE_CAPABILITIES.RETENTION_MANAGE, description: 'Modify retention policies and trigger purges', module: 'compliance' },
  { name: COMPLIANCE_CAPABILITIES.ACCESS_LOGS_READ, description: 'Audit PII field access records',       module: 'compliance' },
];
