import type { FastifyInstance } from 'fastify';
import type { ZexCoreContext } from '@zexcore/core';
import { COMPLIANCE_CAPABILITIES } from '../permissions.js';

export function registerAccessLogRoutes(server: FastifyInstance, core: ZexCoreContext): void {
  // ── QUERY PII ACCESS AUDIT LOGS ───────────────────────────────────────────
  server.get('/api/compliance/access-logs', {
    preHandler: [server.authenticate, server.requireCapability(COMPLIANCE_CAPABILITIES.ACCESS_LOGS_READ)],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          subjectId: { type: 'string' },
          entity:    { type: 'string' },
          limit:     { type: 'integer', default: 50, maximum: 200 },
          offset:    { type: 'integer', default: 0 },
        },
      },
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const { subjectId, entity, limit = 50, offset = 0 } = request.query as {
        subjectId?: string;
        entity?: string;
        limit?: number;
        offset?: number;
      };

      let q = `SELECT * FROM compliance_access_logs WHERE tenant_id = $1`;
      const params: unknown[] = [tenantId];

      if (subjectId) {
        params.push(subjectId);
        q += ` AND subject_id = $${params.length}`;
      }
      if (entity) {
        params.push(entity);
        q += ` AND entity = $${params.length}`;
      }

      params.push(limit);  q += ` ORDER BY accessed_at DESC LIMIT $${params.length}`;
      params.push(offset); q += ` OFFSET $${params.length}`;

      const result = await core.db.execute({ sql: q, params });
      return reply.send({ accessLogs: result.rows, limit, offset });
    },
  });

  // ── LOG PII ACCESS ────────────────────────────────────────────────────────
  server.post('/api/compliance/access-logs', {
    preHandler: [server.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['subjectId', 'entity', 'action', 'fields'],
        properties: {
          subjectId: { type: 'string' },
          entity:    { type: 'string' },
          action:    { type: 'string', enum: ['read', 'export', 'update', 'delete'] },
          fields:    { type: 'array', items: { type: 'string' } },
        },
      },
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const body = request.body as {
        subjectId: string;
        entity: string;
        action: 'read' | 'export' | 'update' | 'delete';
        fields: string[];
      };

      const result = await core.db.execute({
        sql: `
          INSERT INTO compliance_access_logs (
            tenant_id, actor_id, subject_id, entity, action, fields, accessed_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
          RETURNING *
        `,
        params: [
          tenantId,
          request.user.id,
          body.subjectId,
          body.entity,
          body.action,
          JSON.stringify(body.fields),
        ],
      });

      return reply.status(201).send({ accessLog: result.rows[0] });
    },
  });
}
