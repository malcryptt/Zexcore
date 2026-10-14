import Fastify from 'fastify';
import cors from '@fastify/cors';
import { getEnv } from '@zexcore/core';
import { tenancyPlugin } from './plugins/tenancy.js';
import { authPlugin } from './plugins/auth.js';
import { errorHandlerPlugin } from './plugins/errorHandler.js';
import { securityHeadersPlugin } from './plugins/securityHeaders.js';
import { rateLimitPlugin } from './plugins/rateLimit.js';
import { bootstrapApp } from './bootstrap.js';

export async function createServer() {
  const env = getEnv();

  const server = Fastify({
    bodyLimit: 1048576, // 1MB payload cap to prevent memory exhaustion / DoS
    logger: {
      level: env.LOG_LEVEL,
    },
  });

  // Enterprise Security Headers (HSTS, CSP, X-Frame-Options, etc.)
  await server.register(securityHeadersPlugin);

  // In-Memory Rate Limiting (120 req/min general, 5000 req/min IoT)
  await server.register(rateLimitPlugin, {
    windowMs: 60 * 1000,
    max: 120,
    iotMax: 5000,
  });

  // Global CORS
  await server.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  // Security & Scoping plugins
  await server.register(errorHandlerPlugin);
  await server.register(tenancyPlugin);
  await server.register(authPlugin);

  // Bootstrap Core & Modules
  await bootstrapApp(server);

  return server;
}

// Start standalone server when executed directly
if (process.env.NODE_ENV !== 'test') {
  const env = getEnv();
  const server = await createServer();

  try {
    const address = await server.listen({
      port: env.PORT,
      host: env.HOST,
    });
    server.log.info(`ZexCore API Server listening at ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
