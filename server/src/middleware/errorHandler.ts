import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
      ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
  }

  // Handle unexpected errors safely
  console.error('Unhandled Server Error:', err);

  return res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred',
    ...(env.NODE_ENV === 'development' ? { error: err.message, stack: err.stack } : {}),
  });
};
