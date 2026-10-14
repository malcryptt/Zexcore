import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  iotMax?: number;
}

/**
 * High-Performance In-Memory Sliding Window Rate Limiter
 * Guards API against DDoS, brute force, and telemetry ingestion floods.
 */
const rateLimitPluginAsync: FastifyPluginAsync<RateLimitOptions> = async (server, opts) => {
  const windowMs = opts.windowMs || 60 * 1000; // 1 minute
  const defaultMax = opts.max || 120; // 120 req/min for general API
  const iotMax = opts.iotMax || 5000; // 5,000 req/min for IoT telemetry ingest

  const buckets = new Map<string, RateLimitBucket>();

  // Periodic pruning of expired buckets every 60 seconds (prevents memory leak)
  const pruneInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }, 60 * 1000);

  // Clean up timer on server close
  server.addHook('onClose', (_instance, done) => {
    clearInterval(pruneInterval);
    done();
  });

  server.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Determine client identifier: prefers x-forwarded-for if behind reverse proxy
    const forwarded = request.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string'
      ? (forwarded.split(',')[0] ?? '').trim() || '127.0.0.1'
      : request.ip || '127.0.0.1';

    const path = request.url.split('?')[0];
    const isIotIngest = path === '/api/iot/ingest';
    const limit = isIotIngest ? iotMax : defaultMax;
    const bucketKey = `${ip}:${isIotIngest ? 'iot' : 'gen'}`;

    const now = Date.now();
    let bucket = buckets.get(bucketKey);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 1, resetAt: now + windowMs };
      buckets.set(bucketKey, bucket);
    } else {
      bucket.count += 1;
    }

    const remaining = Math.max(0, limit - bucket.count);
    const resetSeconds = Math.ceil((bucket.resetAt - now) / 1000);

    reply.header('RateLimit-Limit', limit);
    reply.header('RateLimit-Remaining', remaining);
    reply.header('RateLimit-Reset', resetSeconds);

    if (bucket.count > limit) {
      reply.header('Retry-After', resetSeconds);
      reply.status(429).send({
        error: 'Too Many Requests',
        message: `Rate limit of ${limit} requests per minute exceeded. Please retry in ${resetSeconds}s.`,
        retryAfter: resetSeconds,
      });
    }
  });
};

export const rateLimitPlugin = fp(rateLimitPluginAsync, {
  name: 'rate-limit-plugin',
});
