import type { ZexModule, ZexCoreContext } from '@zexcore/core';
import type { FastifyInstance } from 'fastify';
import { cmsCapabilityDefinitions } from './permissions.js';
import { registerCmsRoutes } from './routes/pages.js';
import { applyRlsToTable, sql } from '@zexcore/core';

export * from './schema/pages.js';
export * from './permissions.js';
export * from './events.js';

export const cmsModule: ZexModule = {
  name: 'cms',
  version: '1.0.0',
  description: 'Content Management System module with pages, blocks, and publishing lifecycle',
  permissions: cmsCapabilityDefinitions,

  // Registering one content type through the module contract
  contentTypes: [
    {
      slug: 'page',
      name: 'Page',
      description: 'Dynamic CMS Page with customizable layout blocks and SEO metadata',
      schemaJson: {
        fields: [
          { key: 'title', label: 'Page Title', type: 'string', required: true },
          { key: 'slug', label: 'URL Slug', type: 'string', required: true },
          { key: 'blocks', label: 'Content Blocks', type: 'json', required: false },
          { key: 'seoTitle', label: 'SEO Title', type: 'string', required: false },
          { key: 'seoDescription', label: 'SEO Description', type: 'string', required: false },
        ],
      },
      isSystem: true,
    },
  ],

  async onInit(core: ZexCoreContext): Promise<void> {
    // 1. Ensure table exists & apply Row-Level Security to module table
    await core.db.execute(
      sql.raw(`CREATE TABLE IF NOT EXISTS cms_pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        slug VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(32) DEFAULT 'draft' NOT NULL,
        content JSONB DEFAULT '{}'::jsonb NOT NULL,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        CONSTRAINT cms_pages_tenant_slug_unique UNIQUE (tenant_id, slug)
      );`),
    );

    // Apply strict RLS to module-owned table
    await applyRlsToTable('cms_pages');
  },

  async registerRoutes(server: FastifyInstance, core: ZexCoreContext): Promise<void> {
    registerCmsRoutes(server, core);
  },
};

export default cmsModule;
