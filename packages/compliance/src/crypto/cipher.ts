/**
 * Envelope & Field-Level Encryption using AES-256-GCM
 *
 * Implements authenticated encryption with associated data (AEAD).
 * Format: `enc:v1:<iv_hex>:<tag_hex>:<ciphertext_hex>`
 *
 * Keys:
 *   Derived using HKDF or SHA-256 from the master key and the tenantId,
 *   guaranteeing cryptographic isolation between tenants even if
 *   ciphertext leaks across partition boundaries.
 */

import { createCipheriv, createDecipheriv, randomBytes, createHmac, scryptSync } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM

function getMasterKey(): Buffer {
  const raw = process.env.COMPLIANCE_ENCRYPTION_KEY || process.env.JWT_SECRET || 'zexcore-compliance-default-master-key-32b';
  return scryptSync(raw, 'zexcore-compliance-salt', 32);
}

/**
 * Derives a tenant-specific encryption key using HMAC-SHA256
 */
export function deriveTenantKey(tenantId: string): Buffer {
  const masterKey = getMasterKey();
  return createHmac('sha256', masterKey).update(`tenant:${tenantId}`).digest();
}

/**
 * Encrypts a plaintext string into a versioned AEAD payload
 */
export function encryptField(plaintext: string, tenantId: string): string {
  const key = deriveTenantKey(tenantId);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `enc:v1:${iv.toString('hex')}:${tag.toString('hex')}:${ciphertext.toString('hex')}`;
}

/**
 * Decrypts a versioned AEAD payload back to plaintext
 */
export function decryptField(encryptedPayload: string, tenantId: string): string {
  if (!encryptedPayload.startsWith('enc:v1:')) {
    // Not encrypted or unrecognized format
    return encryptedPayload;
  }

  const parts = encryptedPayload.split(':');
  const ivHex = parts[2];
  const tagHex = parts[3];
  const cipherHex = parts[4];
  if (parts.length !== 5 || !ivHex || !tagHex || !cipherHex) {
    throw new Error('Malformed encrypted field format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const ciphertext = Buffer.from(cipherHex, 'hex');

  const key = deriveTenantKey(tenantId);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Blind index for searching encrypted fields without revealing plaintext.
 * Returns deterministic HMAC hash for exact-match indexing.
 */
export function computeBlindIndex(value: string, tenantId: string): string {
  const key = deriveTenantKey(tenantId);
  return createHmac('sha256', key).update(`blind:${value.trim().toLowerCase()}`).digest('hex');
}

/**
 * Irreversible pseudonymization / redaction for GDPR/NDPR erasure
 */
export function redactPii(value: string | null | undefined): string {
  if (!value) return '[REDACTED]';
  return '[REDACTED]';
}
