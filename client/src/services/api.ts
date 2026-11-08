import {
  Lead,
  LeadStatus,
  LeadPriority,
  Activity,
  FollowUp,
  LeadAnalysis,
  DashboardSummary,
  DashboardDistribution,
  DashboardPerformance,
  PipelineResponse,
  PaginatedResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const API_KEY = import.meta.env.VITE_API_KEY || '';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.message) {
        errorMsg = errorData.message;
      }
      if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMsg = errorData.errors.map((e: any) => e.message).join(', ');
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Health
  async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE.replace('/v1', '')}/health`);
    return handleResponse(res);
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary`, { headers: getHeaders() });
    const json = await handleResponse<{ success: boolean; data: DashboardSummary }>(res);
    return json.data;
  },

  async getDashboardDistribution(): Promise<DashboardDistribution[]> {
    const res = await fetch(`${API_BASE}/dashboard/lead-distribution`, { headers: getHeaders() });
    const json = await handleResponse<{ success: boolean; data: DashboardDistribution[] }>(res);
    return json.data;
  },

  async getDashboardPerformance(): Promise<DashboardPerformance[]> {
    const res = await fetch(`${API_BASE}/dashboard/sales-performance`, { headers: getHeaders() });
    const json = await handleResponse<{ success: boolean; data: DashboardPerformance[] }>(res);
    return json.data;
  },

  async getRecentActivities(limit = 8): Promise<Activity[]> {
    const res = await fetch(`${API_BASE}/dashboard/recent-activities?limit=${limit}`, { headers: getHeaders() });
    const json = await handleResponse<{ success: boolean; data: Activity[] }>(res);
    return json.data;
  },

  // Leads
  async getLeads(params?: {
    search?: string;
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Lead>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

    const res = await fetch(`${API_BASE}/leads?${query.toString()}`, { headers: getHeaders() });
    return handleResponse<PaginatedResponse<Lead>>(res);
  },

  async getLeadById(id: string): Promise<Lead & { activities: Activity[]; followUps: FollowUp[]; analyses: LeadAnalysis[] }> {
    const res = await fetch(`${API_BASE}/leads/${id}`, { headers: getHeaders() });
    const json = await handleResponse<{ success: boolean; data: any }>(res);
    return json.data;
  },

  async createLead(data: {
    fullName: string;
    email: string;
    phone?: string | null;
    companyName?: string | null;
    jobTitle?: string | null;
    source?: string | null;
    status?: LeadStatus;
    priority?: LeadPriority;
    estimatedValue?: number;
    notes?: string | null;
  }): Promise<Lead> {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await handleResponse<{ success: boolean; data: Lead }>(res);
    return json.data;
  },

  async updateLead(
    id: string,
    data: Partial<{
      fullName: string;
      email: string;
      phone: string | null;
      companyName: string | null;
      jobTitle: string | null;
      source: string | null;
      status: LeadStatus;
      priority: LeadPriority;
      estimatedValue: number;
      notes: string | null;
    }>
  ): Promise<Lead> {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await handleResponse<{ success: boolean; data: Lead }>(res);
    return json.data;
  },

  async deleteLead(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Pipeline
  async getPipeline(): Promise<PipelineResponse> {
    const res = await fetch(`${API_BASE}/pipeline`, { headers: getHeaders() });
    const json = await handleResponse<{ success: boolean; data: PipelineResponse }>(res);
    return json.data;
  },

  async updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
    const res = await fetch(`${API_BASE}/leads/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const json = await handleResponse<{ success: boolean; data: Lead }>(res);
    return json.data;
  },

  // Activities
  async getActivities(leadId: string): Promise<Activity[]> {
    const res = await fetch(`${API_BASE}/activities?leadId=${leadId}`, { headers: getHeaders() });
    const json = await handleResponse<{ success: boolean; data: Activity[] }>(res);
    return json.data;
  },

  async createActivity(
    leadId: string,
    data: {
      type: string;
      subject: string;
      description?: string | null;
      occurredAt?: string;
    }
  ): Promise<Activity> {
    const res = await fetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...data, leadId }),
    });
    const json = await handleResponse<{ success: boolean; data: Activity }>(res);
    return json.data;
  },

  // Follow-ups
  async getFollowUps(params?: {
    filter?: 'all' | 'upcoming' | 'overdue' | 'completed';
    leadId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: FollowUp[];
    counts: { total: number; pending: number; upcoming: number; overdue: number; completed: number };
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params?.filter) query.append('filter', params.filter);
    if (params?.leadId) query.append('leadId', params.leadId);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/follow-ups?${query.toString()}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async createFollowUp(
    leadId: string,
    data: {
      title: string;
      description?: string | null;
      dueAt: string;
    }
  ): Promise<FollowUp> {
    const res = await fetch(`${API_BASE}/follow-ups`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...data, leadId }),
    });
    const json = await handleResponse<{ success: boolean; data: FollowUp }>(res);
    return json.data;
  },

  async updateFollowUp(
    id: string,
    data: Partial<{
      title: string;
      description: string | null;
      dueAt: string;
      status: 'PENDING' | 'COMPLETED';
    }>
  ): Promise<FollowUp> {
    const res = await fetch(`${API_BASE}/follow-ups/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await handleResponse<{ success: boolean; data: FollowUp }>(res);
    return json.data;
  },

  async deleteFollowUp(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/follow-ups/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // AI Intelligence
  async analyzeLead(id: string): Promise<LeadAnalysis> {
    const res = await fetch(`${API_BASE}/ai/leads/${id}/analyze`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const json = await handleResponse<{ success: boolean; data: LeadAnalysis }>(res);
    return json.data;
  },

  async getLatestAnalysis(id: string): Promise<LeadAnalysis | null> {
    const res = await fetch(`${API_BASE}/ai/leads/${id}/latest`, { headers: getHeaders() });
    const json = await handleResponse<{ success: boolean; data: LeadAnalysis | null }>(res);
    return json.data;
  },

  // Neon Cloud Services Integration
  async getNeonStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/neon/status`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async invokeNeonFunction(): Promise<any> {
    const res = await fetch(`${API_BASE}/neon/function/hello`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getStorageFiles(prefix?: string): Promise<{ success: boolean; count: number; data: any[] }> {
    const query = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
    const res = await fetch(`${API_BASE}/storage/files${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async uploadStorageFile(key: string, content: string, contentType = 'text/plain'): Promise<any> {
    const res = await fetch(`${API_BASE}/storage/upload`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ key, content, contentType }),
    });
    return handleResponse(res);
  },

  async deleteStorageFile(key: string): Promise<any> {
    const res = await fetch(`${API_BASE}/storage/files/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getRealtimeConfig(): Promise<any> {
    const res = await fetch(`${API_BASE}/realtime/config`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async sealLeadsQuery(): Promise<any> {
    const res = await fetch(`${API_BASE}/realtime/seal-leads`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
