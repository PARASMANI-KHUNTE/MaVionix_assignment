import { Router } from 'express';
import { ActivityController } from './activity.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { createActivitySchema } from './activity.schema.js';
import { z } from 'zod';

const leadIdParamSchema = z.object({
  id: z.string().uuid('Invalid lead ID format'),
});

const router = Router();

// GET /api/v1/activities?leadId=xxx
router.get(
  '/',
  validateRequest({ query: z.object({ leadId: z.string().uuid() }) }),
  ActivityController.getActivities
);

// POST /api/v1/activities
router.post(
  '/',
  validateRequest({ body: createActivitySchema.extend({ leadId: z.string().uuid() }) }),
  ActivityController.createActivity
);

export default router;
