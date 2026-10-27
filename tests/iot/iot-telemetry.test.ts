import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { testToken } from '../helpers/db.js';
import { createServer } from '../../apps/api/src/server.js';
import {
  getAdminDb,
  closeDatabaseConnection,
  tenants,
} from '../../packages/core/src/index.js';
import type { FastifyInstance } from 'fastify';

describe('IoT Module: Fleet Registration & Telemetry Ingestion', () => {
  let server: FastifyInstance;
  let testTenantId: string;
  let deviceToken: string;
  let deviceKey: string;
  let adminJwt: string;

  beforeAll(async () => {
    server = await createServer();
    await server.ready();

    const db = getAdminDb();

    const [t] = await db
      .insert(tenants)
      .values({
        slug: `iot-test-${Date.now()}`,
        name: 'IoT Fleet Industrial Test Corp',
        tier: 'standard',
      })
      .returning();
    testTenantId = t!.id;

    // Sign an admin JWT so routes that require authentication pass
    adminJwt = await testToken({
      userId: 'test-iot-admin',
      tenantId: testTenantId,
      principalType: 'tenant_admin',
      role: 'admin',
    });
  });

  afterAll(async () => {
    await server.close();
    await closeDatabaseConnection();
  });

  it('registers an edge device and returns secure single-use token', async () => {
    deviceKey = `edge-node-${Date.now()}`;
    const res = await server.inject({
      method: 'POST',
      url: '/api/iot/devices',
      headers: {
        'x-tenant-id': testTenantId,
        'Authorization': `Bearer ${adminJwt}`,
      },
      payload: {
        deviceKey,
        name: 'Turbine Vibration Sensor',
        kind: 'sensor',
        firmwareVersion: '1.4.2',
        tags: ['turbine', 'power-plant'],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.device).toBeDefined();
    expect(body.device.device_key).toBe(deviceKey);
    expect(body.token).toBeDefined();
    deviceToken = body.token;
  });

  it('ingests sensor telemetry using X-Device-Token header', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/iot/ingest',
      headers: {
        'x-tenant-id': testTenantId,
        'x-device-token': deviceToken,
      },
      payload: {
        metrics: {
          temperature: 84.6,
          vibration_rms: 2.14,
          power_voltage: 230.1,
          status_online: true,
        },
      },
    });

    expect(res.statusCode).toBe(202);
    const body = JSON.parse(res.body);
    expect(body.accepted).toBe(true);
  });

  it('rejects telemetry with invalid or missing device tokens', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/iot/ingest',
      headers: {
        'x-tenant-id': testTenantId,
        'x-device-token': 'invalid-secret-token-xyz',
      },
      payload: {
        metrics: { temperature: 50.0 },
      },
    });

    expect(res.statusCode).toBe(401);
  });
});
