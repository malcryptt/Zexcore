import type { Tenant } from '../db/schema/tenants.js';

export function isFeatureEnabled(tenant: Tenant, featureKey: string): boolean {
  if (!tenant.config || !tenant.config.features) {
    return false;
  }
  return Boolean(tenant.config.features[featureKey]);
}

export function isModuleEnabled(tenant: Tenant, moduleKey: string): boolean {
  if (!tenant.config || !tenant.config.enabledModules) {
    // CMS is enabled by default for all tenants
    return moduleKey === 'cms';
  }
  return tenant.config.enabledModules.includes(moduleKey);
}
