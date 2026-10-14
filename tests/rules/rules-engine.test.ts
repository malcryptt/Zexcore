import { describe, it, expect } from 'vitest';
import {
  evaluateCondition,
  evaluateConditionGroup,
  resolvePath,
} from '../../packages/rules/src/evaluator/conditions.js';
import { executeActions, type ExecutionContext } from '../../packages/rules/src/executor/actions.js';
import { globalEventBus } from '../../packages/core/src/events/bus.js';

describe('Deterministic Rules Engine: Condition Evaluator & AST Sandbox', () => {
  it('correctly resolves nested dot-paths and handles missing segments safely', () => {
    const payload = {
      lead: {
        company: 'Acme Corp',
        value: 120000,
        tags: ['enterprise', 'priority'],
        nested: { deep: true },
      },
    };

    expect(resolvePath(payload, 'lead.company')).toBe('Acme Corp');
    expect(resolvePath(payload, 'lead.value')).toBe(120000);
    expect(resolvePath(payload, 'lead.nested.deep')).toBe(true);
    expect(resolvePath(payload, 'lead.nonexistent.field')).toBeUndefined();
    expect(resolvePath(payload, 'random.other.thing')).toBeUndefined();
  });

  it('rejects prototype pollution attempts in dot-path resolution', () => {
    const payload = { safe: true };

    expect(resolvePath(payload, '__proto__.polluted')).toBeUndefined();
    expect(resolvePath(payload, 'constructor.prototype.polluted')).toBeUndefined();
    expect(resolvePath(payload, 'prototype.polluted')).toBeUndefined();
  });

  it('evaluates comparison operators (eq, neq, gt, gte, lt, lte)', () => {
    const payload = { temp: 75, status: 'warning', ratio: 0.85 };

    expect(evaluateCondition({ field: 'temp', op: 'gt', value: 70 }, payload)).toBe(true);
    expect(evaluateCondition({ field: 'temp', op: 'gt', value: 80 }, payload)).toBe(false);
    expect(evaluateCondition({ field: 'temp', op: 'gte', value: 75 }, payload)).toBe(true);
    expect(evaluateCondition({ field: 'temp', op: 'lt', value: 80 }, payload)).toBe(true);
    expect(evaluateCondition({ field: 'temp', op: 'lte', value: 75 }, payload)).toBe(true);
    expect(evaluateCondition({ field: 'status', op: 'eq', value: 'warning' }, payload)).toBe(true);
    expect(evaluateCondition({ field: 'status', op: 'neq', value: 'critical' }, payload)).toBe(true);
  });

  it('evaluates collection and array operators (in, not_in, contains, not_contains)', () => {
    const payload = {
      role: 'admin',
      tags: ['industrial', 'high-voltage'],
      label: 'production-sensor',
    };

    expect(evaluateCondition({ field: 'role', op: 'in', value: ['admin', 'manager'] }, payload)).toBe(true);
    expect(evaluateCondition({ field: 'role', op: 'in', value: ['viewer', 'editor'] }, payload)).toBe(false);
    expect(evaluateCondition({ field: 'role', op: 'not_in', value: ['viewer'] }, payload)).toBe(true);

    expect(evaluateCondition({ field: 'tags', op: 'contains', value: 'industrial' }, payload)).toBe(true);
    expect(evaluateCondition({ field: 'tags', op: 'not_contains', value: 'deprecated' }, payload)).toBe(true);
    expect(evaluateCondition({ field: 'label', op: 'contains', value: 'sensor' }, payload)).toBe(true);
  });

  it('evaluates existence and regex matches safely with ReDoS bounds', () => {
    const payload = { key: 'dev-1049', code: null };

    expect(evaluateCondition({ field: 'key', op: 'exists', value: true }, payload)).toBe(true);
    expect(evaluateCondition({ field: 'code', op: 'not_exists', value: true }, payload)).toBe(true);

    // Safe regex
    expect(evaluateCondition({ field: 'key', op: 'matches', value: '^dev-\\d+$' }, payload)).toBe(true);
    expect(evaluateCondition({ field: 'key', op: 'matches', value: '^sensor' }, payload)).toBe(false);

    // Oversized regex pattern (>128 chars) safely returns false without crashing
    const longRegex = 'a'.repeat(200);
    expect(evaluateCondition({ field: 'key', op: 'matches', value: longRegex }, payload)).toBe(false);
  });

  it('evaluates recursive condition groups with all (AND) and any (OR)', () => {
    const payload = {
      device: { type: 'sensor', temp: 82, battery: 15 },
    };

    const groupAnd = {
      all: [
        { field: 'device.type', op: 'eq', value: 'sensor' as any },
        { field: 'device.temp', op: 'gt', value: 80 as any },
      ],
    };
    expect(evaluateConditionGroup(groupAnd, payload)).toBe(true);

    const groupOr = {
      any: [
        { field: 'device.temp', op: 'gt', value: 100 as any },
        { field: 'device.battery', op: 'lt', value: 20 as any },
      ],
    };
    expect(evaluateConditionGroup(groupOr, payload)).toBe(true);
  });
});

describe('Deterministic Rules Engine: Action Executor', () => {
  const dummyCore: any = {
    events: globalEventBus,
    audit: { log: async () => {} },
    logger: console,
  };

  it('executes set actions mutating result context while preventing prototype pollution', async () => {
    const ctx: ExecutionContext = {
      tenantId: 'tenant-test-1',
      ruleId: 'rule-1',
      ruleName: 'Test Rule',
      actorId: 'user-1',
      payload: { value: 10 },
      capabilities: new Set(['rules:execute']),
    };

    const actions: any[] = [
      { type: 'set', path: 'computed.score', value: 95 },
      { type: 'set', path: 'status', value: 'verified' },
      { type: 'set', path: '__proto__.hacked', value: true }, // Should be rejected
    ];

    const result = await executeActions(actions, ctx, dummyCore);

    expect(result.success).toBe(true);
    expect((result.mutations.computed as any)?.score).toBe(95);
    expect(result.mutations.status).toBe('verified');
    expect((Object.prototype as any).hacked).toBeUndefined();
    expect(result.errors.some((e) => e.includes('Disallowed prototype'))).toBe(true);
  });

  it('blocks SSRF on outbound webhook actions targeting loopback or private addresses', async () => {
    const ctx: ExecutionContext = {
      tenantId: 'tenant-test-1',
      ruleId: 'rule-2',
      ruleName: 'Webhook Rule',
      actorId: 'user-1',
      payload: {},
      capabilities: new Set(['rules:webhook:outbound']),
    };

    const actions: any[] = [
      { type: 'webhook', url: 'http://127.0.0.1:8080/internal-api', method: 'POST' },
    ];

    const result = await executeActions(actions, ctx, dummyCore);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('SSRF Protection Blocked');
  });
});
