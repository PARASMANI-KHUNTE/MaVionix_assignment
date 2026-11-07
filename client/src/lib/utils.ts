import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LeadPriority, LeadStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusBadgeProps(status: LeadStatus): {
  label: string;
  className: string;
  dotColor: string;
} {
  switch (status) {
    case 'NEW':
      return {
        label: 'New',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        dotColor: 'bg-blue-500',
      };
    case 'CONTACTED':
      return {
        label: 'Contacted',
        className: 'bg-purple-50 text-purple-700 border-purple-200',
        dotColor: 'bg-purple-500',
      };
    case 'INTERESTED':
      return {
        label: 'Interested',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        dotColor: 'bg-amber-500',
      };
    case 'NEGOTIATION':
      return {
        label: 'Negotiation',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dotColor: 'bg-indigo-500',
      };
    case 'CONVERTED':
      return {
        label: 'Converted',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotColor: 'bg-emerald-500',
      };
    case 'LOST':
      return {
        label: 'Lost',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
        dotColor: 'bg-slate-400',
      };
  }
}

export function getPriorityBadgeProps(priority: LeadPriority): {
  label: string;
  className: string;
} {
  switch (priority) {
    case 'HIGH':
      return {
        label: 'High',
        className: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    case 'MEDIUM':
      return {
        label: 'Medium',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'LOW':
      return {
        label: 'Low',
        className: 'bg-slate-50 text-slate-600 border-slate-200',
      };
  }
}
