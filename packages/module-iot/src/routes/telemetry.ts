/**
 * Telemetry Ingest + Query
 *
 * POST /api/iot/ingest          – device posts metrics (auth via device token)
 * GET  /api/iot/telemetry       – query stored telemetry (dashboard auth)
 * GET  /api/iot/telemetry/latest – latest reading per device
 *
 * POST /api/iot/commands        – queue a command for a device
 * GET  /api/iot/commands        – list pending commands for a device
 * POST /api/iot/commands/:id/ack – device acknowledges receipt
 *
 * POST /api/iot/alerts          – create an alert threshold rule
 * GET  /api/iot/alerts          – list alerts
 */

import type { FastifyInstance } from 'fastify';
import type { ZexCoreContext } from '@zexcore/core';
import { IOT_CAPABILITIES } from '../permissions.js';
import { IOT_EVENTS } from '../events.js';
import { createHash } from 'node:crypto';

function hashToken(t: string) { return createHash('sha256').update(t).digest('hex'); }

// ─── Internal: resolve device by token ────────────────────────────────────────

async function resolveDevice(
  core: ZexCoreContext,
  tenantId: string,
  rawToken: string,
): Promise<{ id: string; device_key: string; kind: string } | null> {
  const hash = hashToken(rawToken);
  const r = await core.db.execute({
    sql: `SELECT id, device_key, kind FROM iot_devices
          WHERE tenant_id = $1 AND token_hash = $2 LIMIT 1`,
    params: [tenantId, hash],
  });
  return r.rows.length > 0 ? r.rows[0] as { id: string; device_key: string; kind: string } : null;
}

