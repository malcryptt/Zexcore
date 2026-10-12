import type { FastifyInstance } from 'fastify';
import type { ZexCoreContext } from '@zexcore/core';
import { CRM_CAPABILITIES } from '../permissions.js';
import { CRM_EVENTS } from '../events.js';

const ACTIVITY_KINDS = ['note', 'call', 'email', 'task', 'meeting'] as const;

export function registerActivityRoutes(server: FastifyInstance, core: ZexCoreContext): void {
  // ── LIST activities (by contact or lead) ─────────────────────────────────────
  server.get('/api/crm/activities', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.ACTIVITIES_READ)],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          contactId: { type: 'string', format: 'uuid' },
          leadId:    { type: 'string', format: 'uuid' },
          kind:      { type: 'string' },
          pending:   { type: 'boolean' },
          limit:     { type: 'integer', default: 50, maximum: 200 },
          offset:    { type: 'integer', default: 0 },
        },
      },
    },
    handler: async (request, reply) => {
      const { contactId, leadId, kind, pending, limit = 50, offset = 0 } = request.query as {
        contactId?: string; leadId?: string; kind?: string;
        pending?: boolean; limit?: number; offset?: number;
      };
      const tenantId = request.tenant.id;

      let q = `SELECT * FROM crm_activities WHERE tenant_id = $1`;
      const params: unknown[] = [tenantId];

      if (contactId) {
        params.push(contactId);
        q += ` AND contact_id = $${params.length}`;
      }
      if (leadId) {
        params.push(leadId);
        q += ` AND lead_id = $${params.length}`;
      }
      if (kind) {
        params.push(kind);
        q += ` AND kind = $${params.length}`;
      }
      if (pending) {
        q += ` AND due_at IS NOT NULL AND completed_at IS NULL`;
      }

      params.push(limit);
      q += ` ORDER BY created_at DESC LIMIT $${params.length}`;
      params.push(offset);
      q += ` OFFSET $${params.length}`;

      const rows = await core.db.execute({ sql: q, params });
      return reply.send({ activities: rows.rows, limit, offset });
    },
  });

  // ── CREATE activity ──────────────────────────────────────────────────────────
  server.post('/api/crm/activities', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.ACTIVITIES_CREATE)],
    schema: {
      body: {
        type: 'object',
        required: ['kind', 'subject'],
        properties: {
          contactId:   { type: 'string', format: 'uuid' },
          leadId:      { type: 'string', format: 'uuid' },
          kind:        { type: 'string', enum: [...ACTIVITY_KINDS] },
          subject:     { type: 'string', maxLength: 255 },
          body:        { type: 'string' },
          dueAt:       { type: 'string', format: 'date-time' },
        },
      },
    },
    handler: async (request, reply) => {
      const input = request.body as {
        contactId?: string; leadId?: string;
        kind: string; subject: string; body?: string; dueAt?: string;
      };
      const tenantId = request.tenant.id;
      const userId   = request.user.id;

      if (!input.contactId && !input.leadId) {
        return reply.status(400).send({ error: 'Either contactId or leadId is required' });
      }

      const result = await core.db.execute({
        sql: `
          INSERT INTO crm_activities
            (tenant_id, contact_id, lead_id, kind, subject, body, due_at, created_by)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          RETURNING *
        `,
        params: [
          tenantId,
          input.contactId ?? null,
          input.leadId    ?? null,
          input.kind,
          input.subject,
          input.body  ?? null,
          input.dueAt ?? null,
          userId,
        ],
      });

      const activity = result.rows[0];
      await core.events.emit(CRM_EVENTS.ACTIVITY_LOGGED, {
        tenantId,
        activityId: activity.id  as string,
        contactId:  activity.contact_id as string | null,
        leadId:     activity.lead_id    as string | null,
        kind:       activity.kind       as string,
        createdBy:  userId,
      });

      return reply.status(201).send({ activity });
    },
  });

  // ── COMPLETE activity ────────────────────────────────────────────────────────
  server.patch<{ Params: { id: string } }>('/api/crm/activities/:id/complete', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.ACTIVITIES_UPDATE)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;

      const result = await core.db.execute({
        sql: `
          UPDATE crm_activities
          SET completed_at = NOW(), updated_at = NOW()
          WHERE id = $1 AND tenant_id = $2 AND completed_at IS NULL
          RETURNING *
        `,
        params: [id, tenantId],
      });

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Activity not found or already completed' });
      }
      return reply.send({ activity: result.rows[0] });
    },
  });

  // ── DELETE activity ──────────────────────────────────────────────────────────
  server.delete<{ Params: { id: string } }>('/api/crm/activities/:id', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.ACTIVITIES_DELETE)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;

      await core.db.execute({
        sql: `DELETE FROM crm_activities WHERE id = $1 AND tenant_id = $2`,
        params: [id, tenantId],
      });

      return reply.status(204).send();
    },
  });
}
