import type {
  AuditFinding,
  AuditRun,
} from '../types.js';
import { runSecurityChecks, type SecurityEvaluationContext } from '../security/index.js';
import { runFinanceChecks, type FinanceEvaluationContext } from '../finance/index.js';

export interface AuditEngineContext {
  tenantId: string;
  security: SecurityEvaluationContext;
  finance: FinanceEvaluationContext;
  ruleVersions?: Record<string, number>;
  ruleParams?: Record<string, Record<string, any>>;
}

/**
 * Calculates a 0-100 score based on finding severities
 * Base score: 100
 * Critical: -25 pts
 * High: -12 pts
 * Medium: -5 pts
 * Low: -2 pts
 */
export function calculateDomainScore(findings: AuditFinding[]): number {
  const openFindings = findings.filter((f) => f.status === 'open' || f.status === 'investigating');
  let penalty = 0;

  for (const f of openFindings) {
    switch (f.severity) {
      case 'critical':
        penalty += 25;
        break;
      case 'high':
        penalty += 12;
        break;
      case 'medium':
        penalty += 5;
        break;
      case 'low':
        penalty += 2;
        break;
      default:
        break;
    }
  }

  return Math.max(0, 100 - penalty);
}

export function executeAuditRun(ctx: AuditEngineContext, dryRun = false): {
  run: AuditRun;
  findings: AuditFinding[];
} {
  const startedAt = new Date();
  const startTime = startedAt.getTime();

  // Run security checks
  const secFindings = runSecurityChecks(
    ctx.security,
    ctx.ruleVersions || {},
    ctx.ruleParams || {}
  );

  // Run finance checks
  const finFindings = runFinanceChecks(
    ctx.finance,
    ctx.ruleVersions || {},
    ctx.ruleParams || {}
  );

  const allFindings = [...secFindings, ...finFindings];
  const finishedAt = new Date();
  const durationMs = finishedAt.getTime() - startTime;

  const securityScore = calculateDomainScore(secFindings);
  const financeScore = calculateDomainScore(finFindings);
  const overallScore = Math.round((securityScore + financeScore) / 2);

  const run: AuditRun = {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    tenantId: ctx.tenantId,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs,
    rulesEvaluated: 12,
    ruleVersions: ctx.ruleVersions || {},
    findingsGenerated: allFindings.length,
    securityScore,
    financeScore,
    overallScore,
    dryRun,
  };

  return { run, findings: allFindings };
}

/**
 * Generates historical score trend data (past 30 days) based on current score
 */
export function generateScoreTrend(
  currentSec: number,
  currentFin: number
): Array<{ date: string; security: number; finance: number; overall: number }> {
  const trend: Array<{ date: string; security: number; finance: number; overall: number }> = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0] ?? '';
    
    // Simulate slight natural variance over the past 30 days leading to current score
    const varianceFactor = (30 - i) / 30;
    const secVal = Math.min(100, Math.max(50, Math.round(currentSec - (1 - varianceFactor) * 8 + (Math.sin(i) * 3))));
    const finVal = Math.min(100, Math.max(50, Math.round(currentFin - (1 - varianceFactor) * 6 + (Math.cos(i) * 2))));
    const overall = Math.round((secVal + finVal) / 2);

    trend.push({
      date: dateStr,
      security: i === 0 ? currentSec : secVal,
      finance: i === 0 ? currentFin : finVal,
      overall: i === 0 ? Math.round((currentSec + currentFin) / 2) : overall,
    });
  }

  return trend;
}
