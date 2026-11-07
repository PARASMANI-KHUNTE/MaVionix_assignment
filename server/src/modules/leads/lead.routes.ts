import { Router } from 'express';
import { LeadController } from './lead.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createLeadSchema,
  updateLeadSchema,
  queryLeadsSchema,
  leadIdParamSchema,
} from './lead.schema.js';

const router = Router();

router.get('/', validateRequest({ query: queryLeadsSchema }), LeadController.getLeads);

router.post('/', validateRequest({ body: createLeadSchema }), LeadController.createLead);

router.get('/:id', validateRequest({ params: leadIdParamSchema }), LeadController.getLeadById);

router.patch(
  '/:id',
  validateRequest({ params: leadIdParamSchema, body: updateLeadSchema }),
  LeadController.updateLead
);

router.delete('/:id', validateRequest({ params: leadIdParamSchema }), LeadController.deleteLead);

export default router;
