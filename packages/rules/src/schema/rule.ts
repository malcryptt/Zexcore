import { z } from 'zod';

// ─── Operators ────────────────────────────────────────────────────────────────

export const OperatorSchema = z.enum([
  'eq',        // ==
  'neq',       // !=
  'gt',        // >
  'gte',       // >=
  'lt',        // <
  'lte',       // <=
  'in',        // value IN array
  'not_in',    // value NOT IN array
  'contains',  // string or array contains substring/element
  'not_contains',
  'exists',    // field is not null/undefined
  'not_exists',
  'matches',   // regex match (pattern stored as string, evaluated safely)
]);
export type Operator = z.infer<typeof OperatorSchema>;

// ─── A single condition ───────────────────────────────────────────────────────

/**
 * `field` is a dot-path into the event payload, e.g. "lead.value" or "contact.tags".
 * Deeply nested paths like "meta.region.city" are supported.
 */
export const ConditionSchema = z.object({
  field: z.string().min(1).max(128),
  op:    OperatorSchema,
  // value is optional for exists/not_exists
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number()])),
    z.null(),
  ]).optional(),
});
export type Condition = z.infer<typeof ConditionSchema>;

// ─── Condition group (AND / OR) ───────────────────────────────────────────────

export type ConditionGroup =
  | { all: ConditionOrGroup[] }   // AND
  | { any: ConditionOrGroup[] }   // OR
  | Condition;                    // leaf

export type ConditionOrGroup = ConditionGroup;

// Recursive Zod schema
const ConditionOrGroupSchema: z.ZodType<ConditionOrGroup> = z.lazy(() =>
  z.union([
    z.object({ all: z.array(ConditionOrGroupSchema) }),
    z.object({ any: z.array(ConditionOrGroupSchema) }),
    ConditionSchema,
  ]),
);
export { ConditionOrGroupSchema };

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * "set"     – mutate a field in the execution context (returned to caller, NOT run as code)
 * "emit"    – fire a named event on the core event bus
 * "notify"  – enqueue a notification for a user (resolved by core)
 * "webhook" – POST to an external URL (capability-gated; URL validated at save time)
 */
export const ActionSchema = z.discriminatedUnion('type', [
  z.object({
    type:  z.literal('set'),
    path:  z.string().min(1).max(128),     // dot-path in result context
    value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  }),
  z.object({
    type:    z.literal('emit'),
    event:   z.string().min(1).max(128),   // event name, e.g. "crm.lead.escalated"
    payload: z.record(z.unknown()).optional(),
  }),
  z.object({
    type:   z.literal('notify'),
    userId: z.string().uuid().optional(),  // omit = notify rule owner
    template: z.string().max(64).optional(),
    message:  z.string().max(512),
  }),
  z.object({
    type: z.literal('webhook'),
    url:  z.string().url(),
    method: z.enum(['POST', 'GET']).default('POST'),
    headers: z.record(z.string()).optional(),
  }),
]);
export type Action = z.infer<typeof ActionSchema>;

// ─── Trigger ─────────────────────────────────────────────────────────────────

export const TriggerSchema = z.object({
  /**
   * Source of the trigger. Only "event" is supported in v1.
   *   event:<bus-event-name>  e.g. "event:crm.lead.created"
   *   schedule:<cron>         e.g. "schedule:0 9 * * 1"  (future)
   */
  source: z.string().regex(
    /^(event:[a-z0-9_.]+|schedule:[\d\s*\/,-]+)$/,
    'trigger.source must be "event:<name>" or "schedule:<cron>"',
  ),
  /**
   * Optional filter: only activate when the payload field equals this value.
   * Useful for distinguishing won vs lost on "crm.lead.closed".
   */
  filter: ConditionSchema.optional(),
});
export type Trigger = z.infer<typeof TriggerSchema>;

// ─── Rule ─────────────────────────────────────────────────────────────────────

export const RuleSchema = z.object({
  id:          z.string().uuid().optional(),     // assigned by DB on save
  tenantId:    z.string().uuid(),
  name:        z.string().min(1).max(128),
  description: z.string().max(512).optional(),
  enabled:     z.boolean().default(true),

  trigger:    TriggerSchema,
  conditions: ConditionOrGroupSchema.optional(), // undefined = always run actions
  actions:    z.array(ActionSchema).min(1).max(20),

  /**
   * Proposal flow: AI-generated rules start as proposals.
   * A rule CANNOT execute until approved = true.
   */
  approved:   z.boolean().default(false),
  approvedBy: z.string().uuid().optional(),       // userId who clicked Approve
  approvedAt: z.string().datetime().optional(),

  createdBy:  z.string().uuid(),
  createdAt:  z.string().datetime().optional(),
  updatedAt:  z.string().datetime().optional(),
});

export type Rule = z.infer<typeof RuleSchema>;

// A draft is the shape AI returns — no id, not yet approved
export const RuleDraftSchema = RuleSchema.omit({ id: true, approved: true, approvedBy: true, approvedAt: true });
export type RuleDraft = z.infer<typeof RuleDraftSchema>;
