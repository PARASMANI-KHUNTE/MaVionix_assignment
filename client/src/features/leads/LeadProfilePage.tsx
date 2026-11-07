import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  Tag,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { AIIntelligencePanel } from '../ai-intelligence/AIIntelligencePanel';
import { ActivityTimeline } from '../activities/ActivityTimeline';
import { LeadFollowUpsList } from '../follow-ups/LeadFollowUpsList';
import { EditLeadModal } from './EditLeadModal';
import { DeleteLeadModal } from './DeleteLeadModal';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getPriorityBadgeProps,
  getStatusBadgeProps,
} from '../../lib/utils';
import { LeadStatus } from '../../types';

export const LeadProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'timeline' | 'followups'>('ai');

  const {
    data: lead,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => {
      if (!id) throw new Error('Lead ID missing');
      return api.getLeadById(id);
    },
    enabled: Boolean(id),
  });

  const stageMutation = useMutation({
    mutationFn: (newStatus: LeadStatus) => {
      if (!id) throw new Error('Lead ID missing');
      return api.updateLeadStatus(id, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading customer profile..." className="h-96" />;
  }

  if (error || !lead) {
    return (
      <ErrorState
        title="Lead not found"
        message={(error as Error)?.message || 'The requested lead record could not be loaded.'}
        onRetry={() => refetch()}
      />
    );
  }

  const statusBadge = getStatusBadgeProps(lead.status);
  const priorityBadge = getPriorityBadgeProps(lead.priority);
  const latestAnalysis = lead.analyses && lead.analyses[0];

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leads Directory
        </Link>

        <div className="flex items-center gap-2">
          {/* Stage selector dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Stage:</span>
            <select
              value={lead.status}
              disabled={stageMutation.isPending}
              onChange={(e) => stageMutation.mutate(e.target.value as LeadStatus)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="INTERESTED">Interested</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditOpen(true)}
            icon={<Edit2 className="h-3.5 w-3.5" />}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteOpen(true)}
            icon={<Trash2 className="h-3.5 w-3.5 text-rose-600" />}
            className="hover:bg-rose-50"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Lead Hero Overview Card */}
      <Card className="bg-white border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Identity & Contact Details */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {lead.fullName}
              </h2>
              <Badge dot dotColor={statusBadge.dotColor} className={statusBadge.className}>
                {statusBadge.label}
              </Badge>
              <Badge className={priorityBadge.className}>{priorityBadge.label} Priority</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium text-slate-800">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                {lead.companyName || 'No Company'}
              </span>

              {lead.jobTitle && (
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  {lead.jobTitle}
                </span>
              )}

              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-1.5 text-blue-600 hover:underline"
              >
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                {lead.email}
              </a>

              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-1.5 text-slate-700 hover:underline"
                >
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {lead.phone}
                </a>
              )}
            </div>

            {/* Source & Date Created */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
              {lead.source && (
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Source: {lead.source}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Added: {formatDate(lead.createdAt)}
              </span>
            </div>
          </div>

          {/* Quick Metrics & Financials */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center min-w-[120px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Estimated Value
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {lead.estimatedValue && lead.estimatedValue > 0
                  ? formatCurrency(lead.estimatedValue)
                  : '$0'}
              </p>
            </div>

            {latestAnalysis && (
              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-center min-w-[120px]">
                <div className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                  <Sparkles className="h-3 w-3 text-indigo-600" /> AI Score
                </div>
                <p className="text-xl font-extrabold text-indigo-900 mt-1">
                  {latestAnalysis.score}
                  <span className="text-xs font-normal text-indigo-500">/100</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Notes preview if available */}
        {lead.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Discovery Notes
            </h4>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
              {lead.notes}
            </p>
          </div>
        )}
      </Card>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'ai'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Lead Intelligence
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'timeline'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" />
          Interaction History ({lead.activities?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('followups')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'followups'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Follow-up Tasks ({lead.followUps?.length || 0})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'ai' && (
        <AIIntelligencePanel leadId={lead.id} initialAnalysis={latestAnalysis as any} />
      )}

      {activeTab === 'timeline' && (
        <Card>
          <ActivityTimeline leadId={lead.id} activities={lead.activities || []} />
        </Card>
      )}

      {activeTab === 'followups' && (
        <Card>
          <LeadFollowUpsList leadId={lead.id} followUps={lead.followUps || []} />
        </Card>
      )}

      {/* Edit & Delete Modals */}
      <EditLeadModal
        isOpen={editOpen}
        lead={lead}
        onClose={() => setEditOpen(false)}
      />

      <DeleteLeadModal
        isOpen={deleteOpen}
        lead={lead}
        onClose={() => setDeleteOpen(false)}
        onSuccess={() => navigate('/leads')}
      />
    </div>
  );
};
