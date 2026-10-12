import type { FastifyInstance } from 'fastify';
import type { ZexCoreContext } from '@zexcore/core';
import { CRM_CAPABILITIES } from '../permissions.js';
import { CRM_EVENTS } from '../events.js';

export function registerLeadRoutes(server: FastifyInstance, core: ZexCoreContext): void {
  // ── LIST leads (optionally filtered by stage) ────────────────────────────────
  server.get('/api/crm/leads', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.LEADS_READ)],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          stageId:  { type: 'string' },
          closed:   { type: 'boolean' },
          limit:    { type: 'integer', default: 50, maximum: 200 },
          offset:   { type: 'integer', default: 0 },
        },
      },
    },
    handler: async (request, reply) => {
      const { stageId, closed, limit = 50, offset = 0 } = request.query as {
        stageId?: string; closed?: boolean; limit?: number; offset?: number;
      };
      const tenantId = request.tenant.id;

      let q = `
        SELECT l.*, c.first_name, c.last_name, c.company, c.email,
               s.name AS stage_name, s.position AS stage_position
        FROM crm_leads l
        JOIN crm_contacts c ON c.id = l.contact_id AND c.tenant_id = l.tenant_id
        JOIN crm_stages  s ON s.id = l.stage_id   AND s.tenant_id = l.tenant_id
        WHERE l.tenant_id = $1
      `;
      const params: unknown[] = [tenantId];

      if (stageId) {
        params.push(stageId);
        q += ` AND l.stage_id = $${params.length}`;
      }
      if (closed !== undefined) {
        q += closed
          ? ` AND l.closed_at IS NOT NULL`
          : ` AND l.closed_at IS NULL`;
      }

      params.push(limit);
      q += ` ORDER BY l.created_at DESC LIMIT $${params.length}`;
      params.push(offset);
      q += ` OFFSET $${params.length}`;

      const rows = await core.db.execute({ sql: q, params });
      return reply.send({ leads: rows.rows, limit, offset });
    },
  });

  // ── GET one lead ─────────────────────────────────────────────────────────────
  server.get<{ Params: { id: string } }>('/api/crm/leads/:id', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.LEADS_READ)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;

      const result = await core.db.execute({
        sql: `
          SELECT l.*, c.first_name, c.last_name, c.company, c.email,
                 s.name AS stage_name
          FROM crm_leads l
          JOIN crm_contacts c ON c.id = l.contact_id AND c.tenant_id = l.tenant_id
          JOIN crm_stages  s ON s.id = l.stage_id   AND s.tenant_id = l.tenant_id
          WHERE l.id = $1 AND l.tenant_id = $2
        `,
        params: [id, tenantId],
      });

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Lead not found' });
      }
      return reply.send({ lead: result.rows[0] });
    },
  });

  // ── CREATE lead ──────────────────────────────────────────────────────────────
  server.post('/api/crm/leads', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.LEADS_CREATE)],
    schema: {
      body: {
        type: 'object',
        required: ['contactId', 'stageId', 'title'],
        properties: {
          contactId:        { type: 'string', format: 'uuid' },
          stageId:          { type: 'string', format: 'uuid' },
          title:            { type: 'string', maxLength: 255 },
          value:            { type: 'integer' },
          currency:         { type: 'string', default: 'USD' },
          probability:      { type: 'integer', minimum: 0, maximum: 100 },
          expectedCloseAt:  { type: 'string', format: 'date-time' },
          customFields:     { type: 'object' },
        },
      },
    },
    handler: async (request, reply) => {
      const body = request.body as {
        contactId: string; stageId: string; title: string;
        value?: number; currency?: string; probability?: number;
        expectedCloseAt?: string; customFields?: Record<string, unknown>;
      };
      const tenantId = request.tenant.id;

      // Guard: contact must belong to this tenant
      const contactCheck = await core.db.execute({
        sql: `SELECT id FROM crm_contacts WHERE id = $1 AND tenant_id = $2`,
        params: [body.contactId, tenantId],
      });
      if (contactCheck.rows.length === 0) {
        return reply.status(400).send({ error: 'Contact not found in this workspace' });
      }

      // Guard: stage must belong to this tenant
      const stageCheck = await core.db.execute({
        sql: `SELECT id FROM crm_stages WHERE id = $1 AND tenant_id = $2`,
        params: [body.stageId, tenantId],
      });
      if (stageCheck.rows.length === 0) {
        return reply.status(400).send({ error: 'Stage not found in this workspace' });
      }

      const result = await core.db.execute({
        sql: `
          INSERT INTO crm_leads
            (tenant_id, contact_id, stage_id, title, value, currency,
             probability, expected_close_at, custom_fields)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          RETURNING *
        `,
        params: [
          tenantId,
          body.contactId,
          body.stageId,
          body.title,
          body.value     ?? null,
          body.currency  ?? 'USD',
          body.probability ?? null,
          body.expectedCloseAt ?? null,
          JSON.stringify(body.customFields ?? {}),
        ],
      });

      const lead = result.rows[0];
      await core.events.emit(CRM_EVENTS.LEAD_CREATED, {
        tenantId,
        leadId:    lead.id    as string,
        contactId: lead.contact_id as string,
        title:     lead.title as string,
        value:     lead.value as number | null,
        currency:  lead.currency as string,
      });

      await core.audit.log({
        action: 'crm.lead.created',
        tenantId,
        actorId: request.user.id,
        resourceId: lead.id as string,
        meta: { title: body.title, contactId: body.contactId },
      });

      return reply.status(201).send({ lead });
    },
  });

  // ── MOVE lead to a different stage ──────────────────────────────────────────
  server.patch<{ Params: { id: string } }>('/api/crm/leads/:id/move', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.LEADS_MOVE)],
    schema: {
      body: {
        type: 'object',
        required: ['stageId'],
        properties: {
          stageId: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const { stageId } = request.body as { stageId: string };
      const tenantId = request.tenant.id;

      // Fetch current stage before update (needed for event payload)
      const current = await core.db.execute({
        sql: `SELECT stage_id FROM crm_leads WHERE id = $1 AND tenant_id = $2`,
        params: [id, tenantId],
      });
      if (current.rows.length === 0) {
        return reply.status(404).send({ error: 'Lead not found' });
      }
      const fromStageId = current.rows[0].stage_id as string;

      // Guard: destination stage must belong to this tenant
      const stageCheck = await core.db.execute({
        sql: `SELECT id FROM crm_stages WHERE id = $1 AND tenant_id = $2`,
        params: [stageId, tenantId],
      });
      if (stageCheck.rows.length === 0) {
        return reply.status(400).send({ error: 'Target stage not found in this workspace' });
      }

      const result = await core.db.execute({
        sql: `
          UPDATE crm_leads
          SET stage_id = $1, updated_at = NOW()
          WHERE id = $2 AND tenant_id = $3
          RETURNING *
        `,
        params: [stageId, id, tenantId],
      });

      const lead = result.rows[0];
      await core.events.emit(CRM_EVENTS.LEAD_MOVED, {
        tenantId,
        leadId:      id,
        contactId:   lead.contact_id as string,
        title:       lead.title      as string,
        value:       lead.value      as number | null,
        currency:    lead.currency   as string,
        fromStageId,
        toStageId:   stageId,
      });

      return reply.send({ lead });
    },
  });

  // ── CLOSE lead (won / lost) ──────────────────────────────────────────────────
  server.patch<{ Params: { id: string } }>('/api/crm/leads/:id/close', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.LEADS_UPDATE)],
    schema: {
      body: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: { type: 'string', enum: ['won', 'lost'] },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const { reason } = request.body as { reason: 'won' | 'lost' };
      const tenantId = request.tenant.id;

      const result = await core.db.execute({
        sql: `
          UPDATE crm_leads
          SET closed_reason = $1, closed_at = NOW(), updated_at = NOW()
          WHERE id = $2 AND tenant_id = $3 AND closed_at IS NULL
          RETURNING *
        `,
        params: [reason, id, tenantId],
      });

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Lead not found or already closed' });
      }

      const lead = result.rows[0];
      const eventName = reason === 'won' ? CRM_EVENTS.LEAD_WON : CRM_EVENTS.LEAD_LOST;
      await core.events.emit(eventName, {
        tenantId,
        leadId:    id,
        contactId: lead.contact_id as string,
        title:     lead.title      as string,
        value:     lead.value      as number | null,
        currency:  lead.currency   as string,
        reason,
        closedAt:  (lead.closed_at as Date).toISOString(),
      });

      await core.audit.log({
        action: `crm.lead.${reason}`,
        tenantId,
        actorId: request.user.id,
        resourceId: id,
        meta: { reason },
      });

      return reply.send({ lead });
    },
  });

  // ── DELETE lead ──────────────────────────────────────────────────────────────
  server.delete<{ Params: { id: string } }>('/api/crm/leads/:id', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.LEADS_DELETE)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;

      await core.db.execute({
        sql: `DELETE FROM crm_leads WHERE id = $1 AND tenant_id = $2`,
        params: [id, tenantId],
      });

      await core.events.emit(CRM_EVENTS.LEAD_DELETED, {
        tenantId, leadId: id, contactId: '', title: '', value: null, currency: '',
      });

      return reply.status(204).send();
    },
  });

  // ── Pipeline stages CRUD ─────────────────────────────────────────────────────
  server.get('/api/crm/stages', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.LEADS_READ)],
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const result = await core.db.execute({
        sql: `SELECT * FROM crm_stages WHERE tenant_id = $1 ORDER BY position`,
        params: [tenantId],
      });
      return reply.send({ stages: result.rows });
    },
  });

  server.post('/api/crm/stages', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.STAGES_MANAGE)],
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name:      { type: 'string', maxLength: 64 },
          position:  { type: 'integer' },
          isDefault: { type: 'boolean', default: false },
        },
      },
    },
    handler: async (request, reply) => {
      const body = request.body as { name: string; position?: number; isDefault?: boolean };
      const tenantId = request.tenant.id;

      // Auto-assign position to end if not specified
      const maxPos = await core.db.execute({
        sql: `SELECT COALESCE(MAX(position),0) AS max FROM crm_stages WHERE tenant_id = $1`,
        params: [tenantId],
      });
      const position = body.position ?? ((maxPos.rows[0].max as number) + 1);

      const result = await core.db.execute({
        sql: `
          INSERT INTO crm_stages (tenant_id, name, position, is_default)
          VALUES ($1,$2,$3,$4)
          RETURNING *
        `,
        params: [tenantId, body.name, position, body.isDefault ?? false],
      });

      return reply.status(201).send({ stage: result.rows[0] });
    },
  });
}
