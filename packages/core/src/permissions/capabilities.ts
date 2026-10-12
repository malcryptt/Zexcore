export interface CapabilityDefinition {
  name: string;
  description: string;
  module?: string;
}

export const CORE_CAPABILITIES = {
  // Records & Content
  RECORDS_READ: 'records:read',
  RECORDS_CREATE: 'records:create',
  RECORDS_UPDATE: 'records:update',
  RECORDS_DELETE: 'records:delete',
  RECORDS_PUBLISH: 'records:publish',
  CONTENT_TYPES_MANAGE: 'content_types:manage',

  // Tenancy & Administration
  TENANT_SETTINGS: 'tenant:settings',
  USERS_MANAGE: 'users:manage',
  AUDIT_READ: 'audit:read',

  // Special Principal Capabilities
  DEVICE_INGEST: 'device:ingest',
  AI_PROPOSE: 'ai:proposals:create',
  AI_APPROVE: 'ai:proposals:approve',
} as const;

export type CoreCapability = (typeof CORE_CAPABILITIES)[keyof typeof CORE_CAPABILITIES];
