import { z } from 'zod';

export const LeadStatusEnum = z.enum([
  'NEW',
  'CONTACTED',
  'INTERESTED',
  'NEGOTIATION',
  'CONVERTED',
  'LOST',
]);

export const LeadPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const leadIdParamSchema = z.object({
  id: z.string().uuid('Invalid lead ID format'),
});

export const createLeadSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  status: LeadStatusEnum.default('NEW'),
  priority: LeadPriorityEnum.default('MEDIUM'),
  estimatedValue: z.coerce.number().min(0, 'Estimated value cannot be negative').optional().default(0),
  notes: z.string().optional().nullable(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const queryLeadsSchema = z.object({
  search: z.string().optional(),
  status: LeadStatusEnum.optional(),
  priority: LeadPriorityEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'fullName', 'companyName', 'estimatedValue', 'priority']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type QueryLeadsInput = z.infer<typeof queryLeadsSchema>;
