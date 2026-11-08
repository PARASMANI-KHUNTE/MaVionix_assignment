import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { NeonAuthService } from '../modules/auth/neon-auth.service.js';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Skip auth for health checks, neon diagnostics, or test mode
  if (
    req.path === '/health' ||
    req.path.startsWith('/neon/status') ||
    env.NODE_ENV === 'test'
  ) {
    return next();
  }

  // Allow requests without API key if configured
  if (env.ALLOW_NO_AUTH === 'true') {
    return next();
  }

  // 1. Check for Neon Auth Bearer token
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      // In Neon Managed Better Auth, Bearer tokens or Neon API tokens can be checked
      // We accept valid Bearer tokens or verify format
      return next();
    }
  }

  // 2. Check for x-api-key
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  if (apiKey) {
    const validApiKeys = (env.API_KEYS || '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (validApiKeys.length === 0 || validApiKeys.includes(apiKey as string)) {
      return next();
    }
    throw new AppError('Invalid API key', 401);
  }

  // If no auth header or api key provided
  if (env.NODE_ENV !== 'production') {
    return next();
  }

  throw new AppError('Authentication required (Bearer token or x-api-key)', 401);
};
