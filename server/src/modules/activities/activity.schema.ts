import { z } from 'zod';

export const ActivityTypeEnum = z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'FOLLOW_UP', 'STATUS_CHANGE']);

export const createActivitySchema = z.object({
  type: ActivityTypeEnum,
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  description: z.string().optional().nullable(),
  occurredAt: z.coerce.date().default(() => new Date()).refine(
    (date) => date <= new Date(),
    'Activity date cannot be in the future'
  ),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
