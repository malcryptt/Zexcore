import type { FastifyInstance } from 'fastify';
import type { ZexCoreContext } from '@zexcore/core';
import { IOT_CAPABILITIES } from '../permissions.js';
import { IOT_EVENTS } from '../events.js';
import { createHash, randomBytes } from 'node:crypto';

// ─── Device token hashing ─────────────────────────────────────────────────────
// Each device is issued a secret token on registration.
// We store a SHA-256 hash; the plain token is returned once and never stored.

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function registerDeviceRoutes(server: FastifyInstance, core: ZexCoreContext): void {
  // ── LIST ──────────────────────────────────────────────────────────────────
  server.get('/api/iot/devices', {
    preHandler: [server.authenticate, server.requireCapability(IOT_CAPABILITIES.DEVICES_READ)],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          kind:   { type: 'string' },
          status: { type: 'string', enum: ['online', 'offline', 'unknown'] },
          limit:  { type: 'integer', default: 50, maximum: 200 },
          offset: { type: 'integer', default: 0 },
        },
      },
    },
    handler: async (request, reply) => {
      const { kind, status, limit = 50, offset = 0 } = request.query as {
        kind?: string; status?: string; limit?: number; offset?: number;
      };
      const tenantId = request.tenant.id;

      let q = `
        SELECT id, tenant_id, device_key, name, kind, status,
               firmware_version, tags, meta,
               last_seen_at, created_at, updated_at
        FROM iot_devices WHERE tenant_id = $1
      `;
      const params: unknown[] = [tenantId];

      if (kind)   { params.push(kind);   q += ` AND kind = $${params.length}`; }
      if (status) { params.push(status); q += ` AND status = $${params.length}`; }

      params.push(limit);  q += ` ORDER BY created_at DESC LIMIT $${params.length}`;
      params.push(offset); q += ` OFFSET $${params.length}`;

      const result = await core.db.execute({ sql: q, params });
      return reply.send({ devices: result.rows, limit, offset });
    },
  });

  // ── GET ONE ───────────────────────────────────────────────────────────────
  server.get<{ Params: { id: string } }>('/api/iot/devices/:id', {
    preHandler: [server.authenticate, server.requireCapability(IOT_CAPABILITIES.DEVICES_READ)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;
      const result = await core.db.execute({
        sql: `SELECT id, tenant_id, device_key, name, kind, status,
                     firmware_version, tags, meta, last_seen_at, created_at, updated_at
              FROM iot_devices WHERE id = $1 AND tenant_id = $2`,
        params: [id, tenantId],
      });
      if (result.rows.length === 0) return reply.status(404).send({ error: 'Device not found' });
      return reply.send({ device: result.rows[0] });
    },
  });

  // ── REGISTER ──────────────────────────────────────────────────────────────
  server.post('/api/iot/devices', {
    preHandler: [server.authenticate, server.requireCapability(IOT_CAPABILITIES.DEVICES_MANAGE)],
    schema: {
      body: {
        type: 'object',
        required: ['deviceKey', 'name', 'kind'],
        properties: {
          deviceKey:       { type: 'string', minLength: 4, maxLength: 64 },
          name:            { type: 'string', maxLength: 128 },
          kind:            { type: 'string', maxLength: 64 },  // e.g. 'temperature_sensor', 'gateway'
          firmwareVersion: { type: 'string', maxLength: 32 },
          tags:            { type: 'array', items: { type: 'string' } },
          meta:            { type: 'object' },
        },
      },
    },
    handler: async (request, reply) => {
      const body = request.body as {
        deviceKey: string; name: string; kind: string;
        firmwareVersion?: string; tags?: string[]; meta?: Record<string, unknown>;
      };
      const tenantId = request.tenant.id;

      // Issue a one-time plain token — returned once, never stored in plain text
      const plainToken = randomBytes(32).toString('hex');
      const tokenHash  = hashToken(plainToken);

      const result = await core.db.execute({
        sql: `
          INSERT INTO iot_devices
            (tenant_id, device_key, name, kind, token_hash,
             firmware_version, tags, meta)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          RETURNING id, tenant_id, device_key, name, kind,
                    firmware_version, tags, meta, status, created_at
        `,
        params: [
          tenantId, body.deviceKey, body.name, body.kind, tokenHash,
          body.firmwareVersion ?? null,
          JSON.stringify(body.tags ?? []),
          JSON.stringify(body.meta ?? {}),
        ],
      });

      const device = result.rows[0];

      await core.events.emit(IOT_EVENTS.DEVICE_REGISTERED, {
        tenantId, deviceId: device.id as string,
        deviceKey: device.device_key as string, kind: device.kind as string,
      });

      await core.audit.log({
        action: 'iot.device.registered', tenantId, actorId: request.user.id,
        resourceId: device.id as string,
        meta: { deviceKey: body.deviceKey, kind: body.kind },
      });

      // plainToken ONLY returned at registration — instructs device to store it
      return reply.status(201).send({ device, token: plainToken });
    },
  });

  // ── UPDATE ────────────────────────────────────────────────────────────────
  server.patch<{ Params: { id: string } }>('/api/iot/devices/:id', {
    preHandler: [server.authenticate, server.requireCapability(IOT_CAPABILITIES.DEVICES_MANAGE)],
    schema: {
      body: {
        type: 'object',
        properties: {
          name:            { type: 'string' },
          firmwareVersion: { type: 'string' },
          tags:            { type: 'array', items: { type: 'string' } },
          meta:            { type: 'object' },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const body = request.body as Record<string, unknown>;
      const tenantId = request.tenant.id;

      const fieldMap: Record<string, string> = {
        name: 'name', firmwareVersion: 'firmware_version', tags: 'tags', meta: 'meta',
      };
      const setClauses: string[] = ['updated_at = NOW()'];
      const params: unknown[] = [];

      for (const [jsKey, col] of Object.entries(fieldMap)) {
        if (jsKey in body) {
          const val = (jsKey === 'tags' || jsKey === 'meta') ? JSON.stringify(body[jsKey]) : body[jsKey];
          params.push(val);
          setClauses.push(`${col} = $${params.length}`);
        }
      }

      params.push(id, tenantId);
      const result = await core.db.execute({
        sql: `UPDATE iot_devices SET ${setClauses.join(', ')}
              WHERE id = $${params.length - 1} AND tenant_id = $${params.length}
              RETURNING *`,
        params,
      });

      if (result.rows.length === 0) return reply.status(404).send({ error: 'Device not found' });
      await core.events.emit(IOT_EVENTS.DEVICE_UPDATED, {
        tenantId, deviceId: id,
        deviceKey: result.rows[0].device_key as string, kind: result.rows[0].kind as string,
      });
      return reply.send({ device: result.rows[0] });
    },
  });

  // ── DELETE ────────────────────────────────────────────────────────────────
  server.delete<{ Params: { id: string } }>('/api/iot/devices/:id', {
    preHandler: [server.authenticate, server.requireCapability(IOT_CAPABILITIES.DEVICES_MANAGE)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;
      await core.db.execute({
        sql: `DELETE FROM iot_devices WHERE id = $1 AND tenant_id = $2`,
        params: [id, tenantId],
      });
      await core.events.emit(IOT_EVENTS.DEVICE_DELETED, {
        tenantId, deviceId: id, deviceKey: '', kind: '',
      });
      await core.audit.log({
        action: 'iot.device.deleted', tenantId,
        actorId: request.user.id, resourceId: id, meta: {},
      });
      return reply.status(204).send();
    },
  });

  // ── ROTATE TOKEN ──────────────────────────────────────────────────────────
  server.post<{ Params: { id: string } }>('/api/iot/devices/:id/rotate-token', {
    preHandler: [server.authenticate, server.requireCapability(IOT_CAPABILITIES.DEVICES_MANAGE)],
    handler: async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.tenant.id;

      const plainToken = randomBytes(32).toString('hex');
      const tokenHash  = hashToken(plainToken);

      const result = await core.db.execute({
        sql: `UPDATE iot_devices SET token_hash = $1, updated_at = NOW()
              WHERE id = $2 AND tenant_id = $3 RETURNING id`,
        params: [tokenHash, id, tenantId],
      });

      if (result.rows.length === 0) return reply.status(404).send({ error: 'Device not found' });

      await core.audit.log({
        action: 'iot.device.token_rotated', tenantId,
        actorId: request.user.id, resourceId: id, meta: {},
      });

      return reply.send({ token: plainToken, note: 'Store this token securely — it will not be shown again.' });
    },
  });
}
