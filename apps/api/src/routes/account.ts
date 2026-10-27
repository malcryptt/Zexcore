import type { FastifyInstance } from 'fastify';
import { issueToken } from '../auth/session.js';
import { sendVerification } from './authSecurity.js';
import {
  hashPassword,
  getUserAccount,
  registerTenant,
  RegistrationError,
  withTenantDb,
  getUserProfileInTenant,
  getSqlClient,
  sql,
} from '@zexcore/core';

const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '123456789', '1234567890', 'qwertyuiop', 'iloveyou123',
  'letmein123', 'welcome123', 'admin12345', 'zexcore123', 'changeme123',
]);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function validatePassword(pw: string, email: string): string | null {
  if (pw.length < 10) return 'Password must be at least 10 characters.';
  if (pw.length > 128) return 'Password is too long.';
  if (COMMON_PASSWORDS.has(pw.toLowerCase())) return 'That password is too common.';
  if (pw.toLowerCase().includes(email.split('@')[0]!.toLowerCase()) && email.split('@')[0]!.length >= 4) {
    return 'Password must not contain your email name.';
  }
  return null;
}

export function registerAccountRoutes(server: FastifyInstance): void {
  // ── Self-service signup ───────────────────────────────────────────────────
  server.post<{ Body: { tenantName?: string; tenantSlug?: string; name?: string; email?: string; password?: string } }>(
    '/api/auth/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['tenantName', 'name', 'email', 'password'],
          properties: {
            tenantName: { type: 'string', minLength: 2, maxLength: 120 },
            tenantSlug: { type: 'string', maxLength: 40 },
            name: { type: 'string', minLength: 2, maxLength: 120 },
            email: { type: 'string', maxLength: 254 },
            password: { type: 'string', maxLength: 128 },
          },
        },
      },
    },
    async (request, reply) => {
      const b = request.body;
      const email = b.email!.toLowerCase().trim();
      const pwProblem = validatePassword(b.password!, email);
      if (pwProblem) return reply.status(400).send({ error: pwProblem, code: 'weak_password' });

      const slug = slugify(b.tenantSlug || b.tenantName!);
      try {
        const { tenantId, userId } = await registerTenant({
          slug,
          tenantName: b.tenantName!,
          email,
          userName: b.name!,
          passwordHash: await hashPassword(b.password!),
        });
        const token = await issueToken({ userId, tenantId, role: 'owner', principalType: 'tenant_user', isPlatformAdmin: false }, request);
        // Fire and forget: a mail problem must never block sign-up. The app shows a banner with a resend button.
        void sendVerification(server, { id: userId, email, name: b.name! });
        return reply.status(201).send({
          token,
          user: { id: userId, email, name: b.name },
          tenant: { id: tenantId, slug, name: b.tenantName, tier: 'free' },
          role: 'owner',
        });
      } catch (err) {
        if (err instanceof RegistrationError) {
          const map = {
            invalid_slug: [400, 'Workspace address must be 3–40 letters, numbers or hyphens.'],
            reserved_slug: [400, 'That workspace address is reserved. Please choose another.'],
            invalid_email: [400, 'Please enter a valid email address.'],
            slug_taken: [409, 'That workspace address is already taken.'],
            // Deliberately vague: do not confirm which emails have accounts.
            email_taken: [409, 'We could not create an account with those details. Try signing in instead.'],
          } as const;
          const [status, message] = map[err.code];
          return reply.status(status).send({ error: message, code: err.code === 'email_taken' ? 'account_unavailable' : err.code });
        }
        throw err;
      }
    },
  );

  // ── Who am I ──────────────────────────────────────────────────────────────
  server.get('/api/auth/me', { preHandler: [server.authenticate] }, async (request, reply) => {
    const tenant = (request as any).tenant;
    const user = (request as any).user;
    if (!tenant?.id) return reply.status(400).send({ error: 'Tenant context required' });

    const result = await withTenantDb(tenant.id, async (tx) => {
      const rows = (await tx.execute(
        sql`SELECT id, slug, name, tier, plan_cycle, plan_expires_at FROM tenants WHERE id = ${tenant.id}::uuid`,
      )) as unknown as any[];
      const profileRows = (await tx.execute(sql`SELECT * FROM zex_user_profile(${user.userId}::uuid)`)) as unknown as any[];
      return { tenant: rows[0], profile: profileRows[0] };
    });
    void getUserProfileInTenant; void getSqlClient;
    const account = await getUserAccount(user.userId);

    return reply.send({
      user: result.profile
        ? { id: result.profile.id, email: result.profile.email, name: result.profile.name, emailVerified: Boolean(account?.email_verified) }
        : { id: user.userId, email: null, name: null, emailVerified: Boolean(account?.email_verified) },
      tenant: result.tenant,
      role: user.role ?? null,
      isPlatformAdmin: Boolean(user.isPlatformAdmin),
    });
  });
}
