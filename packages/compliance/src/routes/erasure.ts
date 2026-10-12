import type { FastifyInstance } from 'fastify';
import type { ZexCoreContext } from '@zexcore/core';
import { COMPLIANCE_CAPABILITIES } from '../permissions.js';
import { COMPLIANCE_EVENTS } from '../events.js';

export function registerErasureRoutes(server: FastifyInstance, core: ZexCoreContext): void {
  // ── SUBMIT ERASURE REQUEST ────────────────────────────────────────────────
  server.post('/api/compliance/erasure', {
    preHandler: [server.authenticate, server.requireCapability(COMPLIANCE_CAPABILITIES.ERASURE_REQUEST)],
    schema: {
      body: {
        type: 'object',
        required: ['subjectId'],
        properties: {
          subjectId: { type: 'string' },
          reason:    { type: 'string', maxLength: 255 },
        },
      },
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const body = request.body as { subjectId: string; reason?: string };

      const result = await core.db.execute({
        sql: `
          INSERT INTO compliance_erasure_requests (
            tenant_id, subject_id, requested_by, status, requested_at
          ) VALUES ($1, $2, $3, 'pending', NOW())
          RETURNING *
        `,
        params: [tenantId, body.subjectId, request.user.id],
      });

      const erasureReq = result.rows[0];

      await core.events.emit(COMPLIANCE_EVENTS.ERASURE_REQUESTED, {
        tenantId,
        requestId: erasureReq.id as string,
        subjectId: body.subjectId,
        anonymizedCount: 0,
      });

      await core.audit.log({
        action: 'compliance.erasure.requested',
        tenantId,
        actorId: request.user.id,
        resourceId: erasureReq.id as string,
        meta: { subjectId: body.subjectId, reason: body.reason },
      });

      return reply.status(201).send({ erasureRequest: erasureReq });
    },
  });

  // ── LIST ERASURE REQUESTS ─────────────────────────────────────────────────
  server.get('/api/compliance/erasure', {
    preHandler: [server.authenticate, server.requireCapability(COMPLIANCE_CAPABILITIES.ERASURE_REQUEST)],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'processing', 'completed', 'rejected'] },
          limit:  { type: 'integer', default: 50 },
          offset: { type: 'integer', default: 0 },
        },
      },
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const { status, limit = 50, offset = 0 } = request.query as { status?: string; limit?: number; offset?: number };

      let q = `SELECT * FROM compliance_erasure_requests WHERE tenant_id = $1`;
      const params: unknown[] = [tenantId];

      if (status) {
        params.push(status);
        q += ` AND status = $${params.length}`;
      }

      params.push(limit);  q += ` ORDER BY requested_at DESC LIMIT $${params.length}`;
      params.push(offset); q += ` OFFSET $${params.length}`;

      const result = await core.db.execute({ sql: q, params });
      return reply.send({ requests: result.rows, limit, offset });
    },
  });

  // ── EXECUTE ERASURE (RIGHT TO BE FORGOTTEN) ───────────────────────────────
  server.post<{ Params: { id: string } }>('/api/compliance/erasure/:id/execute', {
    preHandler: [server.authenticate, server.requireCapability(COMPLIANCE_CAPABILITIES.ERASURE_EXECUTE)],
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const { id } = request.params;

      const reqRes = await core.db.execute({
        sql: `SELECT * FROM compliance_erasure_requests WHERE id = $1 AND tenant_id = $2`,
        params: [id, tenantId],
      });

      if (reqRes.rows.length === 0) {
        return reply.status(404).send({ error: 'Erasure request not found' });
      }

      const reqRow = reqRes.rows[0];
      if (reqRow.status === 'completed') {
        return reply.status(400).send({ error: 'Erasure request already completed' });
      }

      const subjectId = reqRow.subject_id as string;
      let anonymizedCount = 0;

      // 1. Anonymize CRM Contacts matching email, id or subjectId
      try {
        const crmRes = await core.db.execute({
          sql: `
            UPDATE crm_contacts
            SET
              first_name = '[REDACTED]',
              last_name  = '[REDACTED]',
              company    = '[REDACTED]',
              email      = CONCAT('anonymized_', id, '@redacted.local'),
              phone      = '[REDACTED]',
              tags       = '[]'::jsonb,
              custom_fields = '{}'::jsonb,
              updated_at = NOW()
            WHERE tenant_id = $1 AND (id::text = $2 OR email = $2)
            RETURNING id
          `,
          params: [tenantId, subjectId],
        });
        anonymizedCount += crmRes.rows.length;
      } catch {
        // Module might not have tables or records
      }

      // 2. Revoke all active consents for the subject
      await core.db.execute({
        sql: `UPDATE compliance_consents SET revoked_at = NOW() WHERE tenant_id = $1 AND subject_id = $2 AND revoked_at IS NULL`,
        params: [tenantId, subjectId],
      });

      // 3. Mark request as completed
      const finalRes = await core.db.execute({
        sql: `
          UPDATE compliance_erasure_requests
          SET status = 'completed', anonymized_count = $1, completed_at = NOW()
          WHERE id = $2 AND tenant_id = $3
          RETURNING *
        `,
        params: [anonymizedCount, id, tenantId],
      });

      await core.events.emit(COMPLIANCE_EVENTS.ERASURE_COMPLETED, {
        tenantId,
        requestId: id,
        subjectId,
        anonymizedCount,
      });

      await core.audit.log({
        action: 'compliance.erasure.completed',
        tenantId,
        actorId: request.user.id,
        resourceId: id,
        meta: { subjectId, anonymizedCount },
      });

      return reply.send({ erasureRequest: finalRes.rows[0] });
    },
  });
}
