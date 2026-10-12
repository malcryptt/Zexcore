export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  userId?: string;
  userRole?: string;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}
