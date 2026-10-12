import type { FastifyInstance } from 'fastify';
import type { ZexCoreContext } from '@zexcore/core';
import { COMPLIANCE_CAPABILITIES } from '../permissions.js';
import { COMPLIANCE_EVENTS } from '../events.js';

export function registerExportRoutes(server: FastifyInstance, core: ZexCoreContext): void {
  // ── REQUEST PORTABLE DATA EXPORT ──────────────────────────────────────────
  server.post('/api/compliance/export', {
    preHandler: [server.authenticate, server.requireCapability(COMPLIANCE_CAPABILITIES.EXPORT_REQUEST)],
    schema: {
      body: {
        type: 'object',
        required: ['subjectId'],
        properties: {
          subjectId: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const { subjectId } = request.body as { subjectId: string };

      // 1. Gather all tenant data associated with subjectId
      const bundle: Record<string, unknown> = {
        exportedAt: new Date().toISOString(),
        tenantId,
        subjectId,
      };

      // Gather consents
      const consentsRes = await core.db.execute({
        sql: `SELECT id, purpose, legal_basis, granted_at, revoked_at FROM compliance_consents WHERE tenant_id = $1 AND subject_id = $2`,
        params: [tenantId, subjectId],
      });
      bundle.consents = consentsRes.rows;

      // Gather CRM contacts
      try {
        const crmRes = await core.db.execute({
          sql: `SELECT id, first_name, last_name, company, email, phone, tags, custom_fields, created_at FROM crm_contacts WHERE tenant_id = $1 AND (id::text = $2 OR email = $2)`,
          params: [tenantId, subjectId],
        });
        bundle.crmContacts = crmRes.rows;
      } catch {
        bundle.crmContacts = [];
      }

      // 2. Insert into compliance_data_exports with 7-day expiry
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const insertRes = await core.db.execute({
        sql: `
          INSERT INTO compliance_data_exports (
            tenant_id, subject_id, requested_by, status, bundle_payload, expires_at, created_at
          ) VALUES ($1, $2, $3, 'ready', $4, $5, NOW())
          RETURNING id, tenant_id, subject_id, requested_by, status, expires_at, created_at
        `,
        params: [tenantId, subjectId, request.user.id, JSON.stringify(bundle), expiresAt],
      });

      const exportRecord = insertRes.rows[0];

      await core.events.emit(COMPLIANCE_EVENTS.EXPORT_READY, {
        tenantId,
        exportId: exportRecord.id as string,
        subjectId,
      });

      await core.audit.log({
        action: 'compliance.export.ready',
        tenantId,
        actorId: request.user.id,
        resourceId: exportRecord.id as string,
        meta: { subjectId, expiresAt },
      });

      return reply.status(201).send({ export: exportRecord });
    },
  });

  // ── RETRIEVE EXPORT BUNDLE ────────────────────────────────────────────────
  server.get<{ Params: { id: string } }>('/api/compliance/export/:id', {
    preHandler: [server.authenticate, server.requireCapability(COMPLIANCE_CAPABILITIES.EXPORT_REQUEST)],
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const { id } = request.params;

      const result = await core.db.execute({
        sql: `
          SELECT * FROM compliance_data_exports
          WHERE id = $1 AND tenant_id = $2
        `,
        params: [id, tenantId],
      });

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Export bundle not found' });
      }

      const exp = result.rows[0];
      if (new Date(exp.expires_at as string) < new Date()) {
        return reply.status(410).send({ error: 'Export bundle has expired' });
      }

      return reply.send({ export: exp });
    },
  });
}
