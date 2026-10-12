import type { FastifyInstance } from 'fastify';
import type { ZexCoreContext } from '@zexcore/core';
import { COMPLIANCE_CAPABILITIES } from '../permissions.js';
import { COMPLIANCE_EVENTS } from '../events.js';

export function registerConsentRoutes(server: FastifyInstance, core: ZexCoreContext): void {
  // ── RECORD CONSENT ────────────────────────────────────────────────────────
  server.post('/api/compliance/consent', {
    preHandler: [server.authenticate, server.requireCapability(COMPLIANCE_CAPABILITIES.CONSENT_MANAGE)],
    schema: {
      body: {
        type: 'object',
        required: ['subjectId', 'purpose'],
        properties: {
          subjectId:  { type: 'string' },
          purpose:    { type: 'string', minLength: 2, maxLength: 128 },
          legalBasis: {
            type: 'string',
            enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'legitimate_interests'],
            default: 'consent',
          },
          meta:       { type: 'object' },
        },
      },
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const body = request.body as {
        subjectId: string;
        purpose: string;
        legalBasis?: string;
        meta?: Record<string, unknown>;
      };

      const ipAddress = request.ip || null;
      const userAgent = (request.headers['user-agent'] as string) || null;
      const legalBasis = body.legalBasis || 'consent';

      const result = await core.db.execute({
        sql: `
          INSERT INTO compliance_consents (
            tenant_id, subject_id, purpose, legal_basis, granted_at, ip_address, user_agent, meta
          ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)
          ON CONFLICT (tenant_id, subject_id, purpose)
          DO UPDATE SET
            legal_basis = EXCLUDED.legal_basis,
            granted_at = NOW(),
            revoked_at = NULL,
            ip_address = EXCLUDED.ip_address,
            user_agent = EXCLUDED.user_agent,
            meta = EXCLUDED.meta
          RETURNING *
        `,
        params: [
          tenantId,
          body.subjectId,
          body.purpose,
          legalBasis,
          ipAddress,
          userAgent,
          JSON.stringify(body.meta || {}),
        ],
      });

      const consent = result.rows[0];

      await core.events.emit(COMPLIANCE_EVENTS.CONSENT_GRANTED, {
        tenantId,
        subjectId: body.subjectId,
        purpose: body.purpose,
        legalBasis,
      });

      await core.audit.log({
        action: 'compliance.consent.granted',
        tenantId,
        actorId: request.user.id,
        resourceId: consent.id as string,
        meta: { subjectId: body.subjectId, purpose: body.purpose, legalBasis },
      });

      return reply.status(201).send({ consent });
    },
  });

  // ── GET CONSENTS FOR SUBJECT ──────────────────────────────────────────────
  server.get<{ Params: { subjectId: string } }>('/api/compliance/consent/:subjectId', {
    preHandler: [server.authenticate, server.requireCapability(COMPLIANCE_CAPABILITIES.CONSENT_READ)],
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const { subjectId } = request.params;

      const result = await core.db.execute({
        sql: `
          SELECT * FROM compliance_consents
          WHERE tenant_id = $1 AND subject_id = $2
          ORDER BY granted_at DESC
        `,
        params: [tenantId, subjectId],
      });

      return reply.send({ consents: result.rows });
    },
  });

  // ── REVOKE CONSENT ────────────────────────────────────────────────────────
  server.post('/api/compliance/consent/revoke', {
    preHandler: [server.authenticate, server.requireCapability(COMPLIANCE_CAPABILITIES.CONSENT_MANAGE)],
    schema: {
      body: {
        type: 'object',
        required: ['subjectId', 'purpose'],
        properties: {
          subjectId: { type: 'string' },
          purpose:   { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const body = request.body as { subjectId: string; purpose: string };

      const result = await core.db.execute({
        sql: `
          UPDATE compliance_consents
          SET revoked_at = NOW()
          WHERE tenant_id = $1 AND subject_id = $2 AND purpose = $3 AND revoked_at IS NULL
          RETURNING *
        `,
        params: [tenantId, body.subjectId, body.purpose],
      });

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Active consent record not found for this purpose' });
      }

      await core.events.emit(COMPLIANCE_EVENTS.CONSENT_REVOKED, {
        tenantId,
        subjectId: body.subjectId,
        purpose: body.purpose,
        legalBasis: 'revoked',
      });

      await core.audit.log({
        action: 'compliance.consent.revoked',
        tenantId,
        actorId: request.user.id,
        resourceId: result.rows[0].id as string,
        meta: { subjectId: body.subjectId, purpose: body.purpose },
      });

      return reply.send({ consent: result.rows[0] });
    },
  });
}
