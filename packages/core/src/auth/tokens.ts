import jwt from 'jsonwebtoken';
import type { PrincipalType, TenantRole } from '../db/schema/memberships.js';

export interface AuthTokenPayload {
  userId: string;
  tenantId?: string;
  principalType: PrincipalType;
  role?: TenantRole;
  isPlatformAdmin?: boolean;
}

const DEFAULT_INSECURE_SECRET = 'zexcore-default-secret-key-change-me';

export function getJwtSecret(secret?: string): string {
  if (secret && secret.trim().length > 0) {
    return secret;
  }
  const isProduction = process.env.NODE_ENV === 'production';
  const envSecret = process.env.JWT_SECRET;

  if (isProduction) {
    if (!envSecret || envSecret.length < 32 || envSecret.includes('default-secret-key')) {
      throw new Error(
        '[FATAL SECURITY CONFIGURATION] In production mode, JWT_SECRET must be explicitly set to at least 32 characters. Default fallback secrets are strictly rejected.'
      );
    }
    return envSecret;
  }

  return envSecret || DEFAULT_INSECURE_SECRET;
}

export function signAuthToken(payload: AuthTokenPayload, secret?: string, expiresIn = '24h'): string {
  const jwtSecret = getJwtSecret(secret);
  return jwt.sign(payload, jwtSecret, { expiresIn: expiresIn as any });
}

export function verifyAuthToken(token: string, secret?: string): AuthTokenPayload {
  const jwtSecret = getJwtSecret(secret);
  const decoded = jwt.verify(token, jwtSecret);
  return decoded as AuthTokenPayload;
}
