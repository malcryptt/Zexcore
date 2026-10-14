/**
 * Action Executor
 *
 * Executes a list of actions given the evaluation context.
 * Returns a structured result — side effects (events, webhooks) happen here
 * but only through well-defined, capability-checked interfaces.
 *
 * Rules:
 *  - "set"     mutates a mutable result context object (never the DB directly)
 *  - "emit"    calls core.events.emit() — the caller decides what to do with it
 *  - "notify"  enqueues to the notification outbox
 *  - "webhook" fires only if the tenant's workspace has the webhook capability enabled
 */

import type { Action } from '../schema/rule.js';
import { type ZexCoreContext, assertSafeUrl } from '@zexcore/core';

export interface ExecutionContext {
  tenantId:  string;
  ruleId:    string;
  ruleName:  string;
  actorId:   string;           // user or system that indirectly triggered the rule
  payload:   Record<string, unknown>;  // event payload that fired the trigger
  capabilities: Set<string>;   // capabilities enabled for this tenant's workspace
}

export interface ExecutionResult {
  success:    boolean;
  mutations:  Record<string, unknown>;  // from "set" actions
  emitted:    string[];                 // event names emitted
  errors:     string[];                 // non-fatal errors per action
}

// ─── Webhook helper (with SSRF protection & 5s hard cap) ──────────────────────

async function fireWebhook(
  url: string,
  method: 'POST' | 'GET',
  headers: Record<string, string> | undefined,
  body: unknown,
): Promise<void> {
  // SSRF defense: enforce private IP & metadata range blocking
  await assertSafeUrl(url);

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 5_000); // 5 s hard cap

  try {
    await fetch(url, {
      method,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ZexCore-RulesEngine/1.0',
        ...headers,
      },
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    });
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Main executor ────────────────────────────────────────────────────────────

export async function executeActions(
  actions: Action[],
  ctx: ExecutionContext,
  core: ZexCoreContext,
): Promise<ExecutionResult> {
  const result: ExecutionResult = {
    success:   true,
    mutations: {},
    emitted:   [],
    errors:    [],
  };

  for (const action of actions) {
    try {
      switch (action.type) {
        // ── set ──────────────────────────────────────────────────────────────
        case 'set': {
          // Write into the mutable context object, not the DB
          // Callers (e.g. route handlers) decide whether to persist
          const parts = action.path.split('.');
          if (parts.some((p) => p === '__proto__' || p === 'constructor' || p === 'prototype')) {
            result.errors.push(`Disallowed prototype property in path: ${action.path}`);
            break;
          }
          let cur: Record<string, unknown> = result.mutations;
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i]!;
            if (typeof cur[part] !== 'object' || cur[part] === null) {
              cur[part] = {};
            }
            cur = cur[part] as Record<string, unknown>;
          }
          const lastPart = parts[parts.length - 1]!;
          cur[lastPart] = action.value;
          break;
        }

        // ── emit ─────────────────────────────────────────────────────────────
        case 'emit': {
          await core.events.emit(action.event, {
            tenantId: ctx.tenantId,
            source:   'rules',
            ruleId:   ctx.ruleId,
            ...action.payload,
          });
          result.emitted.push(action.event);
          break;
        }

        // ── notify ───────────────────────────────────────────────────────────
        case 'notify': {
          // We emit a well-known core event that the notification layer listens to.
          // This keeps the rules engine decoupled from a specific notification impl.
          await core.events.emit('core.notification.enqueue', {
            tenantId: ctx.tenantId,
            userId:   action.userId ?? ctx.actorId,
            template: action.template ?? 'rule_triggered',
            message:  action.message,
            meta: {
              ruleId:   ctx.ruleId,
              ruleName: ctx.ruleName,
              payload:  ctx.payload,
            },
          });
          result.emitted.push('core.notification.enqueue');
          break;
        }

        // ── webhook ──────────────────────────────────────────────────────────
        case 'webhook': {
          // Gate on tenant capability — tenants must explicitly enable outbound webhooks
          if (!ctx.capabilities.has('rules:webhook:outbound')) {
            result.errors.push(`webhook action skipped: tenant lacks 'rules:webhook:outbound' capability`);
            break;
          }
          await fireWebhook(action.url, action.method ?? 'POST', action.headers, {
            tenantId: ctx.tenantId,
            ruleId:   ctx.ruleId,
            payload:  ctx.payload,
          });
          result.emitted.push(`webhook:${action.url}`);
          break;
        }
      }
    } catch (err) {
      // Individual action failures are non-fatal — collect and continue
      result.errors.push(
        `action ${action.type} failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      result.success = false;
    }
  }

  return result;
}
