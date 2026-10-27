import { describe, it, expect } from 'vitest';
import {
  generateEnterpriseLicense,
  verifyEnterpriseLicense,
  exportDockerComposeTemplate
} from '../../packages/compliance/src/licensing/licenseEngine.js';

describe('Enterprise Cryptographic Licensing Engine', () => {
  const masterSecret = 'test-licensing-master-secret-key-32b';

  it('generates a valid cryptographically signed license key', () => {
    const license = generateEnterpriseLicense(
      {
        tenantId: 'acme_corp',
        organizationName: 'Acme Enterprise Corp',
        tier: 'dedicated',
        durationDays: 30
      },
      masterSecret
    );

    expect(license.encoded).toMatch(/^ZEX-DED\.[A-Za-z0-9_-]+\.[a-f0-9]{64}$/);
    expect(license.payload.tenantId).toBe('acme_corp');
    expect(license.payload.tier).toBe('dedicated');
    expect(license.payload.allowedModules).toContain('iot_telemetry');
    expect(license.payload.allowedModules).toContain('compliance_vault');
  });

  it('verifies a freshly generated license as active', () => {
    const license = generateEnterpriseLicense(
      {
        tenantId: 'globex_corp',
        organizationName: 'Globex Research Labs',
        tier: 'enterprise',
        durationDays: 14
      },
      masterSecret
    );

    const result = verifyEnterpriseLicense(license.encoded, masterSecret);
    expect(result.valid).toBe(true);
    expect(result.status).toBe('active');
    expect(result.isWriteLocked).toBe(false);
    expect(result.isGracePeriod).toBe(false);
    expect(result.daysRemaining).toBe(14);
    expect(result.payload?.organizationName).toBe('Globex Research Labs');
  });

  it('detects tampering and rejects signature mismatch', () => {
    const license = generateEnterpriseLicense(
      {
        tenantId: 'tamper_test',
        organizationName: 'Tamper Test Corp'
      },
      masterSecret
    );

    // Tamper with the signature
    const parts = license.encoded.split('.');
    // Always change the first character (replacing it with '0' was a no-op 1 time in 16, making this test flaky).
    const tamperedSig = (parts[2][0] === 'a' ? 'b' : 'a') + parts[2].slice(1);
    const tamperedKey = `${parts[0]}.${parts[1]}.${tamperedSig}`;

    const result = verifyEnterpriseLicense(tamperedKey, masterSecret);
    expect(result.valid).toBe(false);
    expect(result.status).toBe('invalid');
    expect(result.isWriteLocked).toBe(true);
    expect(result.errorMessage).toContain('signature mismatch');
  });

  it('enters 7-day grace period when expiration date is passed', () => {
    const license = generateEnterpriseLicense(
      {
        tenantId: 'grace_tenant',
        organizationName: 'Grace Period Hospital',
        durationDays: 30,
        gracePeriodDays: 7
      },
      masterSecret
    );

    // Test with referenceDate = 32 days in the future (2 days past expiry, 5 days left in grace period)
    const issuedAt = new Date(license.payload.issuedAt);
    const simulatedDate = new Date(issuedAt.getTime() + 32 * 24 * 60 * 60 * 1000);

    const result = verifyEnterpriseLicense(license.encoded, masterSecret, simulatedDate);
    expect(result.valid).toBe(true);
    expect(result.status).toBe('grace_period');
    expect(result.isGracePeriod).toBe(true);
    expect(result.isWriteLocked).toBe(false); // Grace period allows operations to continue
    expect(result.errorMessage).toContain('Running on 5 day(s) grace period');
  });

  it('locks execution when grace period has fully lapsed', () => {
    const license = generateEnterpriseLicense(
      {
        tenantId: 'expired_tenant',
        organizationName: 'Expired Corp',
        durationDays: 30,
        gracePeriodDays: 7
      },
      masterSecret
    );

    // Test with referenceDate = 40 days in the future (3 days past grace period)
    const issuedAt = new Date(license.payload.issuedAt);
    const simulatedDate = new Date(issuedAt.getTime() + 40 * 24 * 60 * 60 * 1000);

    const result = verifyEnterpriseLicense(license.encoded, masterSecret, simulatedDate);
    expect(result.valid).toBe(false);
    expect(result.status).toBe('expired');
    expect(result.isGracePeriod).toBe(false);
    expect(result.isWriteLocked).toBe(true);
    expect(result.errorMessage).toContain('Execution engines are paused in read-only mode');
  });

  it('generates a valid docker-compose enterprise deployment template', () => {
    const license = generateEnterpriseLicense(
      {
        tenantId: 'docker_client',
        organizationName: 'Docker Enterprise'
      },
      masterSecret
    );

    const composeYaml = exportDockerComposeTemplate(license.encoded, 'docker_client');
    expect(composeYaml).toContain(`ZEXCORE_LICENSE_KEY=${license.encoded}`);
    expect(composeYaml).toContain('TENANT_ID=docker_client');
    expect(composeYaml).toContain('registry.zexcore.io/enterprise/core:v1.4-hardened');
    expect(composeYaml).toContain('postgres:17-alpine');
  });
});
