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
import { LeadPriority, LeadStatus } from '../../types';

const createLeadSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATION', 'CONVERTED', 'LOST']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  estimatedValue: z.coerce.number().min(0, 'Estimated value must be non-negative').default(0),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof createLeadSchema>;

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (leadId: string) => void;
}

export const CreateLeadModal: React.FC<CreateLeadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      companyName: '',
      jobTitle: '',
      source: 'Website Inbound',
      status: 'NEW',
      priority: 'MEDIUM',
      estimatedValue: 0,
      notes: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => api.createLead(values as any),
    onSuccess: (newLead) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardDistribution'] });
      reset();
      onClose();
      if (onSuccess) onSuccess(newLead.id);
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
      title="Create New Lead"
      description="Add a new prospective customer to your sales pipeline."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mutation.isError && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {(mutation.error as Error).message || 'Failed to create lead. Please check details.'}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. Maya Patel"
            required
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="maya@company.example"
            required
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            placeholder="+1 555-0199"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Company Name"
            placeholder="Acme Corp"
            error={errors.companyName?.message}
            {...register('companyName')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Job Title"
            placeholder="Head of Procurement"
            error={errors.jobTitle?.message}
            {...register('jobTitle')}
          />

          <Input
            label="Lead Source"
            placeholder="e.g. Conference, Referral, Inbound"
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
          placeholder="Add discovery details, budget notes, or key customer requirements..."
          rows={3}
          error={errors.notes?.message}
          {...register('notes')}
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
          <Button
            type="submit"
            size="md"
            isLoading={mutation.isPending}
          >
            Create Lead
          </Button>
        </div>
      </form>
    </Modal>
  );
};
