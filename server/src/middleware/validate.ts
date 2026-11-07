import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors.js';

export const validateRequest = (schemas: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as Record<string, string>;
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as Record<string, any>;
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        next(new BadRequestError('Validation failed', issues));
      } else {
        next(error);
      }
    }
  };
};
