import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

// Absolute max session: 7 days
export const JWT_MAX_AGE = '7d';

// Inactivity timeout: 1 hour (cookie maxAge)
export const INACTIVITY_TIMEOUT_MS = 1 * 60 * 60 * 1000;

// Refresh token if older than 30 minutes (extends absolute session while active)
export const TOKEN_REFRESH_THRESHOLD_S = 30 * 60;

export function signToken(payload: { userId: number; email: string }): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_MAX_AGE });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
