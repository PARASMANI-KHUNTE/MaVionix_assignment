import { Router } from 'express';
import { FollowUpController } from './followUp.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createFollowUpSchema,
  updateFollowUpSchema,
  queryFollowUpsSchema,
  followUpIdParamSchema,
} from './followUp.schema.js';
import { z } from 'zod';

const router = Router();

// GET /api/v1/follow-ups
router.get('/', validateRequest({ query: queryFollowUpsSchema }), FollowUpController.getFollowUps);

// POST /api/v1/follow-ups
router.post(
  '/',
  validateRequest({ body: createFollowUpSchema.extend({ leadId: z.string().uuid() }) }),
  FollowUpController.createFollowUp
);

// PATCH /api/v1/follow-ups/:id
router.patch(
  '/:id',
  validateRequest({ params: followUpIdParamSchema, body: updateFollowUpSchema }),
  FollowUpController.updateFollowUp
);

router.delete(
  '/:id',
  validateRequest({ params: followUpIdParamSchema }),
  FollowUpController.deleteFollowUp
);

export default router;