export function registerTelemetryRoutes(server: FastifyInstance, core: ZexCoreContext): void {

  // ═══════════════════════════════════════════════════════════════════════════
  // TELEMETRY
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * POST /api/iot/ingest
   * Called by devices. Uses X-Device-Token header instead of JWT.
   * No user session — the device authenticates with its secret token.
   */
  server.post('/api/iot/ingest', {
    schema: {
      headers: {
        type: 'object',
        required: ['x-tenant-id', 'x-device-token'],
        properties: {
          'x-tenant-id':    { type: 'string', format: 'uuid' },
          'x-device-token': { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['metrics'],
        properties: {
          metrics:    { type: 'object' },   // { temperature: 25.4, humidity: 60, ... }
          recordedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    handler: async (request, reply) => {
      const headers  = request.headers as Record<string, string | undefined>;
      const tenantId = headers['x-tenant-id'];
      const rawToken = headers['x-device-token'];

      if (!tenantId || !rawToken) {
        return reply.status(401).send({ error: 'Missing x-tenant-id or x-device-token' });
      }

      const device = await resolveDevice(core, tenantId, rawToken);
      if (!device) {
        return reply.status(401).send({ error: 'Invalid device token' });
      }

      const body = request.body as { metrics: Record<string, unknown>; recordedAt?: string };
      const recordedAt = body.recordedAt ?? new Date().toISOString();

      // Validate metrics: all values must be scalar
      for (const [key, val] of Object.entries(body.metrics)) {
        if (typeof val !== 'number' && typeof val !== 'string' && typeof val !== 'boolean') {
          return reply.status(400).send({ error: `Metric '${key}' must be a scalar value` });
        }
      }

      await core.db.execute({
        sql: `
          INSERT INTO iot_telemetry (tenant_id, device_id, metrics, recorded_at)
          VALUES ($1, $2, $3, $4)
        `,
        params: [tenantId, device.id, JSON.stringify(body.metrics), recordedAt],
      });

      // Update device last_seen + mark online
      await core.db.execute({
        sql: `UPDATE iot_devices SET last_seen_at = NOW(), status = 'online', updated_at = NOW()
              WHERE id = $1`,
        params: [device.id],
      });

      await core.events.emit(IOT_EVENTS.TELEMETRY_RECEIVED, {
        tenantId, deviceId: device.id, metrics: body.metrics, recordedAt,
      });

      // Check alert thresholds (fire-and-forget, non-blocking)
      void checkAlerts(core, tenantId, device.id, body.metrics as Record<string, number>);

      return reply.status(202).send({ accepted: true });
    },
  });

  /** GET /api/iot/telemetry — query telemetry (dashboard users) */
  server.get('/api/iot/telemetry', {
    preHandler: [server.authenticate, server.requireCapability(IOT_CAPABILITIES.TELEMETRY_READ)],
    schema: {
      querystring: {
        type: 'object',
        required: ['deviceId'],
        properties: {
          deviceId: { type: 'string', format: 'uuid' },
          from:     { type: 'string', format: 'date-time' },
          to:       { type: 'string', format: 'date-time' },
          limit:    { type: 'integer', default: 200, maximum: 1000 },
        },
      },
    },
    handler: async (request, reply) => {
      const { deviceId, from, to, limit = 200 } = request.query as {
        deviceId: string; from?: string; to?: string; limit?: number;
      };
      const tenantId = request.tenant.id;

      let q = `SELECT id, device_id, metrics, recorded_at, ingested_at
               FROM iot_telemetry WHERE tenant_id = $1 AND device_id = $2`;
      const params: unknown[] = [tenantId, deviceId];

      if (from) { params.push(from); q += ` AND recorded_at >= $${params.length}`; }
      if (to)   { params.push(to);   q += ` AND recorded_at <= $${params.length}`; }

      params.push(limit);
      q += ` ORDER BY recorded_at DESC LIMIT $${params.length}`;

      const result = await core.db.execute({ sql: q, params });
      return reply.send({ telemetry: result.rows });
    },
  });

  /** GET /api/iot/telemetry/latest — most recent reading per device */
  server.get('/api/iot/telemetry/latest', {
    preHandler: [server.authenticate, server.requireCapability(IOT_CAPABILITIES.TELEMETRY_READ)],
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const result = await core.db.execute({
        sql: `
          SELECT DISTINCT ON (device_id) device_id, metrics, recorded_at
          FROM iot_telemetry
          WHERE tenant_id = $1
          ORDER BY device_id, recorded_at DESC
        `,
        params: [tenantId],
      });
      return reply.send({ latest: result.rows });
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════

  /** POST /api/iot/commands — queue a command for a device */
  server.post('/api/iot/commands', {
    preHandler: [server.authenticate, server.requireCapability(IOT_CAPABILITIES.COMMANDS_SEND)],
    schema: {
      body: {
        type: 'object',
        required: ['deviceId', 'command'],
        properties: {
          deviceId:  { type: 'string', format: 'uuid' },
          command:   { type: 'string', maxLength: 64 },   // e.g. 'reboot', 'set_interval'
          payload:   { type: 'object' },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    handler: async (request, reply) => {
      const body = request.body as {
        deviceId: string; command: string;
        payload?: Record<string, unknown>; expiresAt?: string;
      };
      const tenantId = request.tenant.id;

      // Guard: device must belong to this tenant
      const check = await core.db.execute({
        sql: `SELECT id FROM iot_devices WHERE id = $1 AND tenant_id = $2`,
        params: [body.deviceId, tenantId],
      });
      if (check.rows.length === 0) {
        return reply.status(400).send({ error: 'Device not found in this workspace' });
      }

      const result = await core.db.execute({
        sql: `INSERT INTO iot_commands
                (tenant_id, device_id, command, payload, expires_at, queued_by)
              VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        params: [
          tenantId, body.deviceId, body.command,
          JSON.stringify(body.payload ?? {}),
          body.expiresAt ?? null,
          request.user.id,
        ],
      });

      await core.events.emit(IOT_EVENTS.COMMAND_QUEUED, {
        tenantId, deviceId: body.deviceId,
        commandId: result.rows[0].id as string, command: body.command,
      });

      return reply.status(201).send({ command: result.rows[0] });
    },
  });

  /** GET /api/iot/commands — poll pending commands (by device token) */
  server.get('/api/iot/commands', {
    schema: {
      headers: {
        type: 'object',
        required: ['x-tenant-id', 'x-device-token'],
        properties: {
          'x-tenant-id':    { type: 'string', format: 'uuid' },
          'x-device-token': { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const headers  = request.headers as Record<string, string | undefined>;
      const tenantId = headers['x-tenant-id'];
      const rawToken = headers['x-device-token'];

      if (!tenantId || !rawToken) {
        return reply.status(401).send({ error: 'Missing x-tenant-id or x-device-token' });
      }

      const device = await resolveDevice(core, tenantId, rawToken);
      if (!device) return reply.status(401).send({ error: 'Invalid device token' });

      const result = await core.db.execute({
        sql: `SELECT id, command, payload, expires_at, created_at
              FROM iot_commands
              WHERE tenant_id = $1 AND device_id = $2
                AND delivered_at IS NULL
                AND (expires_at IS NULL OR expires_at > NOW())
              ORDER BY created_at ASC LIMIT 10`,
        params: [tenantId, device.id],
      });

      return reply.send({ commands: result.rows });
    },
  });

  /** POST /api/iot/commands/:id/ack — device acknowledges a command */
  server.post<{ Params: { id: string } }>('/api/iot/commands/:id/ack', {
    schema: {
      headers: {
        type: 'object',
        required: ['x-tenant-id', 'x-device-token'],
        properties: {
          'x-tenant-id':    { type: 'string', format: 'uuid' },
          'x-device-token': { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          success: { type: 'boolean', default: true },
          error:   { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const headers  = request.headers as Record<string, string | undefined>;
      const tenantId = headers['x-tenant-id'];
      const rawToken = headers['x-device-token'];
      const body     = request.body as { success?: boolean; error?: string };

      if (!tenantId || !rawToken) {
        return reply.status(401).send({ error: 'Missing x-tenant-id or x-device-token' });
      }

      const device = await resolveDevice(core, tenantId, rawToken);
      if (!device) return reply.status(401).send({ error: 'Invalid device token' });

      await core.db.execute({
        sql: `UPDATE iot_commands SET delivered_at = NOW(), updated_at = NOW()
              WHERE id = $1 AND device_id = $2 AND tenant_id = $3`,
        params: [id, device.id, tenantId],
      });

      const event = (body.success ?? true) ? IOT_EVENTS.COMMAND_DELIVERED : IOT_EVENTS.COMMAND_FAILED;
      await core.events.emit(event, { tenantId, deviceId: device.id, commandId: id });

      return reply.status(204).send();
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ALERT THRESHOLDS
  // ═══════════════════════════════════════════════════════════════════════════

  /** POST /api/iot/alerts — configure a threshold alert */
  server.post('/api/iot/alerts', {
    preHandler: [server.authenticate, server.requireCapability(IOT_CAPABILITIES.ALERTS_MANAGE)],
    schema: {
      body: {
        type: 'object',
        required: ['deviceId', 'metric', 'op', 'threshold', 'severity'],
        properties: {
          deviceId:  { type: 'string', format: 'uuid' },
          metric:    { type: 'string', maxLength: 64 },
          op:        { type: 'string', enum: ['gt', 'gte', 'lt', 'lte', 'eq'] },
          threshold: { type: 'number' },
          severity:  { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          message:   { type: 'string', maxLength: 255 },
        },
      },
    },
    handler: async (request, reply) => {
      const body = request.body as {
        deviceId: string; metric: string; op: string;
        threshold: number; severity: string; message?: string;
      };
      const tenantId = request.tenant.id;

      const result = await core.db.execute({
        sql: `INSERT INTO iot_alert_rules
                (tenant_id, device_id, metric, op, threshold, severity, message)
              VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        params: [
          tenantId, body.deviceId, body.metric,
          body.op, body.threshold, body.severity,
          body.message ?? null,
        ],
      });

      return reply.status(201).send({ alert: result.rows[0] });
    },
  });

  server.get('/api/iot/alerts', {
    preHandler: [server.authenticate, server.requireCapability(IOT_CAPABILITIES.ALERTS_READ)],
    handler: async (request, reply) => {
      const tenantId = request.tenant.id;
      const result = await core.db.execute({
        sql: `SELECT * FROM iot_alert_rules WHERE tenant_id = $1 ORDER BY created_at DESC`,
        params: [tenantId],
      });
      return reply.send({ alerts: result.rows });
    },
  });
}

// ─── Alert threshold checker (called after every telemetry ingest) ─────────────

async function checkAlerts(
  core: ZexCoreContext,
  tenantId: string,
  deviceId: string,
  metrics: Record<string, number>,
): Promise<void> {
  try {
    const rules = await core.db.execute({
      sql: `SELECT * FROM iot_alert_rules
            WHERE tenant_id = $1 AND device_id = $2 AND enabled = TRUE`,
      params: [tenantId, deviceId],
    });

    for (const rule of rules.rows) {
      const actual = metrics[rule.metric as string];
      if (actual === undefined) continue;

      const threshold = rule.threshold as number;
      let triggered = false;

      switch (rule.op as string) {
        case 'gt':  triggered = actual >  threshold; break;
        case 'gte': triggered = actual >= threshold; break;
        case 'lt':  triggered = actual <  threshold; break;
        case 'lte': triggered = actual <= threshold; break;
        case 'eq':  triggered = actual === threshold; break;
      }

      if (triggered) {
        // Insert an alert event record
        const alertResult = await core.db.execute({
          sql: `INSERT INTO iot_alert_events
                  (tenant_id, device_id, alert_rule_id, metric, actual_value, threshold, severity)
                VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
          params: [
            tenantId, deviceId, rule.id as string,
            rule.metric, actual, threshold, rule.severity,
          ],
        });

        await core.events.emit(IOT_EVENTS.ALERT_TRIGGERED, {
          tenantId,
          alertId:     alertResult.rows[0].id as string,
          deviceId,
          metric:      rule.metric as string,
          actualValue: actual,
          threshold,
          severity:    rule.severity as string,
        });
      }
    }
  } catch (err) {
    core.logger.error({ err }, '[iot] Alert check failed');
  }
}
