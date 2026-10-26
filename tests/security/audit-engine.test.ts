import { describe, it, expect } from 'vitest';
import { runSecurityChecks } from '../../packages/module-audit/src/security/index.js';
import { runFinanceChecks } from '../../packages/module-audit/src/finance/index.js';
import { calculateDomainScore } from '../../packages/module-audit/src/engine/index.js';
import {
  createHashChainBlock,
  verifyHashChainIntegrity,
  generateEvidencePackBundle,
} from '../../packages/module-audit/src/reports/index.js';
import { BASELINE_AUDIT_RULES, evaluateRuleChangeDirection } from '../../packages/module-audit/src/rules/index.js';
import type { HashChainBlock, AuditFinding } from '../../packages/module-audit/src/types.js';

describe('Audit & Financial Health Engine: Deterministic Evaluation & Cryptography', () => {
  const TENANT_ID = 'tenant-test-01';

  // ── 1. SECURITY POSTURE CHECKS ──────────────────────────────────────────────
  describe('Security Posture Checks', () => {
    it('flags administrators lacking Multi-Factor Authentication', () => {
      const findings = runSecurityChecks({
        tenantId: TENANT_ID,
        users: [
          { id: 'usr-admin-1', email: 'admin1@test.com', role: 'admin', mfaEnabled: false, createdAt: '2026-01-01' },
          { id: 'usr-admin-2', email: 'admin2@test.com', role: 'owner', mfaEnabled: true, createdAt: '2026-01-01' },
          { id: 'usr-member', email: 'member@test.com', role: 'viewer', mfaEnabled: false, createdAt: '2026-01-01' },
        ],
        apiKeys: [],
        devices: [],
        auditLogs: [],
        forms: [],
        siteSettings: { enforceHsts: true, corsOrigins: ['https://app.test.com'], allowedMfaMethods: ['totp'] },
      });

      const mfaFinding = findings.find((f) => f.ruleKey === 'sec.posture.admin_mfa');
      expect(mfaFinding).toBeDefined();
      expect(mfaFinding?.severity).toBe('critical');
      expect(mfaFinding?.evidence.records).toHaveLength(1);
      // Cryptographic hash must be authentic SHA-256 (64 hex characters)
      expect(mfaFinding?.evidence.cryptographicHash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('passes when all administrative accounts have MFA activated', () => {
      const findings = runSecurityChecks({
        tenantId: TENANT_ID,
        users: [
          { id: 'usr-admin-1', email: 'admin1@test.com', role: 'admin', mfaEnabled: true, createdAt: '2026-01-01' },
          { id: 'usr-admin-2', email: 'admin2@test.com', role: 'owner', mfaEnabled: true, createdAt: '2026-01-01' },
        ],
        apiKeys: [],
        devices: [],
        auditLogs: [],
        forms: [],
        siteSettings: { enforceHsts: true, corsOrigins: ['https://app.test.com'], allowedMfaMethods: ['totp'] },
      });

      const mfaFinding = findings.find((f) => f.ruleKey === 'sec.posture.admin_mfa');
      expect(mfaFinding).toBeUndefined();
    });

    it('flags wildcard CORS origin configuration (*)', () => {
      const findings = runSecurityChecks({
        tenantId: TENANT_ID,
        users: [],
        apiKeys: [],
        devices: [],
        auditLogs: [],
        forms: [],
        siteSettings: { enforceHsts: true, corsOrigins: ['*'], allowedMfaMethods: ['totp'] },
      });

      const corsFinding = findings.find((f) => f.ruleKey === 'sec.posture.wildcard_cors');
      expect(corsFinding).toBeDefined();
      expect(corsFinding?.severity).toBe('high');
      expect(corsFinding?.evidence.cryptographicHash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('flags silent edge IoT devices exceeding offline threshold', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const findings = runSecurityChecks({
        tenantId: TENANT_ID,
        users: [],
        apiKeys: [],
        devices: [
          { id: 'dev-stale-01', name: 'Pump Sensor 4', status: 'online', lastSeen: twoHoursAgo },
          { id: 'dev-active-02', name: 'Valve Monitor 1', status: 'online', lastSeen: new Date().toISOString() },
        ],
        auditLogs: [],
        forms: [],
        siteSettings: { enforceHsts: true, corsOrigins: ['https://app.test.com'], allowedMfaMethods: ['totp'] },
      });

      const silentFinding = findings.find((f) => f.ruleKey === 'sec.posture.silent_devices');
      expect(silentFinding).toBeDefined();
      expect(silentFinding?.evidence.records).toHaveLength(1);
    });
  });

  // ── 2. FINANCE INTEGRITY CHECKS ─────────────────────────────────────────────
  describe('Finance Integrity & Gateway Reconciliation', () => {
    it('flags cumulative refunds exceeding the original captured charge', () => {
      const findings = runFinanceChecks({
        tenantId: TENANT_ID,
        invoices: [],
        payments: [
          { id: 'pay-001', amountMinor: 10000, currency: 'USD', status: 'settled', customerId: 'cust-1', timestamp: '2026-10-01' },
        ],
        refunds: [
          { id: 'ref-001', paymentId: 'pay-001', amountMinor: 7000, reason: 'partial', timestamp: '2026-10-02' },
          { id: 'ref-002', paymentId: 'pay-001', amountMinor: 5000, reason: 'duplicate', timestamp: '2026-10-03' },
        ],
        shifts: [],
        ledger: [],
      });

      const overRefund = findings.find((f) => f.ruleKey === 'fin.integrity.refund_over_payment');
      expect(overRefund).toBeDefined();
      expect(overRefund?.severity).toBe('critical');
      expect(overRefund?.evidence.cryptographicHash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('flags duplicate payments captured for identical amount within time window', () => {
      const now = Date.now();
      const findings = runFinanceChecks({
        tenantId: TENANT_ID,
        invoices: [],
        payments: [
          {
            id: 'pay-dup-1',
            amountMinor: 5000,
            currency: 'USD',
            status: 'succeeded',
            customerEmail: 'cust@test.com',
            createdAt: new Date(now).toISOString(),
          },
          {
            id: 'pay-dup-2',
            amountMinor: 5000,
            currency: 'USD',
            status: 'succeeded',
            customerEmail: 'cust@test.com',
            createdAt: new Date(now + 15000).toISOString(),
          },
        ],
        refunds: [],
        shifts: [],
        ledger: [],
      });

      const dupFinding = findings.find((f) => f.ruleKey === 'fin.integrity.duplicate_payments');
      expect(dupFinding).toBeDefined();
      expect(dupFinding?.evidence.records).toHaveLength(1);
    });

    it('flags sequence gaps in finalized sequential tax invoices', () => {
      const findings = runFinanceChecks({
        tenantId: TENANT_ID,
        invoices: [
          { id: 'inv-1', invoiceNumber: 'INV-001', sequence: 1, amountMinor: 5000, currency: 'USD', status: 'paid', issuedAt: '2026-10-01' },
          { id: 'inv-2', invoiceNumber: 'INV-002', sequence: 2, amountMinor: 8000, currency: 'USD', status: 'paid', issuedAt: '2026-10-02' },
          // Missing sequence: 3
          { id: 'inv-4', invoiceNumber: 'INV-004', sequence: 4, amountMinor: 12000, currency: 'USD', status: 'paid', issuedAt: '2026-10-04' },
        ],
        payments: [],
        refunds: [],
        shifts: [],
        ledger: [],
      });

      const gapFinding = findings.find((f) => f.ruleKey === 'fin.integrity.invoice_number_gaps');
      expect(gapFinding).toBeDefined();
      expect(gapFinding?.evidence.calculatedValues?.missingSequences).toContain(3);
    });
  });

  // ── 3. SCORE CALCULATION & ENGINE RUN ───────────────────────────────────────
  describe('Engine Scoring & Weight Calculation', () => {
    it('accurately discounts scores based on finding severity penalty weights', () => {
      const dummyFindings: AuditFinding[] = [
        {
          id: 'f-1',
          tenantId: TENANT_ID,
          ruleKey: 'sec.test',
          ruleName: 'Test',
          ruleVersion: 1,
          domain: 'security',
          severity: 'critical', // -25
          title: 'Critical issue',
          description: 'Desc',
          evidence: {
            ruleKey: 'sec.test',
            ruleVersion: 1,
            domain: 'security',
            occurredAt: new Date().toISOString(),
            records: [],
            calculatedValues: {},
            reproductionCommand: 'test',
            cryptographicHash: 'abc',
          },
          status: 'open',
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
        {
          id: 'f-2',
          tenantId: TENANT_ID,
          ruleKey: 'sec.test2',
          ruleName: 'Test 2',
          ruleVersion: 1,
          domain: 'security',
          severity: 'high', // -12
          title: 'High issue',
          description: 'Desc',
          evidence: {
            ruleKey: 'sec.test2',
            ruleVersion: 1,
            domain: 'security',
            occurredAt: new Date().toISOString(),
            records: [],
            calculatedValues: {},
            reproductionCommand: 'test',
            cryptographicHash: 'def',
          },
          status: 'open',
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
      ];

      // Base 100 - 25 - 12 = 63
      expect(calculateDomainScore(dummyFindings)).toBe(63);
    });

    it('returns perfect 100 score when no open findings exist', () => {
      expect(calculateDomainScore([])).toBe(100);
    });

    it('ignores dismissed findings when computing domain score', () => {
      const dismissedFinding: AuditFinding = {
        id: 'f-dismissed',
        tenantId: TENANT_ID,
        ruleKey: 'sec.test',
        ruleName: 'Test',
        ruleVersion: 1,
        domain: 'security',
        severity: 'critical',
        title: 'Dismissed issue',
        description: 'Desc',
        evidence: {
          ruleKey: 'sec.test',
          ruleVersion: 1,
          domain: 'security',
          occurredAt: new Date().toISOString(),
          records: [],
          calculatedValues: {},
          reproductionCommand: 'test',
          cryptographicHash: 'abc',
        },
        status: 'dismissed', // Should not penalize
        firstSeenAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
      };

      expect(calculateDomainScore([dismissedFinding])).toBe(100);
    });
  });

  // ── 4. CRYPTOGRAPHIC HASH CHAIN & EVIDENCE PACKS ────────────────────────────
  describe('Cryptographic Hash Chain & Evidence Packs', () => {
    it('creates chained SHA-256 blocks with mathematical continuity', () => {
      const genesisPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';
      const block1 = createHashChainBlock(TENANT_ID, 1, 'audit.run', 'run-01', { score: 95 }, genesisPrevHash);
      const block2 = createHashChainBlock(TENANT_ID, 2, 'audit.finding', 'find-01', { sev: 'high' }, block1.blockHash);
      const block3 = createHashChainBlock(TENANT_ID, 3, 'audit.dismiss', 'find-01', { actor: 'admin' }, block2.blockHash);

      expect(block1.blockHash).toMatch(/^[a-f0-9]{64}$/);
      expect(block2.previousHash).toBe(block1.blockHash);
      expect(block3.previousHash).toBe(block2.blockHash);

      const integrity = verifyHashChainIntegrity([block1, block2, block3]);
      expect(integrity.isValid).toBe(true);
      expect(integrity.totalBlocks).toBe(3);
    });

    it('detects tampering when an intermediate block hash is altered', () => {
      const genesisPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';
      const block1 = createHashChainBlock(TENANT_ID, 1, 'audit.run', 'run-01', { score: 95 }, genesisPrevHash);
      const block2 = createHashChainBlock(TENANT_ID, 2, 'audit.finding', 'find-01', { sev: 'high' }, block1.blockHash);
      
      // Corrupt block 2's previousHash
      const tamperedBlock2: HashChainBlock = {
        ...block2,
        previousHash: 'tampered_invalid_hash_string',
      };

      const integrity = verifyHashChainIntegrity([block1, tamperedBlock2]);
      expect(integrity.isValid).toBe(false);
      expect(integrity.brokenBlockNumber).toBe(2);
    });

    it('generates a signed Evidence Pack Bundle with verifiable SHA-256 checksum', () => {
      const genesisPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';
      const block1 = createHashChainBlock(TENANT_ID, 1, 'genesis', 'init', {}, genesisPrevHash);

      const bundle = generateEvidencePackBundle({
        tenantId: TENANT_ID,
        generatedBy: 'auditor@big4.com',
        timeRange: { start: '2026-09-01T00:00:00Z', end: '2026-10-01T00:00:00Z' },
        rules: BASELINE_AUDIT_RULES,
        findings: [],
        findingEvents: [],
        ledger: [],
        hashChainBlocks: [block1],
      });

      expect(bundle.packId).toMatch(/^pack-/);
      expect(bundle.checksumSHA256).toMatch(/^[a-f0-9]{64}$/);
      expect(bundle.hashChainAudit.latestRootHash).toBe(block1.blockHash);
      expect(bundle.hashChainAudit.isContinuous).toBe(true);
    });
  });

  // ── 5. RULE GOVERNANCE & DUAL APPROVAL ───────────────────────────────────────
  describe('Rule Governance & Dual-Approval Logic', () => {
    it('contains baseline locked rules that cannot be disabled', () => {
      const mfaRule = BASELINE_AUDIT_RULES.find((r) => r.key === 'sec.posture.admin_mfa');
      expect(mfaRule).toBeDefined();
      expect(mfaRule?.tier).toBe('locked_baseline');

      const refundRule = BASELINE_AUDIT_RULES.find((r) => r.key === 'fin.integrity.refund_over_payment');
      expect(refundRule).toBeDefined();
      expect(refundRule?.tier).toBe('locked_baseline');
    });

    it('correctly detects tightening vs loosening direction for tunable rules', () => {
      const dormRule = BASELINE_AUDIT_RULES.find((r) => r.key === 'sec.posture.dormant_accounts');
      expect(dormRule).toBeDefined();

      if (dormRule) {
        // Tightening: decreasing threshold from 90 days to 60 days
        const tightenEval = evaluateRuleChangeDirection(dormRule, 'tune', { daysThreshold: 60 });
        expect(tightenEval).toBe('tighten');

        // Loosening: increasing threshold from 90 days to 180 days
        const loosenEval = evaluateRuleChangeDirection(dormRule, 'tune', { daysThreshold: 180 });
        expect(loosenEval).toBe('loosen');

        // Disabling always counts as loosening
        const disableEval = evaluateRuleChangeDirection(dormRule, 'disable', {});
        expect(disableEval).toBe('loosen');
      }
    });
  });
});
