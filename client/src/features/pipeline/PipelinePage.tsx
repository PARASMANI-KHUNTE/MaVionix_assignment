import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Lead, LeadPriority, LeadStatus, PipelineStageData } from '../../types';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Building,
  DollarSign,
  GripVertical,
  Plus,
  ExternalLink,
  Sparkles,
  ArrowRight,
  MoreVertical,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { CreateLeadModal } from '../leads/CreateLeadModal';
import {
  formatCurrency,
  getPriorityBadgeProps,
  getStatusBadgeProps,
} from '../../lib/utils';

const STAGE_ORDER: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'INTERESTED',
  'NEGOTIATION',
  'CONVERTED',
  'LOST',
];

interface KanbanCardProps {
  lead: Lead;
  onMoveStage: (leadId: string, stage: LeadStatus) => void;
  isOverlay?: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ lead, onMoveStage, isOverlay = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: lead.id,
      data: { lead, type: 'Lead' },
      disabled: isOverlay,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const priorityBadge = getPriorityBadgeProps(lead.priority);
  const aiAnalysis = lead.analyses && lead.analyses[0];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-shadow hover:shadow-md hover:border-slate-300 relative group select-none ${
        isOverlay ? 'shadow-xl border-blue-400 rotate-1 cursor-grabbing' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-0.5 rounded"
            title="Drag card to move stage"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <Link
            to={`/leads/${lead.id}`}
            className="text-xs font-bold text-slate-900 hover:text-blue-600 truncate block hover:underline"
          >
            {lead.fullName}
          </Link>
        </div>

        {/* Accessible Alternative: Stage Selector */}
        <select
          value={lead.status}
          onChange={(e) => onMoveStage(lead.id, e.target.value as LeadStatus)}
          aria-label={`Move stage for ${lead.fullName}`}
          className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
        >
          {STAGE_ORDER.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {lead.companyName && (
        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1.5 pl-5">
          <Building className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">{lead.companyName}</span>
        </div>
      )}

      {/* Footer Details: Priority, Value, AI Score */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 pl-5 text-[11px]">
        <Badge className={`text-[10px] px-1.5 py-0.2 ${priorityBadge.className}`}>
          {priorityBadge.label}
        </Badge>

        <div className="flex items-center gap-2">
          {aiAnalysis && (
            <span
              className="flex items-center gap-0.5 font-bold text-amber-600 text-[10px]"
              title={`AI Score: ${aiAnalysis.score}/100`}
            >
              <Sparkles className="h-3 w-3" />
              {aiAnalysis.score}
            </span>
          )}

          {lead.estimatedValue && lead.estimatedValue > 0 ? (
            <span className="font-semibold text-slate-800">
              {formatCurrency(lead.estimatedValue)}
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </div>
      </div>
    </div>
  );
};

interface ColumnProps {
  stageData: PipelineStageData;
  onMoveStage: (leadId: string, stage: LeadStatus) => void;
}

const KanbanColumn: React.FC<ColumnProps> = ({ stageData, onMoveStage }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stageData.stage,
    data: { stage: stageData.stage },
  });

  const badgeProps = getStatusBadgeProps(stageData.stage);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border transition-colors bg-slate-100/70 p-3 min-w-[270px] max-w-[320px] w-full shrink-0 ${
        isOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${badgeProps.dotColor}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {stageData.label}
          </h3>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold">
            {stageData.count}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          {formatCurrency(stageData.totalValue)}
        </span>
      </div>

      {/* Card List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[140px] pr-1">
        {stageData.leads && stageData.leads.length > 0 ? (
          stageData.leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} onMoveStage={onMoveStage} />
          ))
        ) : (
          <div className="h-28 flex items-center justify-center rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
            No leads in this stage
          </div>
        )}
      </div>
    </div>
  );
};

export const PipelinePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [activeDragLead, setActiveDragLead] = useState<Lead | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const { data: pipeline, isLoading, error, refetch } = useQuery({
    queryKey: ['pipeline'],
    queryFn: () => api.getPipeline(),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag begins
      },
    }),
    useSensor(KeyboardSensor)
  );

  const updateStageMutation = useMutation({
    mutationFn: ({ leadId, newStatus }: { leadId: string; newStatus: LeadStatus }) =>
      api.updateLeadStatus(leadId, newStatus),
    onMutate: async ({ leadId, newStatus }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['pipeline'] });
      const previousPipeline = queryClient.getQueryData(['pipeline']);

      queryClient.setQueryData(['pipeline'], (old: any) => {
        if (!old) return old;
        let movedLead: Lead | null = null;
        const newStages = old.stages.map((st: PipelineStageData) => {
          const remainingLeads = st.leads.filter((l) => {
            if (l.id === leadId) {
              movedLead = { ...l, status: newStatus };
              return false;
            }
            return true;
          });
          return {
            ...st,
            leads: remainingLeads,
            count: remainingLeads.length,
            totalValue: remainingLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0),
          };
        });

        if (movedLead) {
          const targetStage = newStages.find((s: any) => s.stage === newStatus);
          if (targetStage) {
            targetStage.leads.unshift(movedLead);
            targetStage.count += 1;
            targetStage.totalValue += (movedLead as Lead).estimatedValue || 0;
          }
        }

        return { ...old, stages: newStages };
      });

      return { previousPipeline };
    },
    onError: (err, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousPipeline) {
        queryClient.setQueryData(['pipeline'], context.previousPipeline);
      }
      setErrorToast((err as Error).message || 'Failed to update stage. Reverting...');
      setTimeout(() => setErrorToast(null), 4000);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardDistribution'] });
      queryClient.invalidateQueries({ queryKey: ['recentActivities'] });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const currentLead = active.data.current?.lead as Lead;
    if (currentLead) {
      setActiveDragLead(currentLead);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragLead(null);

    if (!over) return;

    const leadId = active.id as string;
    const lead = active.data.current?.lead as Lead;

    // Determine target status
    let targetStatus: LeadStatus | null = null;

    if (STAGE_ORDER.includes(over.id as LeadStatus)) {
      targetStatus = over.id as LeadStatus;
    } else if (over.data.current?.stage) {
      targetStatus = over.data.current.stage;
    } else if (over.data.current?.lead?.status) {
      targetStatus = over.data.current.lead.status;
    }

    if (targetStatus && lead && lead.status !== targetStatus) {
      updateStageMutation.mutate({ leadId, newStatus: targetStatus });
    }
  };

  const handleMoveStage = (leadId: string, newStatus: LeadStatus) => {
    updateStageMutation.mutate({ leadId, newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sales Pipeline</h2>
          <p className="text-sm text-slate-500 mt-1">
            Drag leads between stages or use the accessible stage selector to update deal progress.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Lead to Pipeline
        </Button>
      </div>

      {errorToast && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg flex items-center justify-between">
          <span>{errorToast}</span>
          <button onClick={() => setErrorToast(null)} className="font-bold underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading pipeline board..." className="h-96" />
      ) : error ? (
        <ErrorState
          title="Failed to load pipeline"
          message={(error as Error).message}
          onRetry={() => refetch()}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Horizontal scroll container for 6 stages */}
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
            {pipeline?.stages.map((stageData) => (
              <KanbanColumn
                key={stageData.stage}
                stageData={stageData}
                onMoveStage={handleMoveStage}
              />
            ))}
          </div>

          <DragOverlay>
            {activeDragLead ? (
              <KanbanCard
                lead={activeDragLead}
                onMoveStage={() => {}}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <CreateLeadModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
};
