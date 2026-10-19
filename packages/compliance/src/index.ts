import type { ZexModule, ZexCoreContext } from '@zexcore/core';
import type { FastifyInstance } from 'fastify';
import { complianceCapabilityDefinitions } from './permissions.js';
import { registerConsentRoutes } from './routes/consent.js';
import { registerErasureRoutes } from './routes/erasure.js';
import { registerExportRoutes } from './routes/export.js';
import { registerRetentionRoutes } from './routes/retention.js';
import { registerAccessLogRoutes } from './routes/access.js';
import { applyRlsToTable, sql } from '@zexcore/core';

export * from './crypto/cipher.js';
export * from './schema/compliance.js';
export * from './permissions.js';
export * from './events.js';
export * from './licensing/licenseEngine.js';

export const complianceModule: ZexModule = {
  name: 'compliance',
  version: '1.0.0',
  description: 'GDPR/NDPR Compliance Suite: Consent tracking, Right-to-be-Forgotten erasure, data portability exports, and retention policies',
  permissions: complianceCapabilityDefinitions,

  async onInit(core: ZexCoreContext): Promise<void> {
    // ── compliance_consents ───────────────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS compliance_consents (
          id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          subject_id  VARCHAR(128) NOT NULL,
          purpose     VARCHAR(128) NOT NULL,
          legal_basis VARCHAR(32) NOT NULL DEFAULT 'consent',
          granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          revoked_at  TIMESTAMPTZ,
          ip_address  VARCHAR(64),
          user_agent  TEXT,
          meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
          CONSTRAINT compliance_consents_unique UNIQUE (tenant_id, subject_id, purpose)
        );
        CREATE INDEX IF NOT EXISTS compliance_consents_tenant_idx ON compliance_consents(tenant_id);
        CREATE INDEX IF NOT EXISTS compliance_consents_subject_idx ON compliance_consents(tenant_id, subject_id);
      `),
    );
    await applyRlsToTable('compliance_consents');

    // ── compliance_erasure_requests ──────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS compliance_erasure_requests (
          id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          subject_id       VARCHAR(128) NOT NULL,
          requested_by     UUID NOT NULL,
          status           VARCHAR(16) NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
          rejection_reason TEXT,
          anonymized_count INTEGER NOT NULL DEFAULT 0,
          requested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          completed_at     TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS compliance_erasure_tenant_idx ON compliance_erasure_requests(tenant_id);
        CREATE INDEX IF NOT EXISTS compliance_erasure_status_idx ON compliance_erasure_requests(tenant_id, status);
      `),
    );
    await applyRlsToTable('compliance_erasure_requests');

    // ── compliance_data_exports ──────────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS compliance_data_exports (
          id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          subject_id     VARCHAR(128) NOT NULL,
          requested_by   UUID NOT NULL,
          status         VARCHAR(16) NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'ready', 'expired')),
          bundle_payload JSONB,
          expires_at     TIMESTAMPTZ NOT NULL,
          created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS compliance_exports_tenant_idx ON compliance_data_exports(tenant_id);
        CREATE INDEX IF NOT EXISTS compliance_exports_expires_idx ON compliance_data_exports(tenant_id, expires_at);
      `),
    );
    await applyRlsToTable('compliance_data_exports');

    // ── compliance_retention_policies ────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS compliance_retention_policies (
          id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          entity         VARCHAR(64) NOT NULL,
          retention_days INTEGER NOT NULL DEFAULT 365,
          action         VARCHAR(16) NOT NULL DEFAULT 'hard_delete'
                           CHECK (action IN ('anonymize', 'hard_delete')),
          enabled        BOOLEAN NOT NULL DEFAULT TRUE,
          last_run_at    TIMESTAMPTZ,
          updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT compliance_retention_unique UNIQUE (tenant_id, entity)
        );
        CREATE INDEX IF NOT EXISTS compliance_retention_tenant_idx ON compliance_retention_policies(tenant_id);
      `),
    );
    await applyRlsToTable('compliance_retention_policies');

    // ── compliance_access_logs ───────────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS compliance_access_logs (
          id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          actor_id    UUID NOT NULL,
          subject_id  VARCHAR(128) NOT NULL,
          entity      VARCHAR(64) NOT NULL,
          action      VARCHAR(16) NOT NULL
                        CHECK (action IN ('read', 'export', 'update', 'delete')),
          fields      JSONB NOT NULL DEFAULT '[]'::jsonb,
          accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS compliance_access_logs_tenant_idx ON compliance_access_logs(tenant_id);
        CREATE INDEX IF NOT EXISTS compliance_access_logs_subject_idx ON compliance_access_logs(tenant_id, subject_id);
        CREATE INDEX IF NOT EXISTS compliance_access_logs_time_idx ON compliance_access_logs(tenant_id, accessed_at DESC);
      `),
    );
    await applyRlsToTable('compliance_access_logs');

    core.logger.info('[compliance] Tables & RLS initialised');
  },

  async registerRoutes(server: FastifyInstance, core: ZexCoreContext): Promise<void> {
    registerConsentRoutes(server, core);
    registerErasureRoutes(server, core);
    registerExportRoutes(server, core);
    registerRetentionRoutes(server, core);
    registerAccessLogRoutes(server, core);
  },
};

export default complianceModule;
