import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Lead } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface DeleteLeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteLeadModal: React.FC<DeleteLeadModalProps> = ({
  isOpen,
  lead,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!lead) throw new Error('No lead selected for deletion');
      return api.deleteLead(lead.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardDistribution'] });
      onClose();
      if (onSuccess) onSuccess();
    },
  });

  if (!lead) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Lead"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 rounded-full text-rose-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Are you sure you want to delete {lead.fullName}?
            </p>
            <p className="text-xs text-slate-500 mt-1">
              This action cannot be undone. All associated activities, follow-up reminders, and AI analyses for this lead will be permanently removed.
            </p>
          </div>
        </div>

        {mutation.isError && (
          <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {(mutation.error as Error).message || 'Failed to delete lead.'}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
