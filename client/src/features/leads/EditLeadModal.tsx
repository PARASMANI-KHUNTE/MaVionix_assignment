import React, { useEffect } from 'react';
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
import { Lead } from '../../types';

const editLeadSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  status: z.enum(['NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATION', 'CONVERTED', 'LOST']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  estimatedValue: z.coerce.number().min(0, 'Estimated value must be non-negative').default(0),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof editLeadSchema>;

interface EditLeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
}

export const EditLeadModal: React.FC<EditLeadModalProps> = ({
  isOpen,
  lead,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(editLeadSchema),
  });

  useEffect(() => {
    if (lead) {
      reset({
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone || '',
        companyName: lead.companyName || '',
        jobTitle: lead.jobTitle || '',
        source: lead.source || '',
        status: lead.status,
        priority: lead.priority,
        estimatedValue: lead.estimatedValue || 0,
        notes: lead.notes || '',
      });
    }
  }, [lead, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (!lead) throw new Error('No lead selected for update');
      return api.updateLead(lead.id, values as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', lead?.id] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardDistribution'] });
      onClose();
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  if (!lead) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Lead: ${lead.fullName}`}
      description="Update lead contact info, deal stage, priority, or notes."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mutation.isError && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {(mutation.error as Error).message || 'Failed to update lead.'}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            required
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            label="Email Address"
            type="email"
            required
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Company Name"
            error={errors.companyName?.message}
            {...register('companyName')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Job Title"
            error={errors.jobTitle?.message}
            {...register('jobTitle')}
          />

          <Input
            label="Lead Source"
            error={errors.source?.message}
            {...register('source')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Stage / Status"
            error={errors.status?.message}
            {...register('status')}
          >
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="INTERESTED">Interested</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </Select>

          <Select
            label="Priority"
            error={errors.priority?.message}
            {...register('priority')}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>

          <Input
            label="Estimated Value ($)"
            type="number"
            min="0"
            step="1000"
            error={errors.estimatedValue?.message}
            {...register('estimatedValue')}
          />
        </div>

        <Textarea
          label="Notes & Context"
          rows={3}
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="md" isLoading={mutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
