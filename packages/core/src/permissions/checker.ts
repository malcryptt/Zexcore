import type { PrincipalType, TenantRole } from '../db/schema/memberships.js';
import { ROLE_CAPABILITIES, PRINCIPAL_DEFAULT_CAPABILITIES } from './roles.js';

export interface PrincipalSubject {
  principalType: PrincipalType;
  role?: TenantRole;
  capabilities?: string[];
  isPlatformAdmin?: boolean;
}

/**
 * Evaluates whether a principal has the requested capability.
 * All actors (users, public, devices, AI agents, platform admins) pass through this check.
 *
 * Privilege hierarchy:
 *   platform_admin / isPlatformAdmin — bypass ALL checks (cross-tenant super-admin)
 *   tenant_admin                     — bypass all module-level checks within their tenant
 *   role-based / explicit caps       — evaluated as listed
 *   device                           — only 'device:ingest'
 *   ai_agent                         — only 'ai:proposals:create'
 */
export function hasCapability(
  subject: PrincipalSubject,
  requiredCapability: string,
): boolean {
  // Hard invariant: AI agents can NEVER bypass the proposal constraint
  if (subject.principalType === 'ai_agent') {
    return requiredCapability === 'ai:proposals:create';
  }

  // Hard invariant: Devices can only ingest data
  if (subject.principalType === 'device') {
    return requiredCapability === 'device:ingest';
  }

  // Platform admin (flag OR principal type) bypasses all capability checks
  if (subject.isPlatformAdmin || subject.principalType === 'platform_admin') {
    return true;
  }

  // Tenant admin bypasses all capability checks within their own tenant scope
  if (subject.principalType === 'tenant_admin') {
    return true;
  }

  // Explicit capability override on subject
  if (subject.capabilities && subject.capabilities.includes(requiredCapability)) {
    return true;
  }

  // Role-based capability resolution (role: 'admin' also grants full module access)
  if (subject.role === 'admin' || subject.role === 'owner') {
    return true;
  }
  if (subject.role && ROLE_CAPABILITIES[subject.role]?.includes(requiredCapability)) {
    return true;
  }

  // Principal-type default resolution
  if (
    subject.principalType &&
    PRINCIPAL_DEFAULT_CAPABILITIES[subject.principalType]?.includes(requiredCapability)
  ) {
    return true;
  }

  return false;
}

/**
 * Asserts that the principal has the capability, throwing an Error if denied.
 */
export function requireCapability(subject: PrincipalSubject, requiredCapability: string): void {
  if (!hasCapability(subject, requiredCapability)) {
    throw new Error(
      `Access denied: Principal type '${subject.principalType}' lacks capability '${requiredCapability}'`,
    );
  }
}
