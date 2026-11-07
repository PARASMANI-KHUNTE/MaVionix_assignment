import { Router } from 'express';
import { ActivityController } from './activity.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { leadIdParamSchema } from '../leads/lead.schema.js';
import { createActivitySchema } from './activity.schema.js';

const router = Router({ mergeParams: true });

router.get(
  '/:id/activities',
  validateRequest({ params: leadIdParamSchema }),
  ActivityController.getActivities
);

router.post(
  '/:id/activities',
  validateRequest({ params: leadIdParamSchema, body: createActivitySchema }),
  ActivityController.createActivity
);

export default router;
