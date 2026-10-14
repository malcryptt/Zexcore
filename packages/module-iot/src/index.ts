import type { ZexModule, ZexCoreContext } from '@zexcore/core';
import type { FastifyInstance } from 'fastify';
import { iotCapabilityDefinitions } from './permissions.js';
import { registerDeviceRoutes } from './routes/devices.js';
import { registerTelemetryRoutes } from './routes/telemetry.js';
import { applyRlsToTable, sql } from '@zexcore/core';

export * from './schema/devices.js';
export * from './permissions.js';
export * from './events.js';

export const iotModule: ZexModule = {
  name: 'iot',
  version: '1.0.0',
  description: 'Internet of Things: device registration, secure token telemetry ingest, command queuing, and metric alerts',
  permissions: iotCapabilityDefinitions,

  async onInit(core: ZexCoreContext): Promise<void> {
    // ── iot_devices ──────────────────────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS iot_devices (
          id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          device_key       VARCHAR(64) NOT NULL,
          name             VARCHAR(128) NOT NULL,
          kind             VARCHAR(64) NOT NULL,
          token_hash       VARCHAR(64) NOT NULL,
          status           VARCHAR(16) NOT NULL DEFAULT 'unknown'
                             CHECK (status IN ('online', 'offline', 'unknown')),
          firmware_version VARCHAR(32),
          tags             JSONB NOT NULL DEFAULT '[]'::jsonb,
          meta             JSONB NOT NULL DEFAULT '{}'::jsonb,
          last_seen_at     TIMESTAMPTZ,
          created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT iot_devices_tenant_key_unique UNIQUE (tenant_id, device_key),
          CONSTRAINT iot_devices_composite_pk UNIQUE (tenant_id, id)
        );
        CREATE INDEX IF NOT EXISTS iot_devices_tenant_idx ON iot_devices(tenant_id);
        CREATE INDEX IF NOT EXISTS iot_devices_status_idx ON iot_devices(tenant_id, status);
        CREATE INDEX IF NOT EXISTS iot_devices_token_hash_idx ON iot_devices(tenant_id, token_hash);
      `),
    );
    await applyRlsToTable('iot_devices');

    // ── iot_telemetry ────────────────────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS iot_telemetry (
          id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          device_id   UUID NOT NULL,
          metrics     JSONB NOT NULL DEFAULT '{}'::jsonb,
          recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT iot_telemetry_device_fk FOREIGN KEY (tenant_id, device_id)
            REFERENCES iot_devices(tenant_id, id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS iot_telemetry_device_time_idx ON iot_telemetry(tenant_id, device_id, recorded_at DESC);
        CREATE INDEX IF NOT EXISTS iot_telemetry_time_idx ON iot_telemetry(tenant_id, recorded_at DESC);
      `),
    );
    await applyRlsToTable('iot_telemetry');

    // ── iot_commands ─────────────────────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS iot_commands (
          id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          device_id  UUID NOT NULL,
          command    VARCHAR(64) NOT NULL,
          payload    JSONB NOT NULL DEFAULT '{}'::jsonb,
          status     VARCHAR(16) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'delivered', 'acknowledged', 'failed')),
          sent_at    TIMESTAMPTZ,
          acked_at   TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT iot_commands_device_fk FOREIGN KEY (tenant_id, device_id)
            REFERENCES iot_devices(tenant_id, id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS iot_commands_device_status_idx ON iot_commands(tenant_id, device_id, status);
        CREATE INDEX IF NOT EXISTS iot_commands_created_idx ON iot_commands(tenant_id, created_at DESC);
      `),
    );
    await applyRlsToTable('iot_commands');

    // ── iot_alert_rules ──────────────────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS iot_alert_rules (
          id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          device_id         UUID,
          metric            VARCHAR(64) NOT NULL,
          op                VARCHAR(8) NOT NULL CHECK (op IN ('gt', 'lt', 'eq', 'gte', 'lte', 'neq')),
          threshold         DOUBLE PRECISION NOT NULL,
          severity          VARCHAR(16) NOT NULL DEFAULT 'medium'
                              CHECK (severity IN ('low', 'medium', 'high', 'critical')),
          message           VARCHAR(255),
          enabled           BOOLEAN NOT NULL DEFAULT TRUE,
          created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT iot_alert_rules_composite_pk UNIQUE (tenant_id, id),
          CONSTRAINT iot_alert_rules_device_fk FOREIGN KEY (tenant_id, device_id)
            REFERENCES iot_devices(tenant_id, id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS iot_alert_rules_metric_idx ON iot_alert_rules(tenant_id, metric);
      `),
    );
    await applyRlsToTable('iot_alert_rules');

    // ── iot_alert_events ─────────────────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS iot_alert_events (
          id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          device_id      UUID NOT NULL,
          alert_rule_id  UUID,
          metric         VARCHAR(64) NOT NULL,
          actual_value   DOUBLE PRECISION NOT NULL,
          threshold      DOUBLE PRECISION NOT NULL,
          severity       VARCHAR(16) NOT NULL,
          triggered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT iot_alert_events_device_fk FOREIGN KEY (tenant_id, device_id)
            REFERENCES iot_devices(tenant_id, id) ON DELETE CASCADE,
          CONSTRAINT iot_alert_events_rule_fk FOREIGN KEY (tenant_id, alert_rule_id)
            REFERENCES iot_alert_rules(tenant_id, id) ON DELETE SET NULL
        );
        CREATE INDEX IF NOT EXISTS iot_alert_events_tenant_idx ON iot_alert_events(tenant_id, triggered_at DESC);
      `),
    );
    await applyRlsToTable('iot_alert_events');

    core.logger.info('[iot] Tables & RLS initialised');
  },

  async registerRoutes(server: FastifyInstance, core: ZexCoreContext): Promise<void> {
    registerDeviceRoutes(server, core);
    registerTelemetryRoutes(server, core);
  },
};

export default iotModule;
