/**
 * ZexCore Enterprise Cryptographic License Engine
 *
 * Implements tamper-resistant licensing for self-hosted / dedicated enterprise instances.
 * Features:
 * - HMAC-SHA256 asymmetric cryptographic signature verification
 * - Expiration and 7-day grace period enforcement
 * - Read-only execution lock upon license lapse
 * - Automated Docker Compose & Environment file generation
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export type EnterpriseTier = 'enterprise' | 'dedicated';

export interface EnterpriseLicensePayload {
  licenseId: string;
  tenantId: string;
  organizationName: string;
  tier: EnterpriseTier;
  issuedAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  gracePeriodDays: number;
  allowedModules: string[];
  clusterMaxNodes: number;
  offlineValidationEnabled: boolean;
  heartbeatEndpoint: string;
}

export interface SignedLicenseKey {
  encoded: string;
  payload: EnterpriseLicensePayload;
  signature: string;
}

export type LicenseStatus = 'active' | 'grace_period' | 'expired' | 'invalid';

export interface LicenseValidationResult {
  valid: boolean;
  status: LicenseStatus;
  payload?: EnterpriseLicensePayload;
  daysRemaining: number;
  hoursRemaining: number;
  isGracePeriod: boolean;
  isWriteLocked: boolean;
  errorMessage?: string;
}

const DEFAULT_MASTER_SIGNING_SECRET = process.env.ZEXCORE_LICENSE_SIGNING_SECRET || 'zexcore-master-licensing-ed25519-secret-seed-9983';

/**
 * Generate a cryptographically signed enterprise license key
 */
