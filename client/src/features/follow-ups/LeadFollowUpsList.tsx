import React, { useState } from 'react';
import { FollowUp } from '../../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Plus,
  Clock,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDateTime } from '../../lib/utils';
import { CreateFollowUpModal } from './CreateFollowUpModal';

interface LeadFollowUpsListProps {
  leadId: string;
  followUps: FollowUp[];
}

export const LeadFollowUpsList: React.FC<LeadFollowUpsListProps> = ({
  leadId,
  followUps,
}) => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'PENDING' | 'COMPLETED' }) =>
      api.updateFollowUp(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['followUps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteFollowUp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['followUps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Follow-up Tasks & Reminders</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage upcoming milestones and complete actions
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Schedule Follow-up
        </Button>
      </div>

      {followUps && followUps.length > 0 ? (
        <div className="space-y-3">
          {followUps.map((item) => {
            const isCompleted = item.status === 'COMPLETED';
            const isOverdue = !isCompleted && new Date(item.dueAt) < new Date();

            return (
              <div
                key={item.id}
                className={`flex items-start justify-between p-3.5 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                    : isOverdue
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      toggleMutation.mutate({
                        id: item.id,
                        status: isCompleted ? 'PENDING' : 'COMPLETED',
                      })
                    }
                    className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Circle className="h-5 w-5 hover:text-blue-500" />
                    )}
                  </button>

                  <div>
                    <h4
                      className={`text-sm font-semibold ${
                        isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        Due: {formatDateTime(item.dueAt)}
                      </span>

                      {isCompleted ? (
                        <Badge variant="success" className="text-[10px]">
                          Completed
                        </Badge>
                      ) : isOverdue ? (
                        <Badge variant="danger" className="text-[10px] flex items-center gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Overdue
                        </Badge>
                      ) : (
                        <Badge variant="info" className="text-[10px]">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete reminder"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-xs text-slate-500">No scheduled reminders for this lead.</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => setCreateOpen(true)}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Add First Follow-up
          </Button>
        </div>
      )}

      <CreateFollowUpModal
        isOpen={createOpen}
        leadId={leadId}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
};
