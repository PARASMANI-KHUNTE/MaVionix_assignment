import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const followUpSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  description: z.string().optional(),
  dueAt: z.string().min(1, 'Due date and time is required'),
});

type FormValues = z.infer<typeof followUpSchema>;

interface CreateFollowUpModalProps {
  isOpen: boolean;
  leadId: string;
  onClose: () => void;
}

export const CreateFollowUpModal: React.FC<CreateFollowUpModalProps> = ({
  isOpen,
  leadId,
  onClose,
}) => {
  const queryClient = useQueryClient();

  // Default to tomorrow at 10:00 AM
  const defaultDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  defaultDueDate.setHours(10, 0, 0, 0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      title: '',
      description: '',
      dueAt: defaultDueDate.toISOString().slice(0, 16),
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.createFollowUp(leadId, {
        title: values.title,
        description: values.description || null,
        dueAt: new Date(values.dueAt).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['followUps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      reset();
      onClose();
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Schedule Follow-up Task"
      description="Create a reminder to follow up with this prospect."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mutation.isError && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {(mutation.error as Error).message || 'Failed to schedule follow-up.'}
          </div>
        )}

        <Input
          label="Reminder Title"
          placeholder="e.g. Call to discuss contract redlines"
          required
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          label="Due Date & Time"
          type="datetime-local"
          required
          error={errors.dueAt?.message}
          {...register('dueAt')}
        />

        <Textarea
          label="Task Description & Preparation Notes"
          placeholder="Specific questions to ask or collateral to send..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" size="md" isLoading={mutation.isPending}>
            Schedule Reminder
          </Button>
        </div>
      </form>
    </Modal>
  );
};
