import type { FastifyInstance } from 'fastify';
import type { ZexCoreContext } from '@zexcore/core';
import { COMPLIANCE_CAPABILITIES } from '../permissions.js';
import { COMPLIANCE_EVENTS } from '../events.js';

export function registerRetentionRoutes(server: FastifyInstance, core: ZexCoreContext): void {
  // ── LIST RETENTION POLICIES ───────────────────────────────────────────────
  server.get('/api/compliance/retention', {
    preHandler: [server.authenticate, server.requireCapability(COMPLIANCE_CAPABILITIES.RETENTION_READ)],
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const result = await core.db.execute({
        sql: `SELECT * FROM compliance_retention_policies WHERE tenant_id = $1 ORDER BY entity ASC`,
        params: [tenantId],
      });
      return reply.send({ policies: result.rows });
    },
  });

  // ── UPSERT RETENTION POLICY ───────────────────────────────────────────────
  server.post('/api/compliance/retention', {
    preHandler: [server.authenticate, server.requireCapability(COMPLIANCE_CAPABILITIES.RETENTION_MANAGE)],
    schema: {
      body: {
        type: 'object',
        required: ['entity', 'retentionDays'],
        properties: {
          entity:        { type: 'string', minLength: 2, maxLength: 64 },
          retentionDays: { type: 'integer', minimum: 1, maximum: 3650 },
          action:        { type: 'string', enum: ['anonymize', 'hard_delete'], default: 'hard_delete' },
          enabled:       { type: 'boolean', default: true },
        },
      },
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const body = request.body as {
        entity: string;
        retentionDays: number;
        action?: 'anonymize' | 'hard_delete';
        enabled?: boolean;
      };

      const action = body.action || 'hard_delete';
      const enabled = body.enabled ?? true;

      const result = await core.db.execute({
        sql: `
          INSERT INTO compliance_retention_policies (
            tenant_id, entity, retention_days, action, enabled, updated_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT (tenant_id, entity)
          DO UPDATE SET
            retention_days = EXCLUDED.retention_days,
            action = EXCLUDED.action,
            enabled = EXCLUDED.enabled,
            updated_at = NOW()
          RETURNING *
        `,
        params: [tenantId, body.entity, body.retentionDays, action, enabled],
      });

      await core.audit.log({
        action: 'compliance.retention.configured',
        tenantId,
        actorId: request.user.id,
        resourceId: result.rows[0].id as string,
        meta: { entity: body.entity, retentionDays: body.retentionDays, action },
      });

      return reply.status(201).send({ policy: result.rows[0] });
    },
  });

  // ── EXECUTE RETENTION ENFORCEMENT ─────────────────────────────────────────
  server.post('/api/compliance/retention/run', {
    preHandler: [server.authenticate, server.requireCapability(COMPLIANCE_CAPABILITIES.RETENTION_MANAGE)],
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;

      const policiesRes = await core.db.execute({
        sql: `SELECT * FROM compliance_retention_policies WHERE tenant_id = $1 AND enabled = TRUE`,
        params: [tenantId],
      });

      const summary: Array<{ entity: string; purged: number; days: number }> = [];

      for (const policy of policiesRes.rows) {
        const entity = policy.entity as string;
        const days = policy.retention_days as number;
        let purgedCount = 0;

        try {
          if (entity === 'iot_telemetry') {
            const delRes = await core.db.execute({
              sql: `DELETE FROM iot_telemetry WHERE tenant_id = $1 AND recorded_at < NOW() - ($2 || ' days')::interval RETURNING id`,
              params: [tenantId, days.toString()],
            });
            purgedCount = delRes.rows.length;
          } else if (entity === 'compliance_access_logs') {
            const delRes = await core.db.execute({
              sql: `DELETE FROM compliance_access_logs WHERE tenant_id = $1 AND accessed_at < NOW() - ($2 || ' days')::interval RETURNING id`,
              params: [tenantId, days.toString()],
            });
            purgedCount = delRes.rows.length;
          }

          // Update lastRunAt on policy
          await core.db.execute({
            sql: `UPDATE compliance_retention_policies SET last_run_at = NOW() WHERE id = $1`,
            params: [policy.id],
          });

          await core.events.emit(COMPLIANCE_EVENTS.RETENTION_ENFORCED, {
            tenantId,
            entity,
            purgedCount,
            retentionDays: days,
          });

          summary.push({ entity, purged: purgedCount, days });
        } catch {
          // Continue with next policy
        }
      }

      await core.audit.log({
        action: 'compliance.retention.enforced',
        tenantId,
        actorId: request.user.id,
        resourceId: tenantId,
        meta: { summary },
      });

      return reply.send({ result: 'retention_completed', summary });
    },
  });
}
