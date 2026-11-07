import { Router } from 'express';
import { PipelineController } from './pipeline.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { leadIdParamSchema } from '../leads/lead.schema.js';
import { updateStatusSchema } from './pipeline.schema.js';

const router = Router();

router.get('/', PipelineController.getPipeline);
router.patch(
  '/:id/status',
  validateRequest({ params: leadIdParamSchema, body: updateStatusSchema }),
  PipelineController.updateLeadStatus
);

export default router;
