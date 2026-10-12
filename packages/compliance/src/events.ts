export const COMPLIANCE_EVENTS = {
  CONSENT_GRANTED:    'compliance.consent.granted',
  CONSENT_REVOKED:    'compliance.consent.revoked',
  ERASURE_REQUESTED:  'compliance.erasure.requested',
  ERASURE_COMPLETED:  'compliance.erasure.completed',
  EXPORT_REQUESTED:   'compliance.export.requested',
  EXPORT_READY:       'compliance.export.ready',
  RETENTION_ENFORCED: 'compliance.retention.enforced',
} as const;

export type ComplianceEventName = (typeof COMPLIANCE_EVENTS)[keyof typeof COMPLIANCE_EVENTS];

export interface ConsentEventPayload {
  tenantId: string;
  subjectId: string;
  purpose: string;
  legalBasis: string;
}

export interface ErasureEventPayload {
  tenantId: string;
  requestId: string;
  subjectId: string;
  anonymizedCount: number;
}

export interface ExportEventPayload {
  tenantId: string;
  exportId: string;
  subjectId: string;
}

export interface RetentionEventPayload {
  tenantId: string;
  entity: string;
  purgedCount: number;
  retentionDays: number;
}
