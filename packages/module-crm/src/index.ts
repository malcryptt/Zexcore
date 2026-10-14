import type { ZexModule, ZexCoreContext } from '@zexcore/core';
import type { FastifyInstance } from 'fastify';
import { crmCapabilityDefinitions } from './permissions.js';
import { registerContactRoutes } from './routes/contacts.js';
import { registerLeadRoutes } from './routes/leads.js';
import { registerActivityRoutes } from './routes/activities.js';
import { applyRlsToTable, sql } from '@zexcore/core';

export * from './schema/contacts.js';
export * from './permissions.js';
export * from './events.js';

export const crmModule: ZexModule = {
  name: 'crm',
  version: '1.0.0',
  description: 'Customer Relationship Management: contacts, leads, pipeline stages, and activity timeline',
  permissions: crmCapabilityDefinitions,

  async onInit(core: ZexCoreContext): Promise<void> {
    // ── crm_contacts ──────────────────────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS crm_contacts (
          id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          type           VARCHAR(16)  NOT NULL DEFAULT 'person'
                           CHECK (type IN ('person','company')),
          first_name     VARCHAR(128),
          last_name      VARCHAR(128),
          company        VARCHAR(255),
          email          VARCHAR(255),
          phone          VARCHAR(32),
          tags           JSONB        NOT NULL DEFAULT '[]'::jsonb,
          custom_fields  JSONB        NOT NULL DEFAULT '{}'::jsonb,
          created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          CONSTRAINT crm_contacts_tenant_id_unique UNIQUE (tenant_id, id),
          CONSTRAINT crm_contacts_tenant_email_unique UNIQUE (tenant_id, email)
        );
        CREATE INDEX IF NOT EXISTS crm_contacts_tenant_idx ON crm_contacts(tenant_id);
        CREATE INDEX IF NOT EXISTS crm_contacts_email_idx  ON crm_contacts(tenant_id, email);
      `),
    );
    await applyRlsToTable('crm_contacts');

    // ── crm_stages ────────────────────────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS crm_stages (
          id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id   UUID    NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          name        VARCHAR(64) NOT NULL,
          position    INTEGER NOT NULL DEFAULT 0,
          is_default  BOOLEAN NOT NULL DEFAULT FALSE,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT crm_stages_tenant_id_unique UNIQUE (tenant_id, id),
          CONSTRAINT crm_stages_tenant_name_unique UNIQUE (tenant_id, name)
        );
        CREATE INDEX IF NOT EXISTS crm_stages_tenant_idx ON crm_stages(tenant_id, position);
      `),
    );
    await applyRlsToTable('crm_stages');

    // ── crm_leads ─────────────────────────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS crm_leads (
          id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id         UUID    NOT NULL REFERENCES tenants(id)       ON DELETE CASCADE,
          contact_id        UUID    NOT NULL,
          stage_id          UUID    NOT NULL,
          title             VARCHAR(255) NOT NULL,
          value             BIGINT,          -- minor units (cents)
          currency          CHAR(3) NOT NULL DEFAULT 'USD',
          probability       SMALLINT CHECK (probability BETWEEN 0 AND 100),
          expected_close_at TIMESTAMPTZ,
          closed_at         TIMESTAMPTZ,
          closed_reason     VARCHAR(8) CHECK (closed_reason IN ('won','lost')),
          custom_fields     JSONB   NOT NULL DEFAULT '{}'::jsonb,
          created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          -- Composite FK guards: prevent cross-tenant references
          CONSTRAINT crm_leads_contact_fk FOREIGN KEY (tenant_id, contact_id)
            REFERENCES crm_contacts(tenant_id, id) ON DELETE CASCADE,
          CONSTRAINT crm_leads_stage_fk FOREIGN KEY (tenant_id, stage_id)
            REFERENCES crm_stages(tenant_id, id)
        );
        CREATE INDEX IF NOT EXISTS crm_leads_tenant_idx      ON crm_leads(tenant_id);
        CREATE INDEX IF NOT EXISTS crm_leads_stage_idx       ON crm_leads(tenant_id, stage_id);
        CREATE INDEX IF NOT EXISTS crm_leads_contact_idx     ON crm_leads(tenant_id, contact_id);
        CREATE INDEX IF NOT EXISTS crm_leads_closed_at_idx   ON crm_leads(tenant_id, closed_at);
      `),
    );
    await applyRlsToTable('crm_leads');

    // ── crm_activities ────────────────────────────────────────────────────────
    await core.db.execute(
      sql.raw(`
        CREATE TABLE IF NOT EXISTS crm_activities (
          id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          contact_id   UUID,
          lead_id      UUID,
          kind         VARCHAR(16) NOT NULL
                         CHECK (kind IN ('note','call','email','task','meeting')),
          subject      VARCHAR(255) NOT NULL,
          body         TEXT,
          due_at       TIMESTAMPTZ,
          completed_at TIMESTAMPTZ,
          created_by   UUID NOT NULL,       -- user id
          created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT crm_activities_must_link
            CHECK (contact_id IS NOT NULL OR lead_id IS NOT NULL)
        );
        CREATE INDEX IF NOT EXISTS crm_activities_tenant_idx    ON crm_activities(tenant_id);
        CREATE INDEX IF NOT EXISTS crm_activities_contact_idx   ON crm_activities(tenant_id, contact_id);
        CREATE INDEX IF NOT EXISTS crm_activities_lead_idx      ON crm_activities(tenant_id, lead_id);
        CREATE INDEX IF NOT EXISTS crm_activities_due_at_idx    ON crm_activities(tenant_id, due_at)
          WHERE due_at IS NOT NULL AND completed_at IS NULL;
      `),
    );
    await applyRlsToTable('crm_activities');

    core.logger.info('[crm] Tables & RLS initialised');

    // ── Seed default pipeline stages for new tenants ──────────────────────────
    // Listen for the tenant.created core event and add sensible defaults.
    core.events.on('tenant.created', async (payload: { tenantId: string }) => {
      try {
        const defaults = [
          { name: 'New',          position: 1, isDefault: true  },
          { name: 'Contacted',    position: 2, isDefault: false },
          { name: 'Qualified',    position: 3, isDefault: false },
          { name: 'Proposal',     position: 4, isDefault: false },
          { name: 'Negotiation',  position: 5, isDefault: false },
          { name: 'Closed Won',   position: 6, isDefault: false },
          { name: 'Closed Lost',  position: 7, isDefault: false },
        ];

        for (const stage of defaults) {
          await core.db.execute({
            sql: `
              INSERT INTO crm_stages (tenant_id, name, position, is_default)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (tenant_id, name) DO NOTHING
            `,
            params: [payload.tenantId, stage.name, stage.position, stage.isDefault],
          });
        }
        core.logger.info(`[crm] Seeded default pipeline stages for tenant ${payload.tenantId}`);
      } catch (err) {
        core.logger.error({ err }, '[crm] Failed to seed pipeline stages');
      }
    });
  },

  async registerRoutes(server: FastifyInstance, core: ZexCoreContext): Promise<void> {
    registerContactRoutes(server, core);
    registerLeadRoutes(server, core);
    registerActivityRoutes(server, core);
  },
};

export default crmModule;
