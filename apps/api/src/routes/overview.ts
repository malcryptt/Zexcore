import type { FastifyInstance } from 'fastify';
import { withTenantDb, sql, verifyAuditChain } from '@zexcore/core';

export function registerOverviewRoutes(server: FastifyInstance): void {
  // ── Workspace overview: real counts for the signed-in tenant ──────────────
  server.get('/api/overview', { preHandler: [server.authenticate] }, async (request, reply) => {
    const tenant = (request as any).tenant;
    if (!tenant?.id) return reply.status(400).send({ error: 'Tenant context required' });

    const data = await withTenantDb(tenant.id, async (tx) => {
      const rows = (await tx.execute(sql`
        SELECT
          (SELECT count(*) FROM iot_devices)                                         AS devices_total,
          (SELECT count(*) FROM iot_devices WHERE status = 'online')                 AS devices_online,
          (SELECT count(*) FROM rules)                                               AS rules_total,
          (SELECT count(*) FROM rules WHERE enabled AND approved)                    AS rules_active,
          (SELECT count(*) FROM crm_contacts)                                        AS contacts_total,
          (SELECT count(*) FROM crm_leads WHERE closed_at IS NULL)                   AS leads_open,
          (SELECT coalesce(sum(value), 0) FROM crm_leads WHERE closed_at IS NULL)    AS pipeline_value_minor,
          (SELECT count(*) FROM cms_pages WHERE status = 'published')                AS pages_published,
          (SELECT count(*) FROM cms_pages WHERE status <> 'published')               AS pages_draft,
          (SELECT count(*) FROM compliance_consents WHERE revoked_at IS NULL)        AS consents_active,
          (SELECT count(*) FROM iot_alert_events)                                    AS alerts_total
      `)) as unknown as Record<string, string>[];
      const recent = (await tx.execute(sql`
        SELECT seq, action, entity, entity_id, principal_type, created_at
          FROM audit_log WHERE seq IS NOT NULL ORDER BY seq DESC LIMIT 8
      `)) as unknown as any[];
      return { counts: rows[0]!, recent };
    });

    const n = (k: string) => Number(data.counts[k] ?? 0);
    return reply.send({
      devices: { total: n('devices_total'), online: n('devices_online') },
      rules: { total: n('rules_total'), active: n('rules_active') },
      crm: { contacts: n('contacts_total'), openLeads: n('leads_open'), pipelineValueMinor: n('pipeline_value_minor') },
      cms: { published: n('pages_published'), drafts: n('pages_draft') },
      privacy: { activeConsents: n('consents_active') },
      alerts: { total: n('alerts_total') },
      recentActivity: data.recent,
    });
  });

  // ── Audit log viewer (newest first, cursor by seq) ────────────────────────
  server.get<{ Querystring: { limit?: number; before?: number; action?: string } }>(
    '/api/audit-log',
    {
      preHandler: [server.authenticate, server.requireCapability('audit:read')],
      schema: {
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
            before: { type: 'integer', minimum: 1 },
            action: { type: 'string', maxLength: 64 },
          },
        },
      },
    },
    async (request, reply) => {
      const tenant = (request as any).tenant;
      if (!tenant?.id) return reply.status(400).send({ error: 'Tenant context required' });
      const { limit = 50, before, action } = request.query;

      const entries = await withTenantDb(tenant.id, async (tx) =>
        (await tx.execute(sql`
          SELECT seq, action, entity, entity_id, principal_type, user_id, changes, hash, prev_hash, created_at
            FROM audit_log
           WHERE seq IS NOT NULL
             AND (${before ?? null}::bigint IS NULL OR seq < ${before ?? null}::bigint)
             AND (${action ?? null}::text IS NULL OR action = ${action ?? null}::text)
           ORDER BY seq DESC LIMIT ${limit}
        `)) as unknown as any[],
      );
      const nextBefore = entries.length === limit ? entries[entries.length - 1].seq : null;
      return reply.send({ entries, nextBefore });
    },
  );

  // ── Verify the whole chain (recomputed inside the database) ───────────────
  server.get('/api/audit-log/verify', { preHandler: [server.authenticate, server.requireCapability('audit:read')] }, async (request, reply) => {
    const tenant = (request as any).tenant;
    if (!tenant?.id) return reply.status(400).send({ error: 'Tenant context required' });
    return reply.send(await verifyAuditChain(tenant.id));
  });
}
