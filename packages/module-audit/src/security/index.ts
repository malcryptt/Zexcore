import { createHash } from 'node:crypto';
import type { AuditFinding, FindingEvidence } from '../types.js';

export interface SecurityEvaluationContext {
  tenantId: string;
  users: Array<{
    id: string;
    email: string;
    role: string;
    mfaEnabled: boolean;
    lastLoginAt?: string;
    createdAt: string;
  }>;
  apiKeys: Array<{
    id: string;
    name: string;
    createdAt: string;
    lastUsedAt?: string;
    expiresAt?: string;
  }>;
  devices: Array<{
    id: string;
    name: string;
    status: 'online' | 'offline';
    lastSeen: string;
    lastSeenTimestampMs?: number;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    actorId?: string;
    ipAddress?: string;
    timestamp: string;
    details?: Record<string, any>;
  }>;
  forms: Array<{
    id: string;
    name: string;
    hasRateLimit: boolean;
    rateLimitRps?: number;
    isPublic: boolean;
  }>;
  siteSettings: {
    enforceHsts: boolean;
    corsOrigins: string[];
    allowedMfaMethods: string[];
  };
}

function computeSimpleHash(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function runSecurityChecks(
  ctx: SecurityEvaluationContext,
  ruleVersions: Record<string, number> = {},
  params: Record<string, Record<string, any>> = {}
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const now = new Date();
  const nowIso = now.toISOString();

  // ── 1. Admins Without MFA (Locked Baseline) ──────────────────────────────────
  const adminMfaRuleKey = 'sec.posture.admin_mfa';
  const adminMfaVersion = ruleVersions[adminMfaRuleKey] || 1;
  const nonMfaAdmins = ctx.users.filter(
    (u) => (u.role === 'admin' || u.role === 'owner' || u.role === 'superadmin') && !u.mfaEnabled
  );

  if (nonMfaAdmins.length > 0) {
    const evidence: FindingEvidence = {
      ruleKey: adminMfaRuleKey,
      ruleVersion: adminMfaVersion,
      domain: 'security',
      occurredAt: nowIso,
      records: nonMfaAdmins.map((u) => ({
        id: u.id,
        type: 'user',
        details: { email: u.email, role: u.role, mfaEnabled: false },
      })),
      calculatedValues: { unshieldedAdminCount: nonMfaAdmins.length },
      reproductionCommand: `zex audit check --rule=${adminMfaRuleKey} --v=${adminMfaVersion}`,
      cryptographicHash: computeSimpleHash(`admin_mfa_${nonMfaAdmins.map((u) => u.id).join('_')}`),
    };

    findings.push({
      id: `finding-sec-mfa-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: adminMfaRuleKey,
      ruleName: 'Administrators Without Enforced Multi-Factor Authentication',
      ruleVersion: adminMfaVersion,
      domain: 'security',
      severity: 'critical',
      title: `${nonMfaAdmins.length} Administrator account(s) lack Multi-Factor Authentication`,
      description:
        'Privileged admin accounts without MFA leave the workspace exposed to credential stuffing and session hijacking.',
      evidence,
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  // ── 2. Dormant / Unused Accounts (>90 days) ─────────────────────────────────
  const dormantDaysThreshold = params['sec.posture.dormant_accounts']?.daysThreshold ?? 90;
  const dormantRuleKey = 'sec.posture.dormant_accounts';
  const dormantVersion = ruleVersions[dormantRuleKey] || 1;
  const cutoffMs = now.getTime() - dormantDaysThreshold * 24 * 60 * 60 * 1000;

  const dormantUsers = ctx.users.filter((u) => {
    if (!u.lastLoginAt) {
      const createdTime = new Date(u.createdAt).getTime();
      return createdTime < cutoffMs;
    }
    return new Date(u.lastLoginAt).getTime() < cutoffMs;
  });

  if (dormantUsers.length > 0) {
    findings.push({
      id: `finding-sec-dormant-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: dormantRuleKey,
      ruleName: 'Dormant Accounts Exceeding Inactivity Threshold',
      ruleVersion: dormantVersion,
      domain: 'security',
      severity: 'medium',
      title: `${dormantUsers.length} Inactive account(s) detected (> ${dormantDaysThreshold} days)`,
      description:
        'Stale accounts retain access credentials and tokens despite lack of operational activity, expanding the attack surface.',
      evidence: {
        ruleKey: dormantRuleKey,
        ruleVersion: dormantVersion,
        domain: 'security',
        occurredAt: nowIso,
        records: dormantUsers.map((u) => ({
          id: u.id,
          type: 'user',
          details: { email: u.email, lastLoginAt: u.lastLoginAt || 'never' },
        })),
        calculatedValues: { dormantThresholdDays: dormantDaysThreshold, count: dormantUsers.length },
        reproductionCommand: `zex audit check --rule=${dormantRuleKey} --v=${dormantVersion}`,
        cryptographicHash: computeSimpleHash(`dormant_${dormantUsers.length}`),
      },
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  // ── 3. Stale API Keys (>180 days) ──────────────────────────────────────────
  const staleKeyDays = params['sec.posture.stale_keys']?.daysThreshold ?? 180;
  const staleKeyRuleKey = 'sec.posture.stale_keys';
  const staleKeyVersion = ruleVersions[staleKeyRuleKey] || 1;
  const keyCutoffMs = now.getTime() - staleKeyDays * 24 * 60 * 60 * 1000;

  const staleKeys = ctx.apiKeys.filter((k) => new Date(k.createdAt).getTime() < keyCutoffMs);
  if (staleKeys.length > 0) {
    findings.push({
      id: `finding-sec-stale-keys-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: staleKeyRuleKey,
      ruleName: 'Stale API Keys Without Rotation',
      ruleVersion: staleKeyVersion,
      domain: 'security',
      severity: 'high',
      title: `${staleKeys.length} API Key(s) exceed ${staleKeyDays}-day rotation requirement`,
      description:
        'Unrotated API keys increase blast radius if leaked in build scripts, environment files, or repository commits.',
      evidence: {
        ruleKey: staleKeyRuleKey,
        ruleVersion: staleKeyVersion,
        domain: 'security',
        occurredAt: nowIso,
        records: staleKeys.map((k) => ({
          id: k.id,
          type: 'api_key',
          details: { name: k.name, createdAt: k.createdAt },
        })),
        calculatedValues: { staleKeysCount: staleKeys.length },
        reproductionCommand: `zex audit check --rule=${staleKeyRuleKey} --v=${staleKeyVersion}`,
        cryptographicHash: computeSimpleHash(`stale_keys_${staleKeys.length}`),
      },
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  // ── 4. IoT Devices Silent Exceeding Heartbeat Deadline ────────────────────────
  const silentMinutes = params['sec.posture.silent_devices']?.timeoutMinutes ?? 30;
  const silentRuleKey = 'sec.posture.silent_devices';
  const silentVersion = ruleVersions[silentRuleKey] || 1;
  const silentDevices = ctx.devices.filter((d) => {
    if (d.status === 'offline') return true;
    const lastSeenMs = d.lastSeenTimestampMs || (d.lastSeen ? new Date(d.lastSeen).getTime() : 0);
    return lastSeenMs > 0 && now.getTime() - lastSeenMs > silentMinutes * 60 * 1000;
  });

  if (silentDevices.length > 0) {
    findings.push({
      id: `finding-sec-silent-dev-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: silentRuleKey,
      ruleName: 'Fleet Edge Devices Silent Exceeding Heartbeat Window',
      ruleVersion: silentVersion,
      domain: 'security',
      severity: 'medium',
      title: `${silentDevices.length} Hardware device(s) silent or unresponsive`,
      description:
        'Telemetry heartbeats have timed out. Hardware sensors or edge gateways may have suffered power loss or physical tampering.',
      evidence: {
        ruleKey: silentRuleKey,
        ruleVersion: silentVersion,
        domain: 'security',
        occurredAt: nowIso,
        records: silentDevices.map((d) => ({
          id: d.id,
          type: 'iot_device',
          details: { name: d.name, lastSeen: d.lastSeen, status: d.status },
        })),
        calculatedValues: { timeoutMinutes: silentMinutes, silentCount: silentDevices.length },
        reproductionCommand: `zex audit check --rule=${silentRuleKey} --v=${silentVersion}`,
        cryptographicHash: computeSimpleHash(`silent_dev_${silentDevices.length}`),
      },
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  // ── 5. Permission Changes at Odd Hours (22:00 - 06:00) ──────────────────────
  const oddHourRuleKey = 'sec.activity.odd_hour_permission_change';
  const oddHourVersion = ruleVersions[oddHourRuleKey] || 1;
  const oddHourLogs = ctx.auditLogs.filter((l) => {
    if (!l.action.startsWith('permission.') && !l.action.startsWith('role.')) return false;
    const hour = new Date(l.timestamp).getUTCHours();
    return hour >= 22 || hour < 6;
  });

  if (oddHourLogs.length > 0) {
    findings.push({
      id: `finding-sec-odd-perms-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: oddHourRuleKey,
      ruleName: 'Privileged Role Escalation Outside Normal Business Hours',
      ruleVersion: oddHourVersion,
      domain: 'security',
      severity: 'high',
      title: `${oddHourLogs.length} Permission modification(s) executed during night hours (22:00-06:00 UTC)`,
      description:
        'Privilege escalation during off-hours is a primary indicator of insider anomaly or compromised administrative sessions.',
      evidence: {
        ruleKey: oddHourRuleKey,
        ruleVersion: oddHourVersion,
        domain: 'security',
        occurredAt: nowIso,
        records: oddHourLogs.map((l) => ({
          id: l.id,
          type: 'audit_log',
          details: { action: l.action, actorId: l.actorId, timestamp: l.timestamp },
        })),
        calculatedValues: { offHourIncidents: oddHourLogs.length },
        reproductionCommand: `zex audit check --rule=${oddHourRuleKey} --v=${oddHourVersion}`,
        cryptographicHash: computeSimpleHash(`odd_perms_${oddHourLogs.length}`),
      },
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  // ── 6. Public Forms Without Rate Limits ──────────────────────────────────────
  const unshieldedForms = ctx.forms.filter((f) => f.isPublic && !f.hasRateLimit);
  const unshieldedFormRuleKey = 'sec.perimeter.form_rate_limits';
  const unshieldedFormVersion = ruleVersions[unshieldedFormRuleKey] || 1;

  if (unshieldedForms.length > 0) {
    findings.push({
      id: `finding-sec-forms-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: unshieldedFormRuleKey,
      ruleName: 'Public Web Forms Without Anti-Automation Rate Limits',
      ruleVersion: unshieldedFormVersion,
      domain: 'security',
      severity: 'medium',
      title: `${unshieldedForms.length} Public lead/contact form(s) exposed without rate throttling`,
      description:
        'Forms lacking IP and session rate-limiting can be targeted by botnets for carding testing, spam injection, or email bombing.',
      evidence: {
        ruleKey: unshieldedFormRuleKey,
        ruleVersion: unshieldedFormVersion,
        domain: 'security',
        occurredAt: nowIso,
        records: unshieldedForms.map((f) => ({
          id: f.id,
          type: 'form',
          details: { name: f.name, isPublic: f.isPublic, hasRateLimit: false },
        })),
        calculatedValues: { unshieldedCount: unshieldedForms.length },
        reproductionCommand: `zex audit check --rule=${unshieldedFormRuleKey} --v=${unshieldedFormVersion}`,
        cryptographicHash: computeSimpleHash(`unshielded_forms_${unshieldedForms.length}`),
      },
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  // ── 7. Permissive Wildcard CORS or Insecure Settings ────────────────────────
  if (ctx.siteSettings.corsOrigins.includes('*')) {
    const corsRuleKey = 'sec.posture.wildcard_cors';
    const corsVersion = ruleVersions[corsRuleKey] || 1;
    findings.push({
      id: `finding-sec-cors-${ctx.tenantId}`,
      tenantId: ctx.tenantId,
      ruleKey: corsRuleKey,
      ruleName: 'Permissive Wildcard Access-Control-Allow-Origin (*)',
      ruleVersion: corsVersion,
      domain: 'security',
      severity: 'high',
      title: 'Wildcard CORS origin enabled across authenticated API endpoints',
      description:
        'CORS set to "*" permits arbitrary cross-origin sites to execute authenticated requests if cookies or headers are accepted.',
      evidence: {
        ruleKey: corsRuleKey,
        ruleVersion: corsVersion,
        domain: 'security',
        occurredAt: nowIso,
        records: [{ id: 'site_settings', type: 'configuration', details: { corsOrigins: ctx.siteSettings.corsOrigins } }],
        calculatedValues: { wildcardPresent: true },
        reproductionCommand: `zex audit check --rule=${corsRuleKey} --v=${corsVersion}`,
        cryptographicHash: computeSimpleHash('cors_wildcard_detected'),
      },
      status: 'open',
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  return findings;
}
