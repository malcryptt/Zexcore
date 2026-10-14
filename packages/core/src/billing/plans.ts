/**
 * ZexCore Sovereign Platform Subscription Plans & Feature Entitlements
 */

export type PlanTier = 'starter' | 'indie' | 'growth' | 'scale' | 'enterprise';
export type BillingCycle = 'monthly' | 'annual';

export interface PlanFeature {
  name: string;
  included: boolean;
  notes?: string;
}

export interface PlanConfig {
  id: PlanTier;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number; // Price per month billed annually (10% discount)
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
  maxTenants: number;
  allowedModules: string[];
  features: Record<string, boolean>;
  badge?: string;
  highlight?: boolean;
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'Ideal for single-tenant prototypes and developer exploration.',
    monthlyPrice: 49,
    annualPrice: 44,
    maxTenants: 5,
    allowedModules: ['core', 'rules'],
    features: {
      rls_tenancy: true,
      rules_engine: true,
      audit_ledger: true,
      ssrf_filter: true,
      iot_telemetry: false,
      crm_pipeline: false,
      gdpr_vault: false,
      envelope_encryption: false,
      blind_index: false,
      dedicated_cluster: false,
    },
  },
  indie: {
    id: 'indie',
    name: 'Indie',
    tagline: 'For independent software vendors scaling vertical SaaS products.',
    monthlyPrice: 149,
    annualPrice: 134,
    maxTenants: 25,
    allowedModules: ['core', 'rules', 'iot'],
    features: {
      rls_tenancy: true,
      rules_engine: true,
      audit_ledger: true,
      ssrf_filter: true,
      iot_telemetry: true,
      crm_pipeline: false,
      gdpr_vault: false,
      envelope_encryption: false,
      blind_index: false,
      dedicated_cluster: false,
    },
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    tagline: 'High-growth platforms requiring full CRM pipelines and cryptographic security.',
    monthlyPrice: 499,
    annualPrice: 449,
    maxTenants: Infinity,
    allowedModules: ['core', 'rules', 'iot', 'crm'],
    features: {
      rls_tenancy: true,
      rules_engine: true,
      audit_ledger: true,
      ssrf_filter: true,
      iot_telemetry: true,
      crm_pipeline: true,
      gdpr_vault: false,
      envelope_encryption: true,
      blind_index: true,
      dedicated_cluster: false,
    },
    badge: 'MOST POPULAR',
    highlight: true,
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    tagline: 'Full multi-tenant sovereign stack with complete GDPR compliance vault.',
    monthlyPrice: 1299,
    annualPrice: 1169,
    maxTenants: Infinity,
    allowedModules: ['core', 'rules', 'iot', 'crm', 'compliance'],
    features: {
      rls_tenancy: true,
      rules_engine: true,
      audit_ledger: true,
      ssrf_filter: true,
      iot_telemetry: true,
      crm_pipeline: true,
      gdpr_vault: true,
      envelope_encryption: true,
      blind_index: true,
      dedicated_cluster: false,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Mission-critical deployments with dedicated clusters and custom SLA.',
    monthlyPrice: 3500,
    annualPrice: 3150,
    maxTenants: Infinity,
    allowedModules: ['core', 'rules', 'iot', 'crm', 'compliance', 'dedicated'],
    features: {
      rls_tenancy: true,
      rules_engine: true,
      audit_ledger: true,
      ssrf_filter: true,
      iot_telemetry: true,
      crm_pipeline: true,
      gdpr_vault: true,
      envelope_encryption: true,
      blind_index: true,
      dedicated_cluster: true,
      custom_sla: true,
    },
  },
};

export function getPlanConfig(tier: string | undefined): PlanConfig {
  const normalized = (tier?.toLowerCase() || 'starter') as PlanTier;
  return PLAN_CONFIGS[normalized] || PLAN_CONFIGS.starter;
}

export function isModuleAllowedForPlan(tier: string | undefined, moduleId: string): boolean {
  const plan = getPlanConfig(tier);
  // Normalization: 'module-iot' -> 'iot', 'module-crm' -> 'crm'
  const cleanModule = moduleId.replace(/^@?zexcore\//, '').replace(/^module-/, '');
  return plan.allowedModules.includes(cleanModule) || plan.allowedModules.includes(moduleId);
}

export function isFeatureAllowedForPlan(tier: string | undefined, featureKey: string): boolean {
  const plan = getPlanConfig(tier);
  return Boolean(plan.features[featureKey]);
}

export function getMinimumPlanForModule(moduleId: string): PlanTier {
  const clean = moduleId.replace(/^@?zexcore\//, '').replace(/^module-/, '');
  if (clean === 'compliance') return 'scale';
  if (clean === 'crm') return 'growth';
  if (clean === 'iot') return 'indie';
  return 'starter';
}
