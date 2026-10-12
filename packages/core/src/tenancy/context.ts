import { AsyncLocalStorage } from 'node:async_hooks';
import type { TenantContext } from './types.js';

const tenantStorage = new AsyncLocalStorage<TenantContext>();

/**
 * Runs an asynchronous callback within an isolated tenant execution context.
 */
export function runWithTenant<T>(context: TenantContext, fn: () => T | Promise<T>): T | Promise<T> {
  return tenantStorage.run(context, fn);
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
