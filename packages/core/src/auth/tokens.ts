import jwt from 'jsonwebtoken';
import type { PrincipalType, TenantRole } from '../db/schema/memberships.js';

export interface AuthTokenPayload {
  userId: string;
  tenantId?: string;
  principalType: PrincipalType;
  role?: TenantRole;
  isPlatformAdmin?: boolean;
}

export function signAuthToken(payload: AuthTokenPayload, secret?: string, expiresIn = '24h'): string {
  const jwtSecret = secret || process.env.JWT_SECRET || 'zexcore-default-secret-key-change-me';
  return jwt.sign(payload, jwtSecret, { expiresIn });
}

export function verifyAuthToken(token: string, secret?: string): AuthTokenPayload {
  const jwtSecret = secret || process.env.JWT_SECRET || 'zexcore-default-secret-key-change-me';
  const decoded = jwt.verify(token, jwtSecret);
  return decoded as AuthTokenPayload;
}
