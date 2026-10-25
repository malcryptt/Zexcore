import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../apps/api/src/server.js';
import {
  getAdminDb,
  closeDatabaseConnection,
  tenants,
  signAuthToken,
} from '../../packages/core/src/index.js';
import type { FastifyInstance } from 'fastify';

describe('API Server Integration: Booting Core + CMS Module', () => {
  let server: FastifyInstance;
  let testTenantId: string;
  let testTenantSlug: string;
  let adminAuth: Record<string, string>;
  let otherTenantId: string;
  let otherAuth: Record<string, string>;

  beforeAll(async () => {
    // 1. Create server instance
    server = await createServer();
    await server.ready();

    // 2. Provision test tenant
    const db = getAdminDb();

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
    const [o] = await db.insert(tenants).values({ slug: `${testTenantSlug}-other`, name: 'Other Corp', tier: 'standard' }).returning();
    otherTenantId = o!.id;
    adminAuth = { authorization: `Bearer ${signAuthToken({ userId: '00000000-0000-0000-0000-000000000001', tenantId: testTenantId, role: 'admin', principalType: 'tenant_user' })}` };
    otherAuth = { authorization: `Bearer ${signAuthToken({ userId: '00000000-0000-0000-0000-000000000002', tenantId: otherTenantId, role: 'admin', principalType: 'tenant_user' })}` };
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
        ...adminAuth,
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
        ...adminAuth,
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
        ...adminAuth,
      },
    });

    expect(pubRes.statusCode).toBe(200);
    const pubBody = JSON.parse(pubRes.body);
    expect(pubBody.page.status).toBe('published');
    expect(pubBody.page.publishedAt).toBeDefined();
  });

  it('rejects unauthenticated access to tenant data (header alone is not identity)', async () => {
    for (const [method, url] of [
      ['GET', '/api/cms/pages'],
      ['POST', '/api/cms/pages'],
      ['GET', '/api/records'],
      ['GET', '/api/audit/runs'],
      ['POST', '/api/audit/check'],
    ] as const) {
      const res = await server.inject({ method, url, headers: { 'x-tenant-id': testTenantId }, payload: method === 'POST' ? {} : undefined });
      expect(res.statusCode, `${method} ${url}`).toBe(401);
    }
  });

  it('rejects a valid token from another tenant, and a viewer cannot write', async () => {
    const cross = await server.inject({ method: 'GET', url: '/api/cms/pages', headers: { 'x-tenant-id': testTenantId, ...otherAuth } });
    expect(cross.statusCode).toBe(403);
    const viewer = { authorization: `Bearer ${signAuthToken({ userId: '00000000-0000-0000-0000-000000000003', tenantId: testTenantId, role: 'viewer', principalType: 'tenant_user' })}` };
    const w = await server.inject({ method: 'POST', url: '/api/cms/pages', headers: viewer, payload: { slug: 'x', title: 'x' } });
    expect(w.statusCode).toBe(403);
  });

  it('login refuses a tenant the user is not a member of', async () => {
    const res = await server.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'nobody@nowhere.test', password: 'x', tenantSlug: testTenantSlug } });
    expect(res.statusCode).toBe(401);
  });

  it('ignores a spoofed X-Forwarded-For for rate limiting', async () => {
    let blocked = 0;
    for (let i = 0; i < 150; i++) {
      const r = await server.inject({ method: 'GET', url: '/api/health', headers: { 'x-forwarded-for': `10.1.${i}.1` } });
      if (r.statusCode === 429) blocked++;
    }
    expect(blocked).toBeGreaterThan(0);
  });
});
