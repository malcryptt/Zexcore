/**
 * @zexcore/rules — module entry point
 *
 * Implements ZexModule so it can be registered into the module registry
 * exactly like module-cms and module-crm.
 */

import type { ZexModule, ZexCoreContext } from '@zexcore/core';
import type { FastifyInstance } from 'fastify';
import { applyRlsToTable, sql } from '@zexcore/core';
import { registerRulesRoutes } from './routes/rules.js';
import { RuleRunner } from './runner/runner.js';

export * from './schema/rule.js';
export * from './evaluator/conditions.js';
export * from './executor/actions.js';
export * from './runner/runner.js';

export const RULES_CAPABILITIES = {
  READ:    'rules:read',
  MANAGE:  'rules:manage',
  APPROVE: 'rules:approve',
} as const;

const rulesCapabilityDefinitions = [
  { name: RULES_CAPABILITIES.READ,    description: 'View automation rules',                                  module: 'rules' },
  { name: RULES_CAPABILITIES.MANAGE,  description: 'Create, edit, and delete automation rules',              module: 'rules' },
  { name: RULES_CAPABILITIES.APPROVE, description: 'Approve draft rules to allow them to execute',           module: 'rules' },
];

// Singleton runner — shared across all tenants, isolation enforced inside
let runner: RuleRunner | null = null;

export const rulesModule: ZexModule = {
  name:        'rules',
  version:     '1.0.0',
  description: 'Deterministic automation rules engine — no eval, human-approved before execution',
  permissions: rulesCapabilityDefinitions,

  async onInit(core: ZexCoreContext): Promise<void> {
    // ── Create the rules table ───────────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS rules (
          id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          name         VARCHAR(128) NOT NULL,
          description  TEXT,
          enabled      BOOLEAN NOT NULL DEFAULT TRUE,

          -- Stored as JSONB for queryability (e.g. filter by trigger source)
          trigger      JSONB NOT NULL,
          conditions   JSONB,
          actions      JSONB NOT NULL,

          -- Proposal flow: rules cannot fire until a human approves them
          approved     BOOLEAN NOT NULL DEFAULT FALSE,
          approved_by  UUID,
          approved_at  TIMESTAMPTZ,

          created_by   UUID NOT NULL,
          created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

          CONSTRAINT rules_tenant_name_unique UNIQUE (tenant_id, name)
        );

        CREATE INDEX IF NOT EXISTS rules_tenant_idx        ON rules(tenant_id);
        CREATE INDEX IF NOT EXISTS rules_trigger_idx       ON rules USING GIN (trigger);
        CREATE INDEX IF NOT EXISTS rules_enabled_approved  ON rules(tenant_id, enabled, approved);
      `),
    );
    await applyRlsToTable('rules');

    core.logger.info('[rules] Table & RLS initialised');

    // ── Boot the runner ──────────────────────────────────────────────────────
    runner = new RuleRunner(core);
    await runner.load();

    core.logger.info('[rules] RuleRunner online');
  },

  async registerRoutes(server: FastifyInstance, core: ZexCoreContext): Promise<void> {
    registerRulesRoutes(server, core);
  },
};

export default rulesModule;
