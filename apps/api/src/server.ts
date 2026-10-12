import Fastify from 'fastify';
import cors from '@fastify/cors';
import { getEnv } from '@zexcore/core';
import { tenancyPlugin } from './plugins/tenancy.js';
import { authPlugin } from './plugins/auth.js';
import { errorHandlerPlugin } from './plugins/errorHandler.js';
import { bootstrapApp } from './bootstrap.js';

export async function createServer() {
  const env = getEnv();

  const server = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
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
