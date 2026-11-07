import { Router } from 'express';
import { FollowUpController } from './followUp.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { leadIdParamSchema } from '../leads/lead.schema.js';
import {
  createFollowUpSchema,
  updateFollowUpSchema,
  queryFollowUpsSchema,
  followUpIdParamSchema,
} from './followUp.schema.js';

const router = Router();

// /api/follow-ups
router.get('/', validateRequest({ query: queryFollowUpsSchema }), FollowUpController.getFollowUps);

// /api/leads/:id/follow-ups
router.post(
  '/leads/:id/follow-ups',
  validateRequest({ params: leadIdParamSchema, body: createFollowUpSchema }),
  FollowUpController.createFollowUp
);

// /api/follow-ups/:id
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
