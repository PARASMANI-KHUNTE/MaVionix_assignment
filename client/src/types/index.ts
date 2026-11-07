export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'INTERESTED'
  | 'NEGOTIATION'
  | 'CONVERTED'
  | 'LOST';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'FOLLOW_UP';

export type FollowUpStatus = 'PENDING' | 'COMPLETED';

export interface Lead {
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
  createdAt: string;
  updatedAt: string;
  _count?: {
    activities: number;
    followUps: number;
  };
  analyses?: Array<{
    score: number;
    conversionProbability: number;
    createdAt: string;
  }>;
}

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  subject: string;
  description: string | null;
  occurredAt: string;
  createdAt: string;
  lead?: {
    id: string;
    fullName: string;
    companyName: string | null;
    status: LeadStatus;
  };
}

export interface FollowUp {
  id: string;
  leadId: string;
  title: string;
  description: string | null;
  dueAt: string;
  status: FollowUpStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
  lead?: {
    id: string;
    fullName: string;
    companyName: string | null;
    status: LeadStatus;
    priority: LeadPriority;
  };
}

export interface LeadAnalysis {
  id: string;
  leadId: string;
  summary: string;
  score: number; // 1 - 100
  conversionProbability: number; // 0 - 100
  keySignals: string[];
  nextBestAction: string;
  followUpMessage: {
    subject: string;
    body: string;
  };
  limitations: string[];
  provider: 'gemini' | 'mock';
  model: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalLeads: number;
  newLeads: number;
  convertedCustomers: number;
  pendingFollowUps: number;
  overdueFollowUps: number;
  conversionRate: number;
  totalPipelineValue: number;
}

export interface DashboardDistribution {
  status: LeadStatus;
  count: number;
  value: number;
}

export interface DashboardPerformance {
  month: string;
  leadsCount: number;
  convertedCount: number;
  pipelineValue: number;
}

export interface PipelineStageData {
  stage: LeadStatus;
  label: string;
  count: number;
  totalValue: number;
  leads: Lead[];
}

export interface PipelineResponse {
  stages: PipelineStageData[];
  summary: {
    totalLeads: number;
    totalPipelineValue: number;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
