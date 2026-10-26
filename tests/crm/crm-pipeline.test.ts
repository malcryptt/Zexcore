import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../apps/api/src/server.js';
import {
  getAdminDb,
  closeDatabaseConnection,
  tenants,
  signAuthToken,
} from '../../packages/core/src/index.js';
import type { FastifyInstance } from 'fastify';

describe('CRM Module: Contacts, Opportunities & Composite Key Defense', () => {
  let server: FastifyInstance;
  let tenantA: string;
  let tenantB: string;
  let contactAId: string;
  let stageAId: string;
  let jwtA: string;
  let jwtB: string;

  beforeAll(async () => {
    server = await createServer();
    await server.ready();

    const db = getAdminDb();

    const [t1] = await db
      .insert(tenants)
      .values({
        slug: `crm-test-a-${Date.now()}`,
        name: 'CRM Corp Alpha',
        tier: 'standard',
      })
      .returning();
    tenantA = t1!.id;

    const [t2] = await db
      .insert(tenants)
      .values({
        slug: `crm-test-b-${Date.now()}`,
        name: 'CRM Corp Beta',
        tier: 'standard',
      })
      .returning();
    tenantB = t2!.id;

    // Issue admin JWTs for both tenants
    jwtA = signAuthToken({
      userId: 'crm-admin-a',
      tenantId: tenantA,
      principalType: 'tenant_admin',
      role: 'admin',
    });
    jwtB = signAuthToken({
      userId: 'crm-admin-b',
      tenantId: tenantB,
      principalType: 'tenant_admin',
      role: 'admin',
    });
  });

  afterAll(async () => {
    await server.close();
    await closeDatabaseConnection();
  });

  it('creates a CRM contact within Tenant A context', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/crm/contacts',
      headers: {
        'x-tenant-id': tenantA,
        'Authorization': `Bearer ${jwtA}`,
      },
      payload: {
        type: 'person',
        firstName: 'Jane',
        lastName: 'Doe',
        company: 'Alpha Industrial Logistics',
        email: 'jane.doe@alpha-logistics.io',
        phone: '+1-555-0199',
        tags: ['enterprise', 'decision-maker'],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.contact).toBeDefined();
    expect(body.contact.email).toBe('jane.doe@alpha-logistics.io');
    contactAId = body.contact.id;
  });

  it('creates pipeline stages and sales leads for Tenant A', async () => {
    // Create a stage for Tenant A via the API so RLS is properly applied
    const resStage = await server.inject({
      method: 'POST',
      url: '/api/crm/stages',
      headers: {
        'x-tenant-id': tenantA,
        'Authorization': `Bearer ${jwtA}`,
      },
      payload: {
        name: 'Discovery Call',
        position: 1,
        isDefault: true,
      },
    });

    expect(resStage.statusCode).toBe(201);
    stageAId = JSON.parse(resStage.body).stage.id;

    // Create a lead linked to contactA and stageA
    const resLead = await server.inject({
      method: 'POST',
      url: '/api/crm/leads',
      headers: {
        'x-tenant-id': tenantA,
        'Authorization': `Bearer ${jwtA}`,
      },
      payload: {
        contactId: contactAId,
        stageId: stageAId,
        title: 'Enterprise Platform Migration ($140k)',
        value: 14000000, // cents
        currency: 'USD',
        probability: 60,
      },
    });

    expect(resLead.statusCode).toBe(201);
    const body = JSON.parse(resLead.body);
    expect(body.lead).toBeDefined();
    expect(body.lead.title).toBe('Enterprise Platform Migration ($140k)');
  });

  it('prevents cross-tenant lead referencing: Tenant B cannot reference Tenant A contact', async () => {
    // Tenant B attempts to create a lead pointing to Tenant A's contact and stage
    // The route guards check that contact and stage belong to the requesting tenant,
    // so this must be rejected with 400 (not found in workspace).
    const res = await server.inject({
      method: 'POST',
      url: '/api/crm/leads',
      headers: {
        'x-tenant-id': tenantB,
        'Authorization': `Bearer ${jwtB}`,
      },
      payload: {
        contactId: contactAId, // Belongs to Tenant A!
        stageId: stageAId,     // Belongs to Tenant A!
        title: 'Unauthorized Cross-Tenant Deal',
        value: 5000000,
      },
    });

    // Route validates contact belongs to tenant before insert; returns 400.
    expect(res.statusCode).toBe(400);
  });
});
