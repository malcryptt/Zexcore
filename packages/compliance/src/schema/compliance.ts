/**
 * Compliance Schema Definitions
 *
 * Tables:
 *   compliance_consents            – GDPR/NDPR explicit subject consent tracking
 *   compliance_erasure_requests    – Right-to-be-forgotten / erasure requests
 *   compliance_data_exports        – Data portability snapshot bundles
 *   compliance_retention_policies  – Per-tenant data lifespan policies
 *   compliance_access_logs         – Immutable audit logs for PII reads & exports
 */

export interface ComplianceConsent {
  id: string;
  tenantId: string;
  subjectId: string;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'legitimate_interests';
  grantedAt: Date;
  revokedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  meta: Record<string, unknown>;
}

export interface ComplianceErasureRequest {
  id: string;
  tenantId: string;
  subjectId: string;
  requestedBy: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  rejectionReason: string | null;
  anonymizedCount: number;
  requestedAt: Date;
  completedAt: Date | null;
}

export interface ComplianceDataExport {
  id: string;
  tenantId: string;
  subjectId: string;
  requestedBy: string;
  status: 'pending' | 'ready' | 'expired';
  bundlePayload: Record<string, unknown> | null;
  expiresAt: Date;
  createdAt: Date;
}

export interface ComplianceRetentionPolicy {
  id: string;
  tenantId: string;
  entity: string;
  retentionDays: number;
  action: 'anonymize' | 'hard_delete';
  enabled: boolean;
  lastRunAt: Date | null;
  updatedAt: Date;
}

export interface ComplianceAccessLog {
  id: string;
  tenantId: string;
  actorId: string;
  subjectId: string;
  entity: string;
  action: 'read' | 'export' | 'update' | 'delete';
  fields: string[];
  accessedAt: Date;
}
