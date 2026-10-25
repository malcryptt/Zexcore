import crypto from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { hashPassword, lookupUserForLogin, registerTenant, RegistrationError, signAuthToken } from '@zexcore/core';
import { verifyGoogleIdToken, type GoogleIdentity } from '../auth/googleToken.js';
import { startSession } from '../auth/session.js';

export const googleTestHooks: { getKeys?: () => Promise<any[]> } = {};

const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

export function registerGoogleRoutes(server: FastifyInstance): void {
  const clientId = () => process.env.GOOGLE_CLIENT_ID || '';

  // The browser needs the public client id to render the Google button. Null means Google sign-in is not configured.
  server.get('/api/auth/google/config', async (_req, reply) => reply.send({ clientId: clientId() || null }));

  server.post<{ Body: { credential: string; tenantName?: string; tenantSlug?: string; workspace?: string } }>(
    '/api/auth/google',
    {
      schema: {
        body: {
          type: 'object', required: ['credential'], additionalProperties: false,
          properties: {
            credential: { type: 'string', minLength: 20, maxLength: 4096 },
            tenantName: { type: 'string', minLength: 2, maxLength: 120 },
            tenantSlug: { type: 'string', maxLength: 40 },
            workspace: { type: 'string', maxLength: 64 },
          },
        },
      },
    },
    async (request, reply) => {
      if (!clientId()) return reply.status(503).send({ error: 'Google sign-in is not configured', code: 'google_not_configured' });
      const id: GoogleIdentity | null = await verifyGoogleIdToken(request.body.credential, { clientId: clientId(), getKeys: googleTestHooks.getKeys });
      if (!id) return reply.status(401).send({ error: 'Google sign-in could not be verified. Please try again.', code: 'google_invalid' });

      const existing = await lookupUserForLogin(id.email);
      if (existing) {
        const s = await startSession(existing, request.body.workspace);
        if (s.kind === 'choose') return reply.send({ workspaces: s.workspaces });
        if (s.kind === 'denied') return reply.status(401).send({ error: 'No access to that workspace' });
        return reply.send({ token: s.token, user: s.user });
      }

      // New person: needs a workspace name before we create anything.
      const { tenantName, tenantSlug } = request.body;
      if (!tenantName) return reply.send({ needsSignup: true, email: id.email, name: id.name });

      try {
        const slug = slugify(tenantSlug || tenantName);
        // Google users have no password: store an unguessable hash so password login can never succeed.
        const { tenantId, userId } = await registerTenant({
          slug, tenantName, email: id.email, userName: id.name,
          passwordHash: await hashPassword(crypto.randomBytes(48).toString('base64url')),
        });
        const token = signAuthToken({ userId, tenantId, role: 'owner', principalType: 'tenant_user', isPlatformAdmin: false });
        return reply.status(201).send({ token, user: { id: userId, email: id.email, name: id.name }, tenant: { id: tenantId, slug, name: tenantName }, role: 'owner' });
      } catch (err) {
        if (err instanceof RegistrationError) {
          const map = { invalid_slug: 'Workspace address must be 3–40 letters, numbers or hyphens.', reserved_slug: 'That workspace address is reserved.', invalid_email: 'Invalid email.', slug_taken: 'That workspace address is already taken.', email_taken: 'We could not create an account with those details.' } as const;
          return reply.status(err.code === 'invalid_slug' || err.code === 'reserved_slug' || err.code === 'invalid_email' ? 400 : 409).send({ error: map[err.code], code: err.code });
        }
        throw err;
      }
    },
  );
}
