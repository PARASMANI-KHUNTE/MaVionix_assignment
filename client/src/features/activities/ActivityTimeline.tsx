import React, { useState } from 'react';
import { Activity } from '../../types';
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  Clock,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { formatDateTime } from '../../lib/utils';
import { CreateActivityModal } from './CreateActivityModal';

interface ActivityTimelineProps {
  leadId: string;
  activities: Activity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  leadId,
  activities,
}) => {
  const [createOpen, setCreateOpen] = useState(false);

  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'CALL':
        return {
          icon: Phone,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          label: 'Phone Call',
        };
      case 'EMAIL':
        return {
          icon: Mail,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          label: 'Email',
        };
      case 'MEETING':
        return {
          icon: Calendar,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
          label: 'Meeting',
        };
      case 'FOLLOW_UP':
        return {
          icon: Clock,
          color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
          label: 'Follow-up',
        };
      default:
        return {
          icon: FileText,
          color: 'text-slate-600 bg-slate-50 border-slate-200',
          label: 'Note',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Interaction Timeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological audit trail of customer conversations
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Log Interaction
        </Button>
      </div>

      {activities && activities.length > 0 ? (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {activities.map((act) => {
            const config = getActivityConfig(act.type);
            const Icon = config.icon;

            return (
              <div key={act.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-xs ${config.color}`}
                >
                  <Icon className="h-3 w-3" />
                </div>

                {/* Activity card */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {config.label}
                      </span>
                      <span className="text-slate-300">•</span>
                      <h4 className="text-sm font-bold text-slate-900">{act.subject}</h4>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDateTime(act.occurredAt)}
                    </span>
                  </div>

                  {act.description && (
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed whitespace-pre-wrap">
                      {act.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-xs text-slate-500">No interaction logs recorded for this lead yet.</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => setCreateOpen(true)}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Record First Interaction
          </Button>
        </div>
      )}

      <CreateActivityModal
        isOpen={createOpen}
        leadId={leadId}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
};
