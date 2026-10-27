/**
 * Rules API Routes
 *
 * POST   /api/rules              – create a draft rule (approved=false)
 * GET    /api/rules              – list rules for the tenant
 * GET    /api/rules/:id          – get one rule
 * PATCH  /api/rules/:id          – update a draft (resets approval)
 * POST   /api/rules/:id/approve  – approve a rule (human gate)
 * POST   /api/rules/:id/disable  – disable without deleting
 * DELETE /api/rules/:id          – delete
 * POST   /api/rules/:id/test-run – dry-run against a sample payload (never executes actions)
 * POST   /api/rules/ai-draft     – AI-assisted: convert plain English → RuleDraft (approved=false)
 */


import type { FastifyInstance } from 'fastify';
import type { ZexCoreContext } from '@zexcore/core';
import { planLimitGuard } from '@zexcore/core';
import { RuleDraftSchema } from '../schema/rule.js';
import { evaluateConditionGroup } from '../evaluator/conditions.js';
import { authorRule } from '../ai/author.js';

const RULES_READ    = 'rules:read';
const RULES_MANAGE  = 'rules:manage';
const RULES_APPROVE = 'rules:approve';

export function registerRulesRoutes(server: FastifyInstance, core: ZexCoreContext): void {

  // ── AI DRAFT ──────────────────────────────────────────────────────────────
  // Converts a plain-English intent into a RuleDraft via Gemini.
  // The result is stored with approved=false — a human must still approve it.
  server.post('/api/rules/ai-draft', {
    preHandler: [server.authenticate, server.requireCapability(RULES_MANAGE), planLimitGuard('rules')],
    schema: {
      body: {
        type: 'object',
        required: ['intent'],
        properties: {
          intent: { type: 'string', minLength: 10, maxLength: 1000 },
        },
      },
    },
    handler: async (request, reply) => {
      const { intent } = request.body as { intent: string };
      const tenantId = request.tenant.id;
      const userId   = request.user.id;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return reply.status(503).send({ error: 'AI authoring is not configured on this server (missing GEMINI_API_KEY)' });
      }

      // Call the AI authoring pipeline
      const outcome = await authorRule({ intent, tenantId, createdBy: userId, apiKey });

      if (!outcome.success) {
        return reply.status(422).send({
          error:    'AI could not produce a valid rule from the given intent',
          detail:   outcome.error,
          issues:   outcome.issues,
          attempts: outcome.attempts,
          // Return the raw LLM output so the developer/user can see what went wrong
          rawOutput: outcome.rawOutput,
        });
      }

      const draft = outcome.draft;

      // Persist as a draft (approved=false)
      const result = await core.db.execute({
        sql: `
          INSERT INTO rules
            (tenant_id, name, description, enabled, trigger, conditions, actions,
             approved, created_by)
          VALUES ($1,$2,$3,$4,$5,$6,$7,FALSE,$8)
          RETURNING *
        `,
        params: [
          tenantId,
          draft.name,
          draft.description ?? null,
          draft.enabled ?? true,
          JSON.stringify(draft.trigger),
          draft.conditions ? JSON.stringify(draft.conditions) : null,
          JSON.stringify(draft.actions),
          userId,
        ],
      });

      await core.audit.log({
        action:     'rules.ai_draft.created',
        tenantId,
        actorId:    userId,
        resourceId: result.rows[0].id as string,
        meta: {
          intent,
          name:     draft.name,
          trigger:  draft.trigger.source,
          attempts: outcome.attempts,
        },
      });

      return reply.status(201).send({
        rule:     result.rows[0],
        meta: {
          generatedBy: 'gemini',
          attempts:    outcome.attempts,
          approved:    false,
          note: 'Review this rule carefully before approving. POST /api/rules/:id/approve to activate it.',
        },
      });
    },
  });

  // ── LIST ──────────────────────────────────────────────────────────────────
  server.get('/api/rules', {
    preHandler: [server.authenticate, server.requireCapability(RULES_READ)],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          approved: { type: 'boolean' },
          enabled:  { type: 'boolean' },
          trigger:  { type: 'string' },
          limit:    { type: 'integer', default: 50, maximum: 200 },
          offset:   { type: 'integer', default: 0 },
        },
      },
    },
    handler: async (request, reply) => {
      const { approved, enabled, trigger, limit = 50, offset = 0 } = request.query as {
        approved?: boolean; enabled?: boolean; trigger?: string;
        limit?: number; offset?: number;
      };
      const tenantId = request.tenant.id;

      let q = `SELECT * FROM rules WHERE tenant_id = $1`;
      const params: unknown[] = [tenantId];

      if (approved !== undefined) {
        params.push(approved);
        q += ` AND approved = $${params.length}`;
      }
      if (enabled !== undefined) {
        params.push(enabled);
        q += ` AND enabled = $${params.length}`;
      }
      if (trigger) {
        params.push(`%${trigger}%`);
        q += ` AND trigger->>'source' ILIKE $${params.length}`;
      }

      params.push(limit);
      q += ` ORDER BY created_at DESC LIMIT $${params.length}`;
      params.push(offset);
      q += ` OFFSET $${params.length}`;

      const result = await core.db.execute({ sql: q, params });
      return reply.send({ rules: result.rows, limit, offset });
    },
  });

  // ── GET ONE ───────────────────────────────────────────────────────────────
  server.get<{ Params: { id: string } }>('/api/rules/:id', {
    preHandler: [server.authenticate, server.requireCapability(RULES_READ)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;

      const result = await core.db.execute({
        sql: `SELECT * FROM rules WHERE id = $1 AND tenant_id = $2`,
        params: [id, tenantId],
      });

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Rule not found' });
      }
      return reply.send({ rule: result.rows[0] });
    },
  });

  // ── CREATE (draft) ────────────────────────────────────────────────────────
  server.post('/api/rules', {
    preHandler: [server.authenticate, server.requireCapability(RULES_MANAGE), planLimitGuard('rules')],
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const userId   = request.user.id;

      // Validate the incoming body against our DSL schema
      const parseResult = RuleDraftSchema.safeParse({
        ...(request.body as object),
        tenantId,
        createdBy: userId,
      });

      if (!parseResult.success) {
        return reply.status(422).send({
          error:  'Invalid rule definition',
          issues: parseResult.error.issues,
        });
      }

      const draft = parseResult.data;

      const result = await core.db.execute({
        sql: `
          INSERT INTO rules
            (tenant_id, name, description, enabled, trigger, conditions, actions,
             approved, created_by)
          VALUES ($1,$2,$3,$4,$5,$6,$7,FALSE,$8)
          RETURNING *
        `,
        params: [
          tenantId,
          draft.name,
          draft.description ?? null,
          draft.enabled ?? true,
          JSON.stringify(draft.trigger),
          draft.conditions ? JSON.stringify(draft.conditions) : null,
          JSON.stringify(draft.actions),
          userId,
        ],
      });

      await core.audit.log({
        action:     'rules.rule.created',
        tenantId,
        actorId:    userId,
        resourceId: result.rows[0].id as string,
        meta:       { name: draft.name, trigger: draft.trigger.source },
      });

      return reply.status(201).send({ rule: result.rows[0] });
    },
  });

  // ── UPDATE (resets approval) ──────────────────────────────────────────────
  server.patch<{ Params: { id: string } }>('/api/rules/:id', {
    preHandler: [server.authenticate, server.requireCapability(RULES_MANAGE)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;
      const userId   = request.user.id;

      // Any update to an approved rule must reset the approval (re-review required)
      const body = request.body as Partial<{
        name: string; description: string; enabled: boolean;
        trigger: unknown; conditions: unknown; actions: unknown[];
      }>;

      const setClauses: string[] = ['updated_at = NOW()', 'approved = FALSE', 'approved_by = NULL', 'approved_at = NULL'];
      const params: unknown[]    = [];

      if (body.name !== undefined)        { params.push(body.name);                          setClauses.push(`name = $${params.length}`);       }
      if (body.description !== undefined) { params.push(body.description);                   setClauses.push(`description = $${params.length}`); }
      if (body.enabled !== undefined)     { params.push(body.enabled);                       setClauses.push(`enabled = $${params.length}`);     }
      if (body.trigger !== undefined)     { params.push(JSON.stringify(body.trigger));        setClauses.push(`trigger = $${params.length}`);     }
      if (body.conditions !== undefined)  { params.push(JSON.stringify(body.conditions));     setClauses.push(`conditions = $${params.length}`);  }
      if (body.actions !== undefined)     { params.push(JSON.stringify(body.actions));        setClauses.push(`actions = $${params.length}`);     }

      params.push(id, tenantId);
      const result = await core.db.execute({
        sql: `UPDATE rules SET ${setClauses.join(', ')} WHERE id = $${params.length - 1} AND tenant_id = $${params.length} RETURNING *`,
        params,
      });

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Rule not found' });
      }

      await core.audit.log({
        action: 'rules.rule.updated',
        tenantId, actorId: userId, resourceId: id, meta: { fields: Object.keys(body) },
      });

      return reply.send({ rule: result.rows[0] });
    },
  });

  // ── APPROVE (human gate) ──────────────────────────────────────────────────
  server.post<{ Params: { id: string } }>('/api/rules/:id/approve', {
    preHandler: [server.authenticate, server.requireCapability(RULES_APPROVE)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;
      const userId   = request.user.id;

      const result = await core.db.execute({
        sql: `
          UPDATE rules
          SET approved = TRUE, approved_by = $1, approved_at = NOW(), updated_at = NOW()
          WHERE id = $2 AND tenant_id = $3 AND approved = FALSE
          RETURNING *
        `,
        params: [userId, id, tenantId],
      });

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Rule not found or already approved' });
      }

      // Hot-reload: notify runner to pick up the newly approved rule
      await core.events.emit('rules.rule.activated', { tenantId, rule: result.rows[0] });

      await core.audit.log({
        action: 'rules.rule.approved',
        tenantId, actorId: userId, resourceId: id, meta: {},
      });

      return reply.send({ rule: result.rows[0] });
    },
  });

  // ── DISABLE ───────────────────────────────────────────────────────────────
  server.post<{ Params: { id: string } }>('/api/rules/:id/disable', {
    preHandler: [server.authenticate, server.requireCapability(RULES_MANAGE)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;
      const userId   = request.user.id;

      await core.db.execute({
        sql: `UPDATE rules SET enabled = FALSE, updated_at = NOW() WHERE id = $1 AND tenant_id = $2`,
        params: [id, tenantId],
      });

      await core.events.emit('rules.rule.deactivated', { tenantId, ruleId: id });

      await core.audit.log({
        action: 'rules.rule.disabled', tenantId, actorId: userId, resourceId: id, meta: {},
      });

      return reply.status(204).send();
    },
  });

  // ── DELETE ────────────────────────────────────────────────────────────────
  server.delete<{ Params: { id: string } }>('/api/rules/:id', {
    preHandler: [server.authenticate, server.requireCapability(RULES_MANAGE)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;
      const userId   = request.user.id;

      await core.db.execute({
        sql: `DELETE FROM rules WHERE id = $1 AND tenant_id = $2`,
        params: [id, tenantId],
      });

      await core.events.emit('rules.rule.deactivated', { tenantId, ruleId: id });

      await core.audit.log({
        action: 'rules.rule.deleted', tenantId, actorId: userId, resourceId: id, meta: {},
      });

      return reply.status(204).send();
    },
  });

  // ── TEST-RUN (dry run, no side effects) ──────────────────────────────────
  server.post<{ Params: { id: string } }>('/api/rules/:id/test-run', {
    preHandler: [server.authenticate, server.requireCapability(RULES_MANAGE)],
    schema: {
      body: {
        type: 'object',
        required: ['payload'],
        properties: {
          payload: { type: 'object' },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;
      const { payload } = request.body as { payload: Record<string, unknown> };

      const result = await core.db.execute({
        sql: `SELECT * FROM rules WHERE id = $1 AND tenant_id = $2`,
        params: [id, tenantId],
      });

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Rule not found' });
      }

      const row = result.rows[0];
      const trigger  = typeof row.trigger    === 'string' ? JSON.parse(row.trigger as string)    : row.trigger;
      const conditions = row.conditions ? (typeof row.conditions === 'string' ? JSON.parse(row.conditions as string) : row.conditions) : null;

      // Evaluate trigger filter
      let triggerPassed = true;
      if (trigger.filter) {
        triggerPassed = evaluateConditionGroup(trigger.filter, payload);
      }

      // Evaluate conditions
      let conditionsPassed = true;
      let conditionTrace: unknown = null;
      if (conditions) {
        conditionsPassed = evaluateConditionGroup(conditions, payload);
        conditionTrace = conditions;
      }

      return reply.send({
        ruleId:              id,
        triggerPassed,
        conditionsPassed,
        wouldExecute:        triggerPassed && conditionsPassed,
        conditionTrace,
        // We deliberately do NOT execute actions in test-run
        actions:             row.actions,
        note: 'This is a dry-run. No actions were executed and no events were emitted.',
      });
    },
  });
}
