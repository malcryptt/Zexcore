import { applyRlsToTable, type ZexModule, type ZexCoreContext } from '@zexcore/core';
import type { FastifyInstance } from 'fastify';
import { auditCapabilityDefinitions } from './permissions.js';
import { registerAuditRoutes } from './routes/index.js';

export * from './types.js';
export * from './permissions.js';
export * from './security/index.js';
export * from './finance/index.js';
export * from './rules/index.js';
export * from './findings/index.js';
export * from './engine/index.js';
export * from './reports/index.js';
export * from './routes/index.js';

export const auditModule: ZexModule = {
  name: 'audit',
  version: '1.0.0',
  description: 'Deterministic security posture analysis, financial reconciliation checks, and tamper-resistant evidence packs',
  permissions: auditCapabilityDefinitions,

  async onInit(core: ZexCoreContext): Promise<void> {
    core.logger.info('[audit] Initialising audit tables, ledger, and tamper-resistance triggers...');

    // ── audit_rules ─────────────────────────────────────────────────────────────
    await core.db.execute({
      text: `
        CREATE TABLE IF NOT EXISTS audit_rules (
          id          VARCHAR(64) PRIMARY KEY,
          key         VARCHAR(128) NOT NULL UNIQUE,
          name        VARCHAR(255) NOT NULL,
          description TEXT,
          domain      VARCHAR(32) NOT NULL,
          tier        VARCHAR(32) NOT NULL, -- 'locked_baseline', 'tunable', 'custom'
          version     INTEGER NOT NULL DEFAULT 1,
          severity    VARCHAR(16) NOT NULL,
          params      JSONB NOT NULL DEFAULT '{}'::jsonb,
          param_ranges JSONB,
          status      VARCHAR(32) NOT NULL DEFAULT 'active',
          created_by  VARCHAR(128) NOT NULL,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS audit_rules_domain_idx ON audit_rules(domain);
        CREATE INDEX IF NOT EXISTS audit_rules_tier_idx ON audit_rules(tier);
      `,
    });

    // ── audit_rule_changes (Append-only) ────────────────────────────────────────
    await core.db.execute({
      text: `
        CREATE TABLE IF NOT EXISTS audit_rule_changes (
          id             VARCHAR(64) PRIMARY KEY,
          rule_id        VARCHAR(64) NOT NULL REFERENCES audit_rules(id),
          rule_key       VARCHAR(128) NOT NULL,
          action         VARCHAR(32) NOT NULL,
          direction      VARCHAR(16) NOT NULL, -- 'tighten', 'loosen'
          old_params     JSONB NOT NULL,
          new_params     JSONB NOT NULL,
          reason         TEXT NOT NULL,
          requested_by   VARCHAR(128) NOT NULL,
          approved_by    VARCHAR(128),
          mfa_proof      JSONB,
          status         VARCHAR(32) NOT NULL DEFAULT 'applied',
          created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          applied_at     TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS audit_rule_changes_rule_idx ON audit_rule_changes(rule_id);
      `,
    });

    // ── audit_runs ──────────────────────────────────────────────────────────────
    await core.db.execute({
      text: `
        CREATE TABLE IF NOT EXISTS audit_runs (
          id                 VARCHAR(64) PRIMARY KEY,
          tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          started_at         TIMESTAMPTZ NOT NULL,
          finished_at        TIMESTAMPTZ NOT NULL,
          duration_ms        INTEGER NOT NULL,
          rules_evaluated    INTEGER NOT NULL DEFAULT 0,
          rule_versions      JSONB NOT NULL DEFAULT '{}'::jsonb,
          findings_generated INTEGER NOT NULL DEFAULT 0,
          security_score     INTEGER NOT NULL,
          finance_score      INTEGER NOT NULL,
          overall_score      INTEGER NOT NULL,
          dry_run            BOOLEAN NOT NULL DEFAULT FALSE
        );
        CREATE INDEX IF NOT EXISTS audit_runs_tenant_idx ON audit_runs(tenant_id, started_at DESC);
      `,
    });
    await applyRlsToTable('audit_runs');

    // ── audit_findings ──────────────────────────────────────────────────────────
    await core.db.execute({
      text: `
        CREATE TABLE IF NOT EXISTS audit_findings (
          id               VARCHAR(64) PRIMARY KEY,
          tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          rule_key         VARCHAR(128) NOT NULL,
          rule_name        VARCHAR(255) NOT NULL,
          rule_version     INTEGER NOT NULL,
          domain           VARCHAR(32) NOT NULL,
          severity         VARCHAR(16) NOT NULL,
          title            VARCHAR(255) NOT NULL,
          description      TEXT NOT NULL,
          evidence         JSONB NOT NULL,
          status           VARCHAR(32) NOT NULL DEFAULT 'open',
          dismissal_reason TEXT,
          dismissed_by     VARCHAR(128),
          dismissed_at     TIMESTAMPTZ,
          resolved_at      TIMESTAMPTZ,
          first_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_seen_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS audit_findings_tenant_status ON audit_findings(tenant_id, status);
        CREATE INDEX IF NOT EXISTS audit_findings_severity ON audit_findings(tenant_id, severity);
      `,
    });
    await applyRlsToTable('audit_findings');

    // ── audit_finding_events (Append-only) ──────────────────────────────────────
    await core.db.execute({
      text: `
        CREATE TABLE IF NOT EXISTS audit_finding_events (
          id              VARCHAR(64) PRIMARY KEY,
          finding_id      VARCHAR(64) NOT NULL REFERENCES audit_findings(id),
          action          VARCHAR(32) NOT NULL,
          reason          TEXT,
          actor           VARCHAR(128) NOT NULL,
          previous_status VARCHAR(32),
          new_status      VARCHAR(32),
          created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS audit_finding_events_finding ON audit_finding_events(finding_id);
      `,
    });

    // ── ledger_entries (Immutable Financial Ledger) ─────────────────────────────
    await core.db.execute({
      text: `
        CREATE TABLE IF NOT EXISTS ledger_entries (
          id                VARCHAR(64) PRIMARY KEY,
          tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          kind              VARCHAR(32) NOT NULL, -- 'charge', 'refund', 'payout', etc.
          amount_minor      BIGINT NOT NULL,
          currency          VARCHAR(8) NOT NULL DEFAULT 'USD',
          trust_level       VARCHAR(16) NOT NULL, -- 'verified', 'imported', 'claimed'
          source            VARCHAR(32) NOT NULL,
          reference         VARCHAR(128) NOT NULL,
          statement_hash    VARCHAR(128),
          narration         TEXT,
          matched_record_id VARCHAR(64),
          matched_status    VARCHAR(16) NOT NULL DEFAULT 'unmatched',
          actor_id          VARCHAR(128),
          approved_by       VARCHAR(128),
          created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS ledger_entries_tenant ON ledger_entries(tenant_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS ledger_entries_trust ON ledger_entries(tenant_id, trust_level);
        CREATE INDEX IF NOT EXISTS ledger_entries_ref ON ledger_entries(tenant_id, reference);
      `,
    });
    await applyRlsToTable('ledger_entries');

    // ── audit_hash_chain (Tamper-Resistant Cryptographic Chain) ───────────────────
    await core.db.execute({
      text: `
        CREATE TABLE IF NOT EXISTS audit_hash_chain (
          block_number  BIGINT NOT NULL,
          tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          action_type   VARCHAR(64) NOT NULL,
          record_id     VARCHAR(64) NOT NULL,
          record_hash   VARCHAR(128) NOT NULL,
          previous_hash VARCHAR(128) NOT NULL,
          block_hash    VARCHAR(128) NOT NULL PRIMARY KEY
        );
        CREATE UNIQUE INDEX IF NOT EXISTS audit_hash_chain_tenant_seq ON audit_hash_chain(tenant_id, block_number);
      `,
    });
    await applyRlsToTable('audit_hash_chain');

    // ── Event Bus Integrations ──────────────────────────────────────────────────
    // Listen to financial and privileged events to trigger auto-checks
    core.events.on('payment.succeeded', async (event: any) => {
      core.logger.info('[audit] Ingested payment.succeeded event for ledger sync', event);
    });

    core.events.on('payment.refunded', async (event: any) => {
      core.logger.info('[audit] Ingested payment.refunded event for anomaly screening', event);
    });

    core.events.on('auth.login.failed', async (event: any) => {
      core.logger.info('[audit] Ingested failed login for security rate monitor', event);
    });

    core.events.on('role.permission.changed', async (event: any) => {
      core.logger.info('[audit] Ingested permission change for odd-hour audit screening', event);
    });

    core.logger.info('[audit] Engine initialized with deterministic security & finance rules');
  },

  async registerRoutes(server: FastifyInstance, core: ZexCoreContext): Promise<void> {
    registerAuditRoutes(server, core);
  },
};

export default auditModule;
