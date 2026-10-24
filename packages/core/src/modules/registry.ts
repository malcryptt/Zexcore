import type { FastifyInstance } from 'fastify';
import type { ZexModule, ZexCoreContext } from './types.js';
import { getDb, getSqlClient } from '../db/client.js';
import { globalEventBus } from '../events/bus.js';
import { logAuditEvent } from '../audit/logger.js';
import { getTenantContext } from '../tenancy/context.js';

export function createDefaultCoreContext(): ZexCoreContext {
  const db = getDb();
  const sqlClient = getSqlClient();

  const wrappedDb = new Proxy(db, {
    get(target, prop, receiver) {
      if (prop === 'execute') {
        return async (queryOrSql: any) => {
          // Modules pass raw queries as { sql, params } or { text, params }.
          // Drizzle SQL objects (which expose getSQL) fall through to Drizzle itself.
          const rawText: string | undefined =
            queryOrSql && typeof queryOrSql === 'object' && typeof queryOrSql.getSQL !== 'function'
              ? typeof queryOrSql.sql === 'string'
                ? queryOrSql.sql
                : typeof queryOrSql.text === 'string'
                  ? queryOrSql.text
                  : undefined
              : undefined;

          if (rawText !== undefined) {
            const params = (queryOrSql.params || queryOrSql.values || []) as unknown[];

            // Resolve tenant ID from query metadata or AsyncLocalStorage context
            const ctx = getTenantContext();
            const tenantId = (queryOrSql as any).tenantId || ctx?.tenantId;

            if (tenantId) {
              // Wrap in a transaction so SET LOCAL scopes to this query only.
              // This ensures RLS WITH CHECK and USING policies evaluate correctly
              // without contaminating the connection pool between requests.
              const result = await sqlClient.begin(async (tx) => {
                // Use parameterized set_config to avoid SQL injection
                await tx.unsafe(
                  `SELECT set_config('app.current_tenant_id', $1, true)`,
                  [tenantId],
                );
                await tx.unsafe(`SELECT set_config('app.bypass_rls', 'off', true)`);
                return await tx.unsafe(rawText, params as any);
              });
              return { rows: result };
            }

            // No tenant context — run without RLS context (schema init, module onInit, etc.)
            const rows = await sqlClient.unsafe(rawText, params as any);
            return { rows };
          }
          return (target as any).execute(queryOrSql);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });



  return {
    db: wrappedDb as any,
    events: globalEventBus,
    audit: {
      log: async (entry: any) => {
        await logAuditEvent({
          tenantId: entry.tenantId,
          userId: entry.actorId ?? entry.userId ?? 'system',
          principalType: entry.principalType ?? 'tenant_user',
          action: entry.action,
          entity: entry.entity ?? entry.resourceId ?? 'unknown',
          entityId: entry.resourceId ?? entry.entityId,
          changes: entry.meta ?? entry.changes ?? {},
        });
      },
    },
    logger: console,
  };
}

export class ModuleRegistry {
  private modules = new Map<string, ZexModule>();
  private initialized = false;

  /**
   * Registers a module into the registry.
   * Idempotent: if the module is already registered under the same name, this is a no-op.
   * (Prevents double-registration errors in test environments where createServer() is called
   * multiple times within the same process and globalModuleRegistry is a shared singleton.)
   */
  public register(module: ZexModule): this {
    if (this.modules.has(module.name)) {
      // Already registered — skip silently. This is intentional for test isolation.
      return this;
    }
    this.modules.set(module.name, module);
    return this;
  }

  /**
   * Resets the registry back to an empty, uninitialized state.
   * ONLY intended for use in test teardown (afterAll hooks).
   */
  public reset(): void {
    this.modules.clear();
    this.initialized = false;
  }

  /**
   * Retrieves a module by name.
   */
  public get(name: string): ZexModule | undefined {
    return this.modules.get(name);
  }

  /**
   * Returns all registered modules in topological dependency order.
   */
  public getAll(): ZexModule[] {
    const list: ZexModule[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (mod: ZexModule) => {
      if (visiting.has(mod.name)) {
        throw new Error(`Circular dependency detected in module '${mod.name}'`);
      }
      if (!visited.has(mod.name)) {
        visiting.add(mod.name);
        for (const dep of mod.dependsOn || []) {
          const depModule = this.modules.get(dep);
          if (!depModule) {
            throw new Error(`Module '${mod.name}' depends on unregistered module '${dep}'`);
          }
          visit(depModule);
        }
        visiting.delete(mod.name);
        visited.add(mod.name);
        list.push(mod);
      }
    };

    for (const mod of this.modules.values()) {
      visit(mod);
    }

    return list;
  }

  /**
   * Initializes all registered modules.
   */
  public async initAll(context?: ZexCoreContext): Promise<void> {
    if (this.initialized) return;

    const ctx: ZexCoreContext = context || createDefaultCoreContext();

    const sorted = this.getAll();
    for (const mod of sorted) {
      if (mod.onInit) {
        await mod.onInit(ctx);
      }
    }

    this.initialized = true;
  }

  /**
   * Mounts all module routes onto a Fastify server instance.
   */
  public async registerAllRoutes(server: FastifyInstance, context?: ZexCoreContext): Promise<void> {
    const ctx: ZexCoreContext = context || createDefaultCoreContext();

    const sorted = this.getAll();
    for (const mod of sorted) {
      if (mod.registerRoutes) {
        await mod.registerRoutes(server, ctx);
      }
    }
  }

  /**
   * Graceful shutdown of all modules in reverse order.
   */
  public async shutdownAll(context?: ZexCoreContext): Promise<void> {
    const ctx: ZexCoreContext = context || createDefaultCoreContext();

    const sorted = this.getAll().reverse();
    for (const mod of sorted) {
      if (mod.onShutdown) {
        await mod.onShutdown(ctx);
      }
    }
    this.initialized = false;
  }
}

export const globalModuleRegistry = new ModuleRegistry();
