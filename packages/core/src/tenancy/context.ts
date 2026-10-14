import { AsyncLocalStorage } from 'node:async_hooks';
import type { TenantContext } from './types.js';

const tenantStorage = new AsyncLocalStorage<TenantContext>();

/**
 * Runs an asynchronous callback within an isolated tenant execution context.
 * Use this when you have a clear async boundary (e.g., background jobs).
 */
export function runWithTenant<T>(context: TenantContext, fn: () => T | Promise<T>): T | Promise<T> {
  return tenantStorage.run(context, fn);
}

/**
 * Sets the tenant context for the ENTIRE remaining async execution chain of the
 * current async context (using AsyncLocalStorage.enterWith).
 *
 * This is the correct mechanism for Fastify request hooks — call it in onRequest
 * and the context will be available in all subsequent hooks and the route handler.
 *
 * ⚠️  Only call this from within an async context that you fully own (i.e., a
 * Fastify hook). Do NOT call from shared utility code.
 */
export function enterTenantContext(context: TenantContext): void {
  tenantStorage.enterWith(context);
}

/**
 * Retrieves the current tenant context if one exists.
 */
export function getTenantContext(): TenantContext | undefined {
  return tenantStorage.getStore();
}

/**
 * Requires a valid active tenant context, throwing an error if missing.
 */
export function requireTenantContext(): TenantContext {
  const context = tenantStorage.getStore();
  if (!context || !context.tenantId) {
    throw new Error('Tenant context is required but was not found in current execution scope.');
  }
  return context;
}

