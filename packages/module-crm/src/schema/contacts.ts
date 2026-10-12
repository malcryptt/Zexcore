/**
 * CRM Schema
 *
 * Tables:
 *   crm_contacts     – people or companies tracked across the workspace
 *   crm_leads        – a contact moving through a sales pipeline
 *   crm_stages       – ordered pipeline stages defined per-tenant
 *   crm_activities   – notes, calls, emails, tasks attached to a contact or lead
 *
 * ALL tables include tenant_id as the first indexed column.
 * Composite unique keys prevent cross-tenant FK leaks (per RLS gotchas).
 */

// Raw SQL DDL is created in onInit() because Drizzle migrate is not yet wired.
// We export typed shapes so route handlers can stay type-safe without re-querying.

export interface CrmContact {
  id: string;
  tenantId: string;
  type: 'person' | 'company';
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  tags: string[];
  customFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrmLead {
  id: string;
  tenantId: string;
  contactId: string;
  stageId: string;
  title: string;
  value: number | null;       // monetary value in minor units (cents)
  currency: string;           // ISO 4217, e.g. 'NGN', 'USD'
  probability: number | null; // 0–100
  expectedCloseAt: Date | null;
  closedAt: Date | null;
  closedReason: 'won' | 'lost' | null;
  customFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrmStage {
  id: string;
  tenantId: string;
  name: string;
  position: number;  // sort order within pipeline
  isDefault: boolean;
  createdAt: Date;
}

export interface CrmActivity {
  id: string;
  tenantId: string;
  contactId: string | null;
  leadId: string | null;
  kind: 'note' | 'call' | 'email' | 'task' | 'meeting';
  subject: string;
  body: string | null;
  dueAt: Date | null;
  completedAt: Date | null;
  createdBy: string;    // user id
  createdAt: Date;
  updatedAt: Date;
}