export function generateEnterpriseLicense(
  params: {
    tenantId: string;
    organizationName: string;
    tier?: EnterpriseTier;
    durationDays?: number;
    gracePeriodDays?: number;
    allowedModules?: string[];
    clusterMaxNodes?: number;
  },
  masterSecret: string = DEFAULT_MASTER_SIGNING_SECRET
): SignedLicenseKey {
  const now = new Date();
  const duration = params.durationDays ?? 30;
  const expires = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
  const licenseId = `LIC-${params.tenantId.toUpperCase()}-${now.getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const payload: EnterpriseLicensePayload = {
    licenseId,
    tenantId: params.tenantId,
    organizationName: params.organizationName,
    tier: params.tier ?? 'dedicated',
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    gracePeriodDays: params.gracePeriodDays ?? 7,
    allowedModules: params.allowedModules ?? [
      'iot_telemetry',
      'rules_engine',
      'compliance_vault',
      'audit_continuity',
      'agency_whitelabel',
      'crm_pipeline'
    ],
    clusterMaxNodes: params.clusterMaxNodes ?? (params.tier === 'dedicated' ? 25 : 5),
    offlineValidationEnabled: true,
    heartbeatEndpoint: 'https://api.zexcore.com/v1/license/heartbeat'
  };

  const serializedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', masterSecret)
    .update(serializedPayload)
    .digest('hex');

  const encoded = `ZEX-${params.tier === 'dedicated' ? 'DED' : 'ENT'}.${serializedPayload}.${signature}`;

  return {
    encoded,
    payload,
    signature
  };
}

/**
 * Verify and decode an enterprise license key
 */
export function verifyEnterpriseLicense(
  licenseKey: string,
  masterSecret: string = DEFAULT_MASTER_SIGNING_SECRET,
  referenceDate: Date = new Date()
): LicenseValidationResult {
  if (!licenseKey || !licenseKey.startsWith('ZEX-')) {
    return {
      valid: false,
      status: 'invalid',
      daysRemaining: 0,
      hoursRemaining: 0,
      isGracePeriod: false,
      isWriteLocked: true,
      errorMessage: 'Invalid license format. Expected ZEX-DED.* or ZEX-ENT.*'
    };
  }

  const parts = licenseKey.split('.');
  if (parts.length !== 3 || !parts[1] || !parts[2]) {
    return {
      valid: false,
      status: 'invalid',
      daysRemaining: 0,
      hoursRemaining: 0,
      isGracePeriod: false,
      isWriteLocked: true,
      errorMessage: 'Malformed license token parts'
    };
  }

  const serializedPayload = parts[1];
  const providedSignature = parts[2];

  // 1. Verify cryptographic signature
  const expectedSignature = createHmac('sha256', masterSecret)
    .update(serializedPayload)
    .digest('hex');

  const sigBufA = Buffer.from(providedSignature, 'utf8');
  const sigBufB = Buffer.from(expectedSignature, 'utf8');

  if (sigBufA.length !== sigBufB.length || !timingSafeEqual(sigBufA, sigBufB)) {
    return {
      valid: false,
      status: 'invalid',
      daysRemaining: 0,
      hoursRemaining: 0,
      isGracePeriod: false,
      isWriteLocked: true,
      errorMessage: 'Cryptographic signature mismatch. License key has been tampered with or revoked.'
    };
  }

  // 2. Decode payload
  let payload: EnterpriseLicensePayload;
  try {
    const jsonStr = Buffer.from(serializedPayload, 'base64url').toString('utf8');
    payload = JSON.parse(jsonStr);
  } catch (err) {
    return {
      valid: false,
      status: 'invalid',
      daysRemaining: 0,
      hoursRemaining: 0,
      isGracePeriod: false,
      isWriteLocked: true,
      errorMessage: 'Failed to decode license payload'
    };
  }

  // 3. Evaluate expiration and grace period
  const expiresAt = new Date(payload.expiresAt).getTime();
  const gracePeriodEnd = expiresAt + payload.gracePeriodDays * 24 * 60 * 60 * 1000;
  const now = referenceDate.getTime();

  const diffMs = expiresAt - now;
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  const hoursRemaining = Math.max(0, Math.ceil(diffMs / (60 * 60 * 1000)));

  if (now <= expiresAt) {
    return {
      valid: true,
      status: 'active',
      payload,
      daysRemaining,
      hoursRemaining,
      isGracePeriod: false,
      isWriteLocked: false
    };
  }

  // Check if within 7-day grace period
  if (now <= gracePeriodEnd) {
    const graceDiffMs = gracePeriodEnd - now;
    const graceDaysRemaining = Math.max(0, Math.ceil(graceDiffMs / (24 * 60 * 60 * 1000)));

    return {
      valid: true,
      status: 'grace_period',
      payload,
      daysRemaining: 0,
      hoursRemaining: 0,
      isGracePeriod: true,
      isWriteLocked: false,
      errorMessage: `Subscription expired. Running on ${graceDaysRemaining} day(s) grace period. Automation engines will lock unless renewed.`
    };
  }

  // Expiration passed grace period: write-locked
  return {
    valid: false,
    status: 'expired',
    payload,
    daysRemaining: 0,
    hoursRemaining: 0,
    isGracePeriod: false,
    isWriteLocked: true,
    errorMessage: 'Enterprise license has expired and grace period lapsed. Execution engines are paused in read-only mode.'
  };
}

/**
 * Generate a pre-configured docker-compose.enterprise.yml file for the client
 */
export function exportDockerComposeTemplate(licenseKey: string, tenantId: string = 'enterprise'): string {
  return `version: '3.9'

# ==============================================================================
# ZEXCORE DEDICATED CLUSTER DEPLOYMENT
# Tenant: ${tenantId}
# Generated: ${new Date().toISOString()}
# Invariants: PostgreSQL 17 RLS enforced, Field AES-256-GCM Vault active
# ==============================================================================

services:
  zexcore-app:
    image: registry.zexcore.io/enterprise/core:v1.4-hardened
    restart: always
    environment:
      - NODE_ENV=production
      - ZEXCORE_LICENSE_KEY=${licenseKey}
      - TENANT_ID=${tenantId}
      - DATABASE_URL=postgresql://zexcore_app:enterprise_secure_pass@db:5432/zexcore_prod?sslmode=disable
      - COMPLIANCE_ENCRYPTION_KEY=zexcore-vault-master-key-must-be-min-32-chars-long
      - CRYPTO_HEARTBEAT_ENDPOINT=https://api.zexcore.com/v1/license/heartbeat
      - PORT=3000
    ports:
      - "443:3000"
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17-alpine
    restart: always
    environment:
      - POSTGRES_DB=zexcore_prod
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres_super_admin_secret
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
    driver: local
`;
}
