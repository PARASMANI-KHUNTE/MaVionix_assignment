import { z } from 'zod';

export const followUpIdParamSchema = z.object({
  id: z.string().uuid('Invalid follow-up ID format'),
});

export const createFollowUpSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional().nullable(),
  dueAt: z.coerce.date(),
});

export const updateFollowUpSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').optional(),
  description: z.string().optional().nullable(),
  dueAt: z.coerce.date().optional(),
  status: z.enum(['PENDING', 'COMPLETED']).optional(),
});

export const queryFollowUpsSchema = z.object({
  filter: z.enum(['all', 'upcoming', 'overdue', 'completed']).default('all'),
  leadId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
export type UpdateFollowUpInput = z.infer<typeof updateFollowUpSchema>;
export type QueryFollowUpsInput = z.infer<typeof queryFollowUpsSchema>;
