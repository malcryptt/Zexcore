import type { FastifyInstance } from 'fastify';
import type { ZexModule, ZexCoreContext } from './types.js';
import { getDb } from '../db/client.js';
import { globalEventBus } from '../events/bus.js';

export class ModuleRegistry {
  private modules = new Map<string, ZexModule>();
  private initialized = false;

  /**
   * Registers a module into the registry.
   */
  public register(module: ZexModule): this {
    if (this.modules.has(module.name)) {
      throw new Error(`Module '${module.name}' is already registered.`);
    }
    this.modules.set(module.name, module);
    return this;
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

    const ctx: ZexCoreContext = context || {
      db: getDb(),
      events: globalEventBus,
    };

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
    const ctx: ZexCoreContext = context || {
      db: getDb(),
      events: globalEventBus,
    };

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
    const ctx: ZexCoreContext = context || {
      db: getDb(),
      events: globalEventBus,
    };

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
