import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('postgres://zexcore_app:zexcore_secret@localhost:5433/zexcore_db'),
  JWT_SECRET: z.string().default('zexcore-development-jwt-secret-key-at-least-32-chars-long'),
  SESSION_TTL_HOURS: z.coerce.number().default(24),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

let parsedEnv: Env | null = null;

export function getEnv(): Env {
  if (!parsedEnv) {
    const result = EnvSchema.safeParse(process.env);
    if (!result.success) {
      console.error('Invalid environment variables:', result.error.format());
      throw new Error('Environment configuration validation failed');
    }
    parsedEnv = result.data;
  }
  return parsedEnv;
}
