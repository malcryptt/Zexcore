import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { ZexCoreContext } from '@zexcore/core';
import { BASELINE_AUDIT_RULES } from '../rules/index.js';
import { executeAuditRun, generateScoreTrend, type AuditEngineContext } from '../engine/index.js';
import { generateEvidencePackBundle } from '../reports/index.js';
import type { FindingStatus, FindingSeverity } from '../types.js';

export function registerAuditRoutes(server: FastifyInstance, core: ZexCoreContext): void {
  const guard = { preHandler: [server.authenticate, server.requireCapability('audit:read')] };
  const requireTenant = (request: FastifyRequest, reply: FastifyReply): string | null => {
    const id = (request as any).tenant?.id as string | undefined;
    if (!id) {
      reply.status(400).send({ error: 'Tenant context required' });
      return null;
    }
    return id;
  };
  const allowSimulation = process.env.NODE_ENV !== 'production' || process.env.AUDIT_ALLOW_SIMULATION === 'true';
  // ── HEALTH ──────────────────────────────────────────────────────────────────
  server.get('/api/audit/health', async () => {
    return {
      status: 'operational',
      module: '@zexcore/module-audit',
      version: '1.0.0',
      rulesLoaded: BASELINE_AUDIT_RULES.length,
      timestamp: new Date().toISOString(),
    };
  });

  // ── RULES LIST ──────────────────────────────────────────────────────────────
  server.get('/api/audit/rules', guard, async () => {
    return {
      rules: BASELINE_AUDIT_RULES,
      total: BASELINE_AUDIT_RULES.length,
    };
  });

  // ── RUN AUDIT SUITE ─────────────────────────────────────────────────────────
  server.post<{
    Body: {
      domain?: string;
      dryRun?: boolean;
      mockContext?: Partial<AuditEngineContext>;
    };
  }>('/api/audit/check', guard, async (request: FastifyRequest<{
    Body: {
      domain?: string;
      dryRun?: boolean;
      mockContext?: Partial<AuditEngineContext>;
    };
  }>, reply: FastifyReply) => {
    const tenantId = requireTenant(request, reply);
    if (!tenantId) return reply;
    const { dryRun = false, mockContext } = request.body || {};

    // The engine is not yet wired to live tenant data (users/MFA, ledger, devices).
    // Never produce a "clean" score from invented fixtures in production.
    if (!allowSimulation) {
      return reply.status(501).send({
        error: 'Audit engine is not connected to live tenant data yet',
        code: 'AUDIT_DATA_SOURCES_NOT_CONNECTED',
      });
    }

    const defaultEngineCtx: AuditEngineContext = {
      tenantId,
      security: {
        tenantId,
        users: mockContext?.security?.users || [
          { id: 'usr-admin-1', email: 'admin@workspace.local', role: 'admin', mfaEnabled: true, createdAt: '2026-01-01T00:00:00Z' },
        ],
        apiKeys: mockContext?.security?.apiKeys || [
          { id: 'key-1', name: 'Primary Ingest API Key', createdAt: new Date().toISOString(), lastUsedAt: new Date().toISOString() },
        ],
        devices: mockContext?.security?.devices || [
          { id: 'dev-01', name: 'Edge Gateway Alpha', status: 'online', lastSeen: new Date().toISOString() },
        ],
        auditLogs: mockContext?.security?.auditLogs || [],
        forms: mockContext?.security?.forms || [
          { id: 'form-contact', name: 'Contact Us', hasRateLimit: true, rateLimitRps: 5, isPublic: true },
        ],
        siteSettings: mockContext?.security?.siteSettings || {
          enforceHsts: true,
          corsOrigins: ['https://workspace.local'],
          allowedMfaMethods: ['totp', 'webauthn'],
        },
      },
      finance: {
        tenantId,
        invoices: mockContext?.finance?.invoices || [],
        payments: mockContext?.finance?.payments || [],
        refunds: mockContext?.finance?.refunds || [],
        shifts: mockContext?.finance?.shifts || [],
        ledger: mockContext?.finance?.ledger || [],
      },
    };

    const result = executeAuditRun(defaultEngineCtx, dryRun);
    (result.run as any).simulated = true;

    // If not a dry run, record run in database
    if (!dryRun) {
      try {
        await core.db.execute({
          text: `
            INSERT INTO audit_runs (
              id, tenant_id, started_at, finished_at, duration_ms,
              rules_evaluated, rule_versions, findings_generated,
              security_score, finance_score, overall_score, dry_run
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `,
          values: [
            result.run.id,
            tenantId,
            result.run.startedAt,
            result.run.finishedAt,
            result.run.durationMs,
            result.run.rulesEvaluated,
            JSON.stringify(result.run.ruleVersions),
            result.run.findingsGenerated,
            result.run.securityScore,
            result.run.financeScore,
            result.run.overallScore,
            result.run.dryRun,
          ],
        });
      } catch (err: any) {
        core.logger.warn?.('[audit] Could not persist audit run to database (skipping in detached test mode): ' + err.message);
      }
    }

    return reply.send({
      run: result.run,
      findings: result.findings,
      scoreTrend: generateScoreTrend(result.run.securityScore, result.run.financeScore),
    });
  });

  // ── LIST RUNS ───────────────────────────────────────────────────────────────
  server.get('/api/audit/runs', guard, async (request: FastifyRequest, reply: FastifyReply) => {
    const tenant = (request as any).tenant;
    const tenantId = tenant?.id;

    if (!tenantId) {
      return reply.send({ runs: [] });
    }

    try {
      const rows = await core.db.execute({
        text: `SELECT * FROM audit_runs WHERE tenant_id = $1 ORDER BY started_at DESC LIMIT 50`,
        values: [tenantId],
      });
      return reply.send({ runs: rows.rows || [] });
    } catch {
      return reply.send({ runs: [] });
    }
  });

  // ── LIST FINDINGS ───────────────────────────────────────────────────────────
  server.get<{
    Querystring: {
      status?: FindingStatus;
      severity?: FindingSeverity;
      domain?: string;
    };
  }>('/api/audit/findings', guard, async (request, reply) => {
    const tenant = (request as any).tenant;
    const tenantId = tenant?.id;

    if (!tenantId) {
      return reply.send({ findings: [] });
    }

    const { status, severity, domain } = request.query;
    let query = `SELECT * FROM audit_findings WHERE tenant_id = $1`;
    const params: unknown[] = [tenantId];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (severity) {
      params.push(severity);
      query += ` AND severity = $${params.length}`;
    }
    if (domain) {
      params.push(domain);
      query += ` AND domain = $${params.length}`;
    }

    query += ` ORDER BY last_seen_at DESC LIMIT 100`;

    try {
      const rows = await core.db.execute({ text: query, values: params });
      return reply.send({ findings: rows.rows || [] });
    } catch {
      return reply.send({ findings: [] });
    }
  });

  // ── EXPORT EVIDENCE PACK ────────────────────────────────────────────────────
  server.post<{
    Body: {
      timeRange?: { start: string; end: string };
      generatedBy?: string;
    };
  }>('/api/audit/export', guard, async (request, reply) => {
    const tenantId = requireTenant(request, reply);
    if (!tenantId) return reply;
    if (!allowSimulation) {
      return reply.status(501).send({ error: 'Evidence export is not connected to live data yet', code: 'AUDIT_DATA_SOURCES_NOT_CONNECTED' });
    }
    const { timeRange, generatedBy = (request as any).user?.userId ?? 'unknown' } = request.body || {};

    const now = new Date();
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const defaultEnd = now.toISOString();

    const pack = generateEvidencePackBundle({
      tenantId,
      generatedBy,
      timeRange: timeRange || { start: defaultStart, end: defaultEnd },
      rules: BASELINE_AUDIT_RULES,
      findings: [],
      findingEvents: [],
      ledger: [],
      hashChainBlocks: [],
    });

    return reply.send(pack);
  });
}
