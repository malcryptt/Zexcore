import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

/**
 * Enterprise HTTP Security Headers Plugin
 * Hardens API responses against XSS, clickjacking, MIME-sniffing, and SSL stripping.
 */
const securityHeadersPluginAsync: FastifyPluginAsync = async (server) => {
  server.addHook('onSend', async (_request, reply) => {
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '0');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Cross-Origin-Opener-Policy', 'same-origin');
    reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    reply.header(
      'Content-Security-Policy',
      "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    );
  });
};

export const securityHeadersPlugin = fp(securityHeadersPluginAsync, {
  name: 'security-headers-plugin',
});
