import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../apps/api/src/server.js';
import {
  getDb,
  closeDatabaseConnection,
  tenants,
  sql,
} from '../../packages/core/src/index.js';
import type { FastifyInstance } from 'fastify';

describe('API Server Integration: Booting Core + CMS Module', () => {
  let server: FastifyInstance;
  let testTenantId: string;
  let testTenantSlug: string;

  beforeAll(async () => {
    // 1. Create server instance
    server = await createServer();
    await server.ready();

    // 2. Provision test tenant
    const db = getDb();
    await db.execute(sql`SELECT set_config('app.bypass_rls', 'on', false)`);

    testTenantSlug = `cms-test-${Date.now()}`;
    const [t] = await db
      .insert(tenants)
      .values({
        slug: testTenantSlug,
        name: 'CMS Integration Test Corp',
        tier: 'standard',
      })
      .returning();
    testTenantId = t!.id;

    await db.execute(sql`SELECT set_config('app.bypass_rls', 'off', false)`);
  });

  afterAll(async () => {
    await server.close();
    await closeDatabaseConnection();
  });

  it('GET /api/health boots core and reports registered modules', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
    expect(body.modules).toBeDefined();
    expect(body.modules.some((m: any) => m.name === 'cms')).toBe(true);
  });

  it('GET /api/cms/pages returns empty pages for a new tenant', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/cms/pages',
      headers: {
        'x-tenant-id': testTenantId,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.pages).toBeDefined();
    expect(Array.isArray(body.pages)).toBe(true);
  });

  it('POST /api/cms/pages creates a draft page and emits events', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/cms/pages',
      headers: {
        'x-tenant-id': testTenantId,
      },
      payload: {
        slug: 'about-us',
        title: 'About Our Company',
        description: 'Company overview and vision',
        content: {
          sections: [
            { type: 'hero', text: 'Welcome to ZexCore' },
          ],
        },
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.page).toBeDefined();
    expect(body.page.slug).toBe('about-us');
    expect(body.page.status).toBe('draft');
    expect(body.page.tenantId).toBe(testTenantId);

    // Publish page
    const pubRes = await server.inject({
      method: 'POST',
      url: `/api/cms/pages/${body.page.id}/publish`,
      headers: {
        'x-tenant-id': testTenantId,
      },
    });

    expect(pubRes.statusCode).toBe(200);
    const pubBody = JSON.parse(pubRes.body);
    expect(pubBody.page.status).toBe('published');
    expect(pubBody.page.publishedAt).toBeDefined();
  });
});
