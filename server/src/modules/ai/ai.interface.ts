import { z } from 'zod';
import { LeadStatus, LeadPriority, ActivityType, FollowUpStatus } from '@prisma/client';

export interface LeadContextData {
  lead: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    companyName: string | null;
    jobTitle: string | null;
    source: string | null;
    status: LeadStatus;
    priority: LeadPriority;
    estimatedValue: number | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  activities: Array<{
    id: string;
    type: ActivityType;
    subject: string;
    description: string | null;
    occurredAt: Date;
  }>;
  followUps: Array<{
    id: string;
    title: string;
    description: string | null;
    dueAt: Date;
    status: FollowUpStatus;
    completedAt: Date | null;
    isOverdue: boolean;
  }>;
}

export const FollowUpMessageSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
});

export const LeadAnalysisOutputSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  score: z.number().int().min(1).max(100, 'Score must be between 1 and 100'),
  conversionProbability: z
    .number()
    .min(0)
    .max(100, 'Conversion probability must be between 0 and 100'),
  keySignals: z.array(z.string()).min(1, 'At least one key signal is required'),
  nextBestAction: z.string().min(1, 'Next best action is required'),
  followUpMessage: FollowUpMessageSchema,
  limitations: z.array(z.string()).default([]),
  provider: z.enum(['gemini', 'mock', 'neon-ai-gateway']),
  model: z.string(),
});

export type LeadAnalysisOutput = z.infer<typeof LeadAnalysisOutputSchema>;

export interface AIProvider {
  readonly name: 'gemini' | 'mock' | 'neon-ai-gateway';
  readonly modelName: string;
  analyzeLead(context: LeadContextData): Promise<LeadAnalysisOutput>;
}
