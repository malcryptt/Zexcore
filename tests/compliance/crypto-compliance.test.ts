import { describe, it, expect } from 'vitest';
import {
  encryptField,
  decryptField,
  computeBlindIndex,
  deriveTenantKey,
  redactPii,
} from '../../packages/compliance/src/crypto/cipher.js';

describe('Cryptographic Privacy Vault & AES-256-GCM AEAD Invariants', () => {
  const tenantA = '550e8400-e29b-41d4-a716-446655440001';
  const tenantB = '550e8400-e29b-41d4-a716-446655440002';

  it('encrypts plaintext into versioned AEAD payload and decrypts cleanly', () => {
    const secret = 'user-confidential-ssn-001-23-4567';
    const encrypted = encryptField(secret, tenantA);

    expect(encrypted.startsWith('enc:v1:')).toBe(true);
    expect(encrypted).not.toContain(secret);

    const decrypted = decryptField(encrypted, tenantA);
    expect(decrypted).toBe(secret);
  });

  it('guarantees tenant key isolation: Tenant B cannot decrypt Tenant A ciphertext', () => {
    const sensitiveData = 'credit-card-4111-2222-3333-4444';
    const encryptedByA = encryptField(sensitiveData, tenantA);

    // Deriving keys for tenant A and tenant B must yield distinct keys
    const keyA = deriveTenantKey(tenantA);
    const keyB = deriveTenantKey(tenantB);
    expect(keyA.equals(keyB)).toBe(false);

    // Attempting to decrypt tenant A ciphertext using tenant B key throws auth tag verification error
    expect(() => {
      decryptField(encryptedByA, tenantB);
    }).toThrow();
  });

  it('computes deterministic HMAC blind indices for exact search queries', () => {
    const email = 'Security.Officer@Enterprise.Org';
    const normalized = 'security.officer@enterprise.org';

    const index1 = computeBlindIndex(email, tenantA);
    const index2 = computeBlindIndex(normalized, tenantA);

    expect(index1).toBe(index2);
    expect(index1).toHaveLength(64); // 256-bit SHA-256 hex string

    // Blind indices across different tenants must NOT match
    const indexB = computeBlindIndex(email, tenantB);
    expect(index1).not.toBe(indexB);
  });

  it('redacts PII strings for GDPR Article 17 erasure pipelines', () => {
    expect(redactPii('sensitive text')).toBe('[REDACTED]');
    expect(redactPii(null)).toBe('[REDACTED]');
    expect(redactPii(undefined)).toBe('[REDACTED]');
  });
});
