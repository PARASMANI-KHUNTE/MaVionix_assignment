import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { FollowUp } from '../../types';
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Filter,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User,
  Building,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatDateTime, getStatusBadgeProps } from '../../lib/utils';
import { CreateFollowUpModal } from './CreateFollowUpModal';

export const FollowUpsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [selectedLeadIdForCreate, setSelectedLeadIdForCreate] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['followUps', { filter, page, limit }],
    queryFn: () => api.getFollowUps({ filter, page, limit }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'PENDING' | 'COMPLETED' }) =>
      api.updateFollowUp(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followUps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteFollowUp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followUps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const counts = data?.counts || {
    total: 0,
    pending: 0,
    upcoming: 0,
    overdue: 0,
    completed: 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Follow-up Tasks & Reminders
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track commitments, prevent leads from cooling off, and mark completed milestones.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => {
            setFilter('all');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Tasks
          <span className="text-[10px] opacity-80">({counts.total})</span>
        </button>

        <button
          onClick={() => {
            setFilter('upcoming');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            filter === 'upcoming'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="h-3 w-3" />
          Upcoming
          <span className="text-[10px] opacity-80">({counts.upcoming})</span>
        </button>

        <button
          onClick={() => {
            setFilter('overdue');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            filter === 'overdue'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="h-3 w-3" />
          Overdue
          <span className="text-[10px] opacity-80">({counts.overdue})</span>
        </button>

        <button
          onClick={() => {
            setFilter('completed');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            filter === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="h-3 w-3" />
          Completed
          <span className="text-[10px] opacity-80">({counts.completed})</span>
        </button>
      </div>

      {/* Main List */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner size="lg" text="Loading follow-up tasks..." className="h-64" />
        ) : error ? (
          <ErrorState
            title="Failed to load tasks"
            message={(error as Error).message}
            onRetry={() => refetch()}
            className="m-6"
          />
        ) : data?.data && data.data.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {data.data.map((task) => {
              const isCompleted = task.status === 'COMPLETED';
              const isOverdue = !isCompleted && new Date(task.dueAt) < new Date();
              const leadBadge = task.lead ? getStatusBadgeProps(task.lead.status) : null;

              return (
                <div
                  key={task.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors ${
                    isCompleted
                      ? 'bg-slate-50/50 text-slate-400'
                      : isOverdue
                      ? 'bg-rose-50/20 hover:bg-rose-50/40'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Completion Checkbox Button */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleMutation.mutate({
                          id: task.id,
                          status: isCompleted ? 'PENDING' : 'COMPLETED',
                        })
                      }
                      className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors"
                      title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="h-5 w-5 hover:text-blue-500" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`text-sm font-bold ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </h4>

                        {isCompleted ? (
                          <Badge variant="success" className="text-[10px]">
                            Completed
                          </Badge>
                        ) : isOverdue ? (
                          <Badge
                            variant="danger"
                            className="text-[10px] flex items-center gap-1 font-semibold"
                          >
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Overdue
                          </Badge>
                        ) : (
                          <Badge variant="info" className="text-[10px]">
                            Upcoming
                          </Badge>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-600 max-w-xl">{task.description}</p>
                      )}

                      {/* Associated Lead Info */}
                      {task.lead && (
                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 pt-1">
                          <Link
                            to={`/leads/${task.lead.id}`}
                            className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <User className="h-3 w-3" />
                            {task.lead.fullName}
                          </Link>

                          {task.lead.companyName && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Building className="h-3 w-3" />
                              {task.lead.companyName}
                            </span>
                          )}

                          {leadBadge && (
                            <Badge
                              dot
                              dotColor={leadBadge.dotColor}
                              className={`text-[10px] py-0 ${leadBadge.className}`}
                            >
                              {leadBadge.label}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Due Date & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-8 sm:pl-0">
                    <div className="text-right">
                      <p
                        className={`text-xs font-medium flex items-center gap-1 ${
                          isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {formatDateTime(task.dueAt)}
                      </p>
                      {task.completedAt && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Done: {formatDateTime(task.completedAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {task.lead && (
                        <Link
                          to={`/leads/${task.lead.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View Lead"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing page {data.pagination.page} of {data.pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    icon={<ChevronLeft className="h-3.5 w-3.5" />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    icon={<ChevronRight className="h-3.5 w-3.5" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title="No tasks in this view"
            description={
              filter === 'overdue'
                ? 'Great job! You have zero overdue tasks.'
                : filter === 'upcoming'
                ? 'No upcoming reminders scheduled.'
                : filter === 'completed'
                ? 'No completed tasks recorded yet.'
                : 'No follow-up reminders found.'
            }
            className="m-6"
          />
        )}
      </Card>
    </div>
  );
};
