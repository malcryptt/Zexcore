import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'node:crypto';
import { createServer } from '../../apps/api/src/server.js';
import { closeDatabaseConnection } from '../../packages/core/src/index.js';
import type { FastifyInstance } from 'fastify';

describe('Signup, session and workspace endpoints', () => {
  let server: FastifyInstance;
  const sfx = crypto.randomBytes(3).toString('hex');
  const email = `owner-${sfx}@acme-${sfx}.test`;
  const password = 'Str0ng-Passphrase-42';
  let token = '';
  let slug = '';

  beforeAll(async () => {
    server = await createServer();
    await server.ready();
  });
  afterAll(async () => {
    await server.close();
    await closeDatabaseConnection();
  });

  const post = (url: string, payload: unknown, headers: Record<string, string> = {}) =>
    server.inject({ method: 'POST', url, payload: payload as any, headers });
  const auth = () => ({ authorization: `Bearer ${token}` });

  it('registers a tenant + owner and returns a working token', async () => {
    const r = await post('/api/auth/register', { tenantName: `Acme ${sfx} Ltd`, name: 'Ada Owner', email, password });
    expect(r.statusCode).toBe(201);
    const b = r.json();
    token = b.token;
    slug = b.tenant.slug;
    expect(slug).toBe(`acme-${sfx}-ltd`);
    expect(b.role).toBe('owner');
    expect(b.tenant.tier).toBe('free');
  });

  it('GET /api/auth/me returns the profile, tenant and role', async () => {
    const r = await server.inject({ method: 'GET', url: '/api/auth/me', headers: auth() });
    expect(r.statusCode).toBe(200);
    const b = r.json();
    expect(b.user.email).toBe(email);
    expect(b.tenant.slug).toBe(slug);
    expect(b.tenant.tier).toBe('free');
    expect(b.role).toBe('owner');
  });

  it('a new workspace starts empty (real zeros, no sample data)', async () => {
    const r = await server.inject({ method: 'GET', url: '/api/overview', headers: auth() });
    expect(r.statusCode).toBe(200);
    const b = r.json();
    expect(b.devices).toEqual({ total: 0, online: 0 });
    expect(b.crm.contacts).toBe(0);
    expect(b.cms).toEqual({ published: 0, drafts: 0 });
    expect(b.recentActivity.map((e: any) => e.action)).toContain('tenant.registered');
  });

  it('audit log shows the signup and the chain verifies', async () => {
    const log = (await server.inject({ method: 'GET', url: '/api/audit-log', headers: auth() })).json();
    expect(log.entries[0].action).toBe('tenant.registered');
    const v = (await server.inject({ method: 'GET', url: '/api/audit-log/verify', headers: auth() })).json();
    expect(v.valid).toBe(true);
    expect(v.total).toBeGreaterThanOrEqual(1);
  });

  it('can log in after registering, with case-insensitive email', async () => {
    const r = await post('/api/auth/login', { email: email.toUpperCase(), password, tenantSlug: slug });
    expect(r.statusCode).toBe(200);
    expect(r.json().token).toBeTruthy();
  });

  it('rejects weak passwords, bad slugs, duplicates (without confirming emails)', async () => {
    const base = { tenantName: 'Another Co', name: 'Bob', email: `bob-${sfx}@x.test`, password };
    expect((await post('/api/auth/register', { ...base, password: 'short' })).statusCode).toBe(400);
    expect((await post('/api/auth/register', { ...base, password: 'password123' })).statusCode).toBe(400);
    expect((await post('/api/auth/register', { ...base, tenantSlug: 'admin' })).statusCode).toBe(400);
    expect((await post('/api/auth/register', { ...base, tenantSlug: slug })).statusCode).toBe(409);
    const dup = await post('/api/auth/register', { ...base, email, tenantSlug: `dup-${sfx}` });
    expect(dup.statusCode).toBe(409);
    expect(dup.json().code).toBe('account_unavailable');
  });

  it('protects workspace endpoints and the public price list needs no login', async () => {
    for (const url of ['/api/overview', '/api/auth/me', '/api/audit-log', '/api/billing/payments']) {
      expect((await server.inject({ method: 'GET', url, headers: { 'x-tenant-slug': slug } })).statusCode, url).toBe(401);
    }
    const plans = await server.inject({ method: 'GET', url: '/api/billing/plans' });
    expect(plans.statusCode).toBe(200);
    expect(plans.json().plans.find((p: any) => p.tier === 'growth').monthlyUsd).toBe(49);
  });

  it('shows billing history for the owner (empty at first)', async () => {
    const r = await server.inject({ method: 'GET', url: '/api/billing/payments', headers: auth() });
    expect(r.statusCode).toBe(200);
    expect(r.json().payments).toEqual([]);
  });
});
