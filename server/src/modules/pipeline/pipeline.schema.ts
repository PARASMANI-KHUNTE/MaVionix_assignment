import { z } from 'zod';
import { LeadStatusEnum } from '../leads/lead.schema.js';

export const updateStatusSchema = z.object({
  status: LeadStatusEnum,
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
