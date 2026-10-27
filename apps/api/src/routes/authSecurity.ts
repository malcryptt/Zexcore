import crypto from 'node:crypto';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import {
  hashPassword, verifyPassword, lookupUserForLogin, getUserAccount, issueOneTimeToken, consumeOneTimeToken, peekOneTimeToken,
  setUserPassword, markEmailVerified, revokeSession, revokeOtherSessions, listSessions,
} from '@zexcore/core';
import { validatePassword } from './account.js';
import { issueToken } from '../auth/session.js';
import { appUrl, sendMail, resetEmail, verifyEmail } from '../lib/mailer.js';

const RESET_TTL = 60 * 60;
const VERIFY_TTL = 24 * 60 * 60;

export const newOneTimeToken = (): { token: string; hash: string } => {
  const token = crypto.randomBytes(32).toString('base64url');
  return { token, hash: hashOneTimeToken(token) };
};
export const hashOneTimeToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex');

/** Issue and email a verification link. Never throws: email trouble must not break sign-up. */
export async function sendVerification(server: FastifyInstance, user: { id: string; email: string; name: string }): Promise<boolean> {
  try {
    const { token, hash } = newOneTimeToken();
    await issueOneTimeToken(user.id, 'verify', hash, VERIFY_TTL);
    return await sendMail(verifyEmail(user.email, user.name, `${appUrl()}/verify-email?token=${token}`), server.log);
  } catch (err) {
    server.log.error({ err }, '[auth] could not send verification email');
    return false;
  }
}

const tokenSchema = { type: 'string', minLength: 20, maxLength: 200 } as const;

export function registerAuthSecurityRoutes(server: FastifyInstance): void {
  // ── Forgot password: identical response whether or not the address has an account ──
  server.post<{ Body: { email: string } }>('/api/auth/password/forgot', {
    schema: { body: { type: 'object', required: ['email'], additionalProperties: false, properties: { email: { type: 'string', maxLength: 254 } } } },
  }, async (request, reply) => {
    const email = request.body.email.toLowerCase().trim();
    // Do the work without making the caller wait for it, so response time does not reveal whether the account exists.
    void (async () => {
      try {
        const user = await lookupUserForLogin(email);
        if (!user) return;
        const { token, hash } = newOneTimeToken();
        await issueOneTimeToken(user.id, 'reset', hash, RESET_TTL);
        await sendMail(resetEmail(user.email, user.name, `${appUrl()}/reset-password?token=${token}`), server.log);
      } catch (err) { server.log.error({ err }, '[auth] password reset request failed'); }
    })();
    return reply.send({ ok: true });
  });

  server.post<{ Body: { token: string; password: string } }>('/api/auth/password/reset', {
    schema: { body: { type: 'object', required: ['token', 'password'], additionalProperties: false, properties: { token: tokenSchema, password: { type: 'string', maxLength: 128 } } } },
  }, async (request, reply) => {
    const hash = hashOneTimeToken(request.body.token);
    const userId = await peekOneTimeToken(hash, 'reset');
    const invalid = () => reply.status(400).send({ error: 'This reset link has expired or was already used. Request a new one.', code: 'invalid_token' });
    if (!userId) return invalid();
    const acct = await getUserAccount(userId);
    if (!acct) return invalid();
    const problem = validatePassword(request.body.password, acct.email);
    if (problem) return reply.status(400).send({ error: problem, code: 'weak_password' });
    // Burn the token first: of two racing requests, only one can win.
    if ((await consumeOneTimeToken(hash, 'reset')) !== userId) return invalid();
    await setUserPassword(userId, await hashPassword(request.body.password)); // also signs the account out everywhere
    await markEmailVerified(userId); // they just proved they control the inbox
    return reply.send({ ok: true });
  });

  // ── Email verification ──
  server.post<{ Body: { token: string } }>('/api/auth/email/verify', {
    schema: { body: { type: 'object', required: ['token'], additionalProperties: false, properties: { token: tokenSchema } } },
  }, async (request, reply) => {
    const userId = await consumeOneTimeToken(hashOneTimeToken(request.body.token), 'verify');
    if (!userId) return reply.status(400).send({ error: 'This confirmation link has expired or was already used.', code: 'invalid_token' });
    await markEmailVerified(userId);
    return reply.send({ ok: true });
  });

  server.post('/api/auth/email/resend', { preHandler: [server.authenticate] }, async (request, reply) => {
    const acct = await getUserAccount(request.user.userId);
    if (!acct) return reply.status(404).send({ error: 'Account not found' });
    if (acct.email_verified) return reply.send({ ok: true, alreadyVerified: true });
    const sent = await sendVerification(server, acct);
    if (!sent) return reply.status(503).send({ error: 'We could not send the email right now. Please try again shortly.', code: 'email_unavailable' });
    return reply.send({ ok: true });
  });

  // ── Change password (signs out every other device, returns a fresh token for this one) ──
  server.post<{ Body: { currentPassword: string; newPassword: string } }>('/api/auth/password/change', {
    preHandler: [server.authenticate],
    schema: { body: { type: 'object', required: ['currentPassword', 'newPassword'], additionalProperties: false, properties: { currentPassword: { type: 'string', maxLength: 128 }, newPassword: { type: 'string', maxLength: 128 } } } },
  }, async (request, reply) => {
    const acct = await getUserAccount(request.user.userId);
    if (!acct) return reply.status(404).send({ error: 'Account not found' });
    if (!(await verifyPassword(request.body.currentPassword, acct.password_hash))) return reply.status(400).send({ error: 'Your current password is not correct.', code: 'wrong_password' });
    const problem = validatePassword(request.body.newPassword, acct.email);
    if (problem) return reply.status(400).send({ error: problem, code: 'weak_password' });
    await setUserPassword(acct.id, await hashPassword(request.body.newPassword));
    const u = request.user;
    const token = await issueToken({ userId: u.userId, tenantId: u.tenantId, role: u.role, principalType: u.principalType, isPlatformAdmin: u.isPlatformAdmin }, request);
    return reply.send({ token });
  });

  // ── Sessions ──
  server.post('/api/auth/logout', { preHandler: [server.authenticate] }, async (request, reply) => {
    if (request.user.sid) await revokeSession(request.user.sid, request.user.userId);
    return reply.send({ ok: true });
  });

  server.get('/api/auth/sessions', { preHandler: [server.authenticate] }, async (request, reply) => {
    const rows = await listSessions(request.user.userId);
    return reply.send({ sessions: rows.map((s) => ({ id: s.id, createdAt: s.created_at, lastSeenAt: s.last_seen_at, userAgent: s.user_agent, ip: s.ip, current: s.id === request.user.sid })) });
  });

  server.delete<{ Params: { id: string } }>('/api/auth/sessions/:id', { preHandler: [server.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    if (!/^[0-9a-f-]{36}$/i.test(request.params.id)) return reply.status(400).send({ error: 'Invalid session id' });
    const ok = await revokeSession(request.params.id, request.user.userId);
    return ok ? reply.status(204).send() : reply.status(404).send({ error: 'Session not found' });
  });

  server.post('/api/auth/sessions/revoke-others', { preHandler: [server.authenticate] }, async (request, reply) => {
    const n = await revokeOtherSessions(request.user.userId, request.user.sid ?? null);
    return reply.send({ revoked: n });
  });
}
