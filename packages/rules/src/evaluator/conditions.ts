/**
 * Condition Evaluator
 *
 * Pure function — takes a condition (or group) and a payload object,
 * returns a boolean. No side effects, no async, no eval.
 *
 * Payload values are accessed via dot-path: "lead.value" → payload.lead.value
 */

import type { Condition, ConditionOrGroup } from '../schema/rule.js';

// ─── Dot-path resolver ────────────────────────────────────────────────────────

/**
 * Safely resolve "a.b.c" against an arbitrary object.
 * Returns undefined if any segment is missing rather than throwing.
 */
export function resolvePath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur === null || cur === undefined || typeof cur !== 'object') {
      return undefined;
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

// ─── Single condition evaluation ─────────────────────────────────────────────

export function evaluateCondition(condition: Condition, payload: unknown): boolean {
  const actual = resolvePath(payload, condition.field);
  const expected = condition.value;

  switch (condition.op) {
    case 'eq':
      return actual === expected;

    case 'neq':
      return actual !== expected;

    case 'gt':
      return typeof actual === 'number' && typeof expected === 'number' && actual > expected;

    case 'gte':
      return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;

    case 'lt':
      return typeof actual === 'number' && typeof expected === 'number' && actual < expected;

    case 'lte':
      return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;

    case 'in':
      if (!Array.isArray(expected)) return false;
      return expected.includes(actual as string | number);

    case 'not_in':
      if (!Array.isArray(expected)) return true;
      return !expected.includes(actual as string | number);

    case 'contains':
      if (Array.isArray(actual)) {
        return actual.includes(expected);
      }
      if (typeof actual === 'string' && typeof expected === 'string') {
        return actual.includes(expected);
      }
      return false;

    case 'not_contains':
      if (Array.isArray(actual)) {
        return !actual.includes(expected);
      }
      if (typeof actual === 'string' && typeof expected === 'string') {
        return !actual.includes(expected);
      }
      return true;

    case 'exists':
      return actual !== null && actual !== undefined;

    case 'not_exists':
      return actual === null || actual === undefined;

    case 'matches': {
      // Safe regex: pattern is a stored string, we compile at eval time
      // We deliberately do NOT support flags to limit attack surface
      if (typeof actual !== 'string' || typeof expected !== 'string') return false;
      try {
        // Limit pattern length to prevent ReDoS
        if (expected.length > 128) return false;
        const re = new RegExp(expected);
        return re.test(actual);
      } catch {
        return false; // invalid regex = false, never throws to caller
      }
    }

    default:
      return false;
  }
}

// ─── Group evaluation (recursive AND / OR) ───────────────────────────────────

export function evaluateConditionGroup(group: ConditionOrGroup, payload: unknown): boolean {
  // Leaf condition
  if ('field' in group && 'op' in group) {
    return evaluateCondition(group as Condition, payload);
  }

  // AND group
  if ('all' in group) {
    return group.all.every((child) => evaluateConditionGroup(child, payload));
  }

  // OR group
  if ('any' in group) {
    return group.any.some((child) => evaluateConditionGroup(child, payload));
  }

  // Unknown shape — fail safely
  return false;
}
