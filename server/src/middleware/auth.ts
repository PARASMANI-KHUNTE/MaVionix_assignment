import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

// Simple API Key authentication for demonstration
// In production, replace with proper JWT/OAuth implementation
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Skip auth for health check or in test mode
  if (req.path === '/health' || env.NODE_ENV === 'test') {
    return next();
  }

  // For development, allow requests without API key if explicitly configured
  if (env.ALLOW_NO_AUTH === 'true') {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    throw new AppError('API key required', 401);
  }

  // Validate API key (in production, use proper key management)
  const validApiKeys = (env.API_KEYS || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  if (validApiKeys.length === 0) {
    // No keys configured - in production this should fail
    if (env.NODE_ENV === 'production') {
      throw new AppError('Authentication not configured', 500);
    }
    return next(); // Allow in dev if no keys set
  }

  if (!validApiKeys.includes(apiKey as string)) {
    throw new AppError('Invalid API key', 401);
  }

  next();
};
