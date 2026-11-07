import { Router } from 'express';
import { AIController } from './ai.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { leadIdParamSchema } from '../leads/lead.schema.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for AI analysis (prevent accidental flooding)
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI analysis requests. Please wait a moment before trying again.',
  },
});

router.post(
  '/leads/:id/analyze',
  aiRateLimiter,
  validateRequest({ params: leadIdParamSchema }),
  AIController.analyzeLead
);

router.get(
  '/leads/:id/latest',
  validateRequest({ params: leadIdParamSchema }),
  AIController.getLatestAnalysis
);

export default router;
