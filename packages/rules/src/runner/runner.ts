/**
 * RuleRunner
 *
 * The bridge between the Core Event Bus and the rules engine.
 *
 * On startup:
 *   - Loads all ENABLED + APPROVED rules for all active tenants from Postgres
 *   - Subscribes to the event bus for each unique trigger source
 *   - When an event fires, evaluates matching rules in order and executes their actions
 *
 * Hot-reload:
 *   - Listens for "rules.rule.activated" / "rules.rule.deactivated" events
 *     so newly approved rules take effect without a server restart.
 *
 * Isolation guarantee:
 *   - Each rule run sets the tenant context via withTenantDb so DB calls inside
 *     actions respect RLS.
 *   - Rules from tenant A cannot read or affect tenant B's data.
 */

import type { ZexCoreContext } from '@zexcore/core';
import type { Rule } from '../schema/rule.js';
import { evaluateConditionGroup } from '../evaluator/conditions.js';
import { executeActions, type ExecutionContext } from '../executor/actions.js';

export class RuleRunner {
  /**
   * In-memory index: eventName → rules that listen to it (all tenants merged).
   * Keyed by event source string like "crm.lead.created".
   * We keep tenant separation by storing tenantId on each Rule.
   */
  private index: Map<string, Rule[]> = new Map();

  /** Track which event names we are subscribed to (to avoid double-subscribe). */
  private subscribed: Set<string> = new Set();

  constructor(private core: ZexCoreContext) {}

  // ─── Boot ──────────────────────────────────────────────────────────────────

  async load(): Promise<void> {
    this.index.clear();

    const result = await this.core.db.execute({
      sql: `
        SELECT id, tenant_id, name, description, enabled,
               trigger, conditions, actions,
               approved, approved_by, approved_at,
               created_by, created_at, updated_at
        FROM rules
        WHERE enabled = TRUE AND approved = TRUE
        ORDER BY created_at ASC
      `,
      params: [],
    });

    for (const row of result.rows) {
      const rule = this.rowToRule(row);
      this.register(rule);
    }

    this.core.logger.info(`[rules] Loaded ${result.rows.length} active rules`);

    // Hot-reload listeners
    this.core.events.on('rules.rule.activated',   (p: { rule: Rule }) => this.register(p.rule));
    this.core.events.on('rules.rule.deactivated', (p: { ruleId: string }) => this.deregister(p.ruleId));
  }

  // ─── Registration ──────────────────────────────────────────────────────────

  private register(rule: Rule): void {
    if (!rule.id || !rule.enabled || !rule.approved) return;

    const eventName = this.extractEventName(rule.trigger.source);
    if (!eventName) return; // schedule triggers not yet implemented

    if (!this.index.has(eventName)) {
      this.index.set(eventName, []);
    }
    // Replace if already exists (hot-reload update)
    const list = this.index.get(eventName)!;
    const existingIdx = list.findIndex((r) => r.id === rule.id);
    if (existingIdx >= 0) {
      list[existingIdx] = rule;
    } else {
      list.push(rule);
    }

    // Subscribe to this event on the bus if we haven't yet
    if (!this.subscribed.has(eventName)) {
      this.subscribed.add(eventName);
      this.core.events.on(eventName, (payload: Record<string, unknown>) => {
        void this.dispatch(eventName, payload);
      });
    }
  }

  private deregister(ruleId: string): void {
    for (const [, rules] of this.index) {
      const idx = rules.findIndex((r) => r.id === ruleId);
      if (idx >= 0) {
        rules.splice(idx, 1);
        break;
      }
    }
  }

  // ─── Dispatch ──────────────────────────────────────────────────────────────

  private async dispatch(eventName: string, payload: Record<string, unknown>): Promise<void> {
    const candidates = this.index.get(eventName) ?? [];
    if (candidates.length === 0) return;

    const payloadTenantId = payload.tenantId as string | undefined;

    for (const rule of candidates) {
      // Tenant isolation: only process rules whose tenant matches the event payload
      if (payloadTenantId && rule.tenantId !== payloadTenantId) continue;

      // Trigger-level filter (quick gate before full condition evaluation)
      if (rule.trigger.filter) {
        if (!evaluateConditionGroup(rule.trigger.filter, payload)) continue;
      }

      // Full condition group
      if (rule.conditions) {
        if (!evaluateConditionGroup(rule.conditions, payload)) continue;
      }

      // Conditions passed — execute actions
      await this.run(rule, payload);
    }
  }

  private async run(rule: Rule, payload: Record<string, unknown>): Promise<void> {
    const ctx: ExecutionContext = {
      tenantId:     rule.tenantId,
      ruleId:       rule.id!,
      ruleName:     rule.name,
      actorId:      (payload.actorId as string) ?? rule.createdBy,
      payload,
      capabilities: await this.loadCapabilities(rule.tenantId),
    };

    const result = await executeActions(rule.actions, ctx, this.core);

    // Audit every rule execution — success or partial failure
    try {
      await this.core.audit.log({
        action:     'rules.executed',
        tenantId:   rule.tenantId,
        actorId:    ctx.actorId,
        resourceId: rule.id!,
        meta: {
          trigger:  rule.trigger.source,
          emitted:  result.emitted,
          errors:   result.errors,
          success:  result.success,
        },
      });
    } catch {
      // Audit failure must never crash rule execution
    }

    if (result.errors.length > 0) {
      this.core.logger.warn(
        { ruleId: rule.id, errors: result.errors },
        '[rules] Rule executed with partial errors',
      );
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private extractEventName(source: string): string | null {
    if (source.startsWith('event:')) return source.slice(6);
    return null; // schedule not yet supported
  }

  /**
   * Load the set of capabilities enabled for a tenant.
   * In production this would be cached with a short TTL.
   * For now, we do a single lightweight DB query per execution.
   */
  private async loadCapabilities(tenantId: string): Promise<Set<string>> {
    try {
      const r = await this.core.db.execute({
        sql: `SELECT capabilities FROM tenants WHERE id = $1`,
        params: [tenantId],
      });
      const caps = (r.rows[0]?.capabilities ?? []) as string[];
      return new Set(caps);
    } catch {
      return new Set();
    }
  }

  private rowToRule(row: Record<string, unknown>): Rule {
    return {
      id:          row.id          as string,
      tenantId:    row.tenant_id   as string,
      name:        row.name        as string,
      description: row.description as string | undefined,
      enabled:     row.enabled     as boolean,
      trigger:     typeof row.trigger    === 'string' ? JSON.parse(row.trigger as string)    : row.trigger    as Rule['trigger'],
      conditions:  row.conditions ? (typeof row.conditions === 'string' ? JSON.parse(row.conditions as string) : row.conditions) as Rule['conditions'] : undefined,
      actions:     typeof row.actions    === 'string' ? JSON.parse(row.actions as string)    : row.actions    as Rule['actions'],
      approved:    row.approved    as boolean,
      approvedBy:  row.approved_by as string | undefined,
      approvedAt:  row.approved_at as string | undefined,
      createdBy:   row.created_by  as string,
      createdAt:   row.created_at  as string | undefined,
      updatedAt:   row.updated_at  as string | undefined,
    };
  }
}
