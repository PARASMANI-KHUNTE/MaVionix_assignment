import { Router } from 'express';
import { AIController } from './ai.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { leadIdParamSchema } from '../leads/lead.schema.js';

const router = Router();

router.post(
  '/leads/:id/analyze',
  validateRequest({ params: leadIdParamSchema }),
  AIController.analyzeLead
);

router.get(
  '/leads/:id/latest',
  validateRequest({ params: leadIdParamSchema }),
  AIController.getLatestAnalysis
);

export default router;
