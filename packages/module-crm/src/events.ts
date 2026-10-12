/**
 * CRM Event definitions.
 *
 * Events are emitted on the Core EventBus, never imported directly by other modules.
 * Other modules subscribe to these string keys via core.events.on(CRM_EVENTS.LEAD_CREATED, ...).
 */

export const CRM_EVENTS = {
  CONTACT_CREATED: 'crm.contact.created',
  CONTACT_UPDATED: 'crm.contact.updated',
  CONTACT_DELETED: 'crm.contact.deleted',

  LEAD_CREATED:    'crm.lead.created',
  LEAD_UPDATED:    'crm.lead.updated',
  LEAD_MOVED:      'crm.lead.moved',      // stage changed
  LEAD_WON:        'crm.lead.won',
  LEAD_LOST:       'crm.lead.lost',
  LEAD_DELETED:    'crm.lead.deleted',

  ACTIVITY_LOGGED: 'crm.activity.logged',
} as const;

export type CrmEventName = (typeof CRM_EVENTS)[keyof typeof CRM_EVENTS];

// ---------- Payload shapes ----------

export interface CrmContactEventPayload {
  tenantId: string;
  contactId: string;
  email: string | null;
}

export interface CrmLeadEventPayload {
  tenantId: string;
  leadId: string;
  contactId: string;
  title: string;
  value: number | null;
  currency: string;
}

export interface CrmLeadMovedPayload extends CrmLeadEventPayload {
  fromStageId: string;
  toStageId: string;
}

export interface CrmLeadClosedPayload extends CrmLeadEventPayload {
  reason: 'won' | 'lost';
  closedAt: string; // ISO 8601
}

export interface CrmActivityLoggedPayload {
  tenantId: string;
  activityId: string;
  contactId: string | null;
  leadId: string | null;
  kind: string;
  createdBy: string;
}
