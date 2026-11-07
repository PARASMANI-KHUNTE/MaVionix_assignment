import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const activitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'FOLLOW_UP']),
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  description: z.string().optional(),
  occurredAt: z.string().default(() => new Date().toISOString().slice(0, 16)),
});

type FormValues = z.infer<typeof activitySchema>;

interface CreateActivityModalProps {
  isOpen: boolean;
  leadId: string;
  onClose: () => void;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  isOpen,
  leadId,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: 'CALL',
      subject: '',
      description: '',
      occurredAt: new Date().toISOString().slice(0, 16),
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.createActivity(leadId, {
        type: values.type,
        subject: values.subject,
        description: values.description || null,
        occurredAt: new Date(values.occurredAt).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['recentActivities'] });
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
      title="Log Customer Interaction"
      description="Record a call, email, meeting, or internal note for this lead."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mutation.isError && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {(mutation.error as Error).message || 'Failed to record interaction.'}
          </div>
        )}

        <Select
          label="Interaction Type"
          error={errors.type?.message}
          {...register('type')}
        >
          <option value="CALL">Phone Call</option>
          <option value="EMAIL">Email Exchange</option>
          <option value="MEETING">Meeting / Demo</option>
          <option value="NOTE">Internal Note</option>
          <option value="FOLLOW_UP">Follow-up Activity</option>
        </Select>

        <Input
          label="Subject / Summary"
          placeholder="e.g. Discussed pricing tiers and contract length"
          required
          error={errors.subject?.message}
          {...register('subject')}
        />

        <Input
          label="Date & Time Occurred"
          type="datetime-local"
          required
          error={errors.occurredAt?.message}
          {...register('occurredAt')}
        />

        <Textarea
          label="Interaction Details"
          placeholder="Key takeaways, customer questions, or commitments made..."
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
            Log Activity
          </Button>
        </div>
      </form>
    </Modal>
  );
};
