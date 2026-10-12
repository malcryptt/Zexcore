import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const errorHandlerPluginAsync: FastifyPluginAsync = async (server) => {
  server.setErrorHandler((error: any, request, reply) => {
    request.log.error(error);

    // Postgres / RLS policy violation
    if (error.message && error.message.includes('violates row-level security policy')) {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Security policy violation: Tenant data isolation boundary denied this operation.',
      });
    }

    // Validation errors (e.g. Zod or schema)
    if (error.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: error.validation,
      });
    }

    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send({
      statusCode,
      error: error.name || 'InternalServerError',
      message: statusCode === 500 ? 'An unexpected internal error occurred' : error.message,
    });
  });
};

export const errorHandlerPlugin = fp(errorHandlerPluginAsync, {
  name: 'error-handler-plugin',
});
