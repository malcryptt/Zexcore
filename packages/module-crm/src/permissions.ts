import type { CapabilityDefinition } from '@zexcore/core';

export const CRM_CAPABILITIES = {
  // Contacts
  CONTACTS_READ:   'crm:contacts:read',
  CONTACTS_CREATE: 'crm:contacts:create',
  CONTACTS_UPDATE: 'crm:contacts:update',
  CONTACTS_DELETE: 'crm:contacts:delete',

  // Leads & Pipeline
  LEADS_READ:      'crm:leads:read',
  LEADS_CREATE:    'crm:leads:create',
  LEADS_UPDATE:    'crm:leads:update',
  LEADS_DELETE:    'crm:leads:delete',
  LEADS_MOVE:      'crm:leads:move',    // move between stages

  // Stages configuration
  STAGES_MANAGE:   'crm:stages:manage',

  // Activities
  ACTIVITIES_READ:   'crm:activities:read',
  ACTIVITIES_CREATE: 'crm:activities:create',
  ACTIVITIES_UPDATE: 'crm:activities:update',
  ACTIVITIES_DELETE: 'crm:activities:delete',
} as const;

export type CrmCapability = (typeof CRM_CAPABILITIES)[keyof typeof CRM_CAPABILITIES];

export const crmCapabilityDefinitions: CapabilityDefinition[] = [
  { name: CRM_CAPABILITIES.CONTACTS_READ,     description: 'View contacts',               module: 'crm' },
  { name: CRM_CAPABILITIES.CONTACTS_CREATE,   description: 'Create contacts',             module: 'crm' },
  { name: CRM_CAPABILITIES.CONTACTS_UPDATE,   description: 'Edit contacts',               module: 'crm' },
  { name: CRM_CAPABILITIES.CONTACTS_DELETE,   description: 'Delete contacts',             module: 'crm' },
  { name: CRM_CAPABILITIES.LEADS_READ,        description: 'View leads',                  module: 'crm' },
  { name: CRM_CAPABILITIES.LEADS_CREATE,      description: 'Create leads',                module: 'crm' },
  { name: CRM_CAPABILITIES.LEADS_UPDATE,      description: 'Edit leads',                  module: 'crm' },
  { name: CRM_CAPABILITIES.LEADS_DELETE,      description: 'Delete leads',                module: 'crm' },
  { name: CRM_CAPABILITIES.LEADS_MOVE,        description: 'Move leads between stages',   module: 'crm' },
  { name: CRM_CAPABILITIES.STAGES_MANAGE,     description: 'Configure pipeline stages',   module: 'crm' },
  { name: CRM_CAPABILITIES.ACTIVITIES_READ,   description: 'View activity timeline',      module: 'crm' },
  { name: CRM_CAPABILITIES.ACTIVITIES_CREATE, description: 'Log activities',              module: 'crm' },
  { name: CRM_CAPABILITIES.ACTIVITIES_UPDATE, description: 'Edit logged activities',      module: 'crm' },
  { name: CRM_CAPABILITIES.ACTIVITIES_DELETE, description: 'Delete logged activities',    module: 'crm' },
];
