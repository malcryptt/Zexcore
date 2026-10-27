import type { FastifyInstance } from 'fastify';
import type { ZexCoreContext } from '@zexcore/core';
import { planLimitGuard } from '@zexcore/core';
import { CRM_CAPABILITIES } from '../permissions.js';
import { CRM_EVENTS } from '../events.js';

export function registerContactRoutes(server: FastifyInstance, core: ZexCoreContext): void {
  // ── LIST ────────────────────────────────────────────────────────────────────
  server.get('/api/crm/contacts', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.CONTACTS_READ)],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          search:  { type: 'string' },
          type:    { type: 'string', enum: ['person', 'company'] },
          limit:   { type: 'integer', default: 50, maximum: 200 },
          offset:  { type: 'integer', default: 0 },
        },
      },
    },
    handler: async (request, reply) => {
      const { search, type, limit = 50, offset = 0 } = request.query as {
        search?: string; type?: string; limit?: number; offset?: number;
      };
      const tenantId = request.tenant.id;

      let q = `
        SELECT id, tenant_id, type, first_name, last_name, company,
               email, phone, tags, custom_fields, created_at, updated_at
        FROM crm_contacts
        WHERE tenant_id = $1
      `;
      const params: unknown[] = [tenantId];

      if (type) {
        params.push(type);
        q += ` AND type = $${params.length}`;
      }
      if (search) {
        params.push(`%${search}%`);
        q += ` AND (
          first_name ILIKE $${params.length} OR
          last_name  ILIKE $${params.length} OR
          company    ILIKE $${params.length} OR
          email      ILIKE $${params.length}
        )`;
      }

      params.push(limit);
      q += ` ORDER BY created_at DESC LIMIT $${params.length}`;
      params.push(offset);
      q += ` OFFSET $${params.length}`;

      const rows = await core.db.execute({ sql: q, params });
      return reply.send({ contacts: rows.rows, limit, offset });
    },
  });

  // ── GET ONE ─────────────────────────────────────────────────────────────────
  server.get<{ Params: { id: string } }>('/api/crm/contacts/:id', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.CONTACTS_READ)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;

      const result = await core.db.execute({
        sql: `SELECT * FROM crm_contacts WHERE id = $1 AND tenant_id = $2`,
        params: [id, tenantId],
      });

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Contact not found' });
      }
      return reply.send({ contact: result.rows[0] });
    },
  });

  // ── CREATE ──────────────────────────────────────────────────────────────────
  server.post('/api/crm/contacts', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.CONTACTS_CREATE), planLimitGuard('crmContacts')],
    schema: {
      body: {
        type: 'object',
        required: ['type'],
        properties: {
          type:         { type: 'string', enum: ['person', 'company'] },
          firstName:    { type: 'string', maxLength: 128 },
          lastName:     { type: 'string', maxLength: 128 },
          company:      { type: 'string', maxLength: 255 },
          email:        { type: 'string', format: 'email' },
          phone:        { type: 'string', maxLength: 32 },
          tags:         { type: 'array', items: { type: 'string' } },
          customFields: { type: 'object' },
        },
      },
    },
    handler: async (request, reply) => {
      const body = request.body as {
        type: 'person' | 'company';
        firstName?: string; lastName?: string; company?: string;
        email?: string; phone?: string;
        tags?: string[]; customFields?: Record<string, unknown>;
      };
      const tenantId = request.tenant.id;

      const result = await core.db.execute({
        sql: `
          INSERT INTO crm_contacts
            (tenant_id, type, first_name, last_name, company, email, phone, tags, custom_fields)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          RETURNING *
        `,
        params: [
          tenantId,
          body.type,
          body.firstName ?? null,
          body.lastName  ?? null,
          body.company   ?? null,
          body.email     ?? null,
          body.phone     ?? null,
          JSON.stringify(body.tags ?? []),
          JSON.stringify(body.customFields ?? {}),
        ],
      });

      const contact = result.rows[0];

      await core.events.emit(CRM_EVENTS.CONTACT_CREATED, {
        tenantId,
        contactId: contact.id as string,
        email:     contact.email as string | null,
      });

      await core.audit.log({
        action:     'crm.contact.created',
        tenantId,
        actorId:    request.user.id,
        resourceId: contact.id as string,
        meta:       { type: body.type, email: body.email },
      });

      return reply.status(201).send({ contact });
    },
  });

  // ── UPDATE ──────────────────────────────────────────────────────────────────
  server.patch<{ Params: { id: string } }>('/api/crm/contacts/:id', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.CONTACTS_UPDATE)],
    schema: {
      body: {
        type: 'object',
        properties: {
          firstName:    { type: 'string' },
          lastName:     { type: 'string' },
          company:      { type: 'string' },
          email:        { type: 'string', format: 'email' },
          phone:        { type: 'string' },
          tags:         { type: 'array', items: { type: 'string' } },
          customFields: { type: 'object' },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const body   = request.body as Record<string, unknown>;
      const tenantId = request.tenant.id;

      const fieldMap: Record<string, string> = {
        firstName: 'first_name', lastName: 'last_name', company: 'company',
        email: 'email', phone: 'phone', tags: 'tags', customFields: 'custom_fields',
      };
      const setClauses: string[] = [];
      const params: unknown[]    = [];

      for (const [jsKey, col] of Object.entries(fieldMap)) {
        if (jsKey in body) {
          params.push(
            jsKey === 'tags' || jsKey === 'customFields'
              ? JSON.stringify(body[jsKey])
              : body[jsKey],
          );
          setClauses.push(`${col} = $${params.length}`);
        }
      }

      if (setClauses.length === 0) {
        return reply.status(400).send({ error: 'Nothing to update' });
      }

      params.push(id, tenantId);
      const result = await core.db.execute({
        sql: `
          UPDATE crm_contacts
          SET ${setClauses.join(', ')}, updated_at = NOW()
          WHERE id = $${params.length - 1} AND tenant_id = $${params.length}
          RETURNING *
        `,
        params,
      });

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Contact not found' });
      }

      await core.events.emit(CRM_EVENTS.CONTACT_UPDATED, {
        tenantId,
        contactId: id,
        email: result.rows[0].email as string | null,
      });

      return reply.send({ contact: result.rows[0] });
    },
  });

  // ── DELETE ──────────────────────────────────────────────────────────────────
  server.delete<{ Params: { id: string } }>('/api/crm/contacts/:id', {
    preHandler: [server.authenticate, server.requireCapability(CRM_CAPABILITIES.CONTACTS_DELETE)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;

      await core.db.execute({
        sql: `DELETE FROM crm_contacts WHERE id = $1 AND tenant_id = $2`,
        params: [id, tenantId],
      });

      await core.events.emit(CRM_EVENTS.CONTACT_DELETED, {
        tenantId, contactId: id, email: null,
      });

      await core.audit.log({
        action: 'crm.contact.deleted',
        tenantId,
        actorId: request.user.id,
        resourceId: id,
        meta: {},
      });

      return reply.status(204).send();
    },
  });
}
