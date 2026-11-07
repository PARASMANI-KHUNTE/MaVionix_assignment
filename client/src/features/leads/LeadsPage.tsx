import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Lead, LeadPriority, LeadStatus } from '../../types';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { CreateLeadModal } from './CreateLeadModal';
import { EditLeadModal } from './EditLeadModal';
import { DeleteLeadModal } from './DeleteLeadModal';
import {
  formatCurrency,
  formatDate,
  getPriorityBadgeProps,
  getStatusBadgeProps,
} from '../../lib/utils';

export const LeadsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leads', { search, status, priority, page, limit, sortBy, sortOrder }],
    queryFn: () =>
      api.getLeads({
        search: search.trim() || undefined,
        status: status || undefined,
        priority: priority || undefined,
        page,
        limit,
        sortBy,
        sortOrder,
      }),
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Leads Directory</h2>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, prioritize, and manage prospective accounts.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Create Lead
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, or company..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          >
            <option value="">All Stages (Statuses)</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="INTERESTED">Interested</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Reset Filters Button */}
          {(search || status || priority) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatus('');
                setPriority('');
                setPage(1);
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Main Table / Content */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner size="lg" text="Loading leads..." className="h-64" />
        ) : error ? (
          <ErrorState
            title="Failed to load leads"
            message={(error as Error).message}
            onRetry={() => refetch()}
            className="m-6"
          />
        ) : data?.data && data.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('fullName')}
                  >
                    <div className="flex items-center gap-1.5">
                      Lead Contact
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('companyName')}
                  >
                    <div className="flex items-center gap-1.5">
                      Company
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('estimatedValue')}
                  >
                    <div className="flex items-center gap-1.5">
                      Est. Value
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">AI Score</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((lead) => {
                  const statusBadge = getStatusBadgeProps(lead.status);
                  const priorityBadge = getPriorityBadgeProps(lead.priority);
                  const aiAnalysis = lead.analyses && lead.analyses[0];

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1.5"
                        >
                          {lead.fullName}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1 hidden md:flex">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Company & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {lead.companyName || '—'}
                        </div>
                        {lead.jobTitle && (
                          <p className="text-xs text-slate-400 mt-0.5">{lead.jobTitle}</p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge
                          dot
                          dotColor={statusBadge.dotColor}
                          className={statusBadge.className}
                        >
                          {statusBadge.label}
                        </Badge>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <Badge className={priorityBadge.className}>
                          {priorityBadge.label}
                        </Badge>
                      </td>

                      {/* Value */}
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {lead.estimatedValue && lead.estimatedValue > 0
                          ? formatCurrency(lead.estimatedValue)
                          : '—'}
                      </td>

                      {/* AI Score */}
                      <td className="py-3.5 px-4">
                        {aiAnalysis ? (
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            <span className="font-bold text-slate-800 text-xs">
                              {aiAnalysis.score}/100
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({aiAnalysis.conversionProbability}% est)
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not analyzed</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/leads/${lead.id}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Full Profile"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setEditLead(lead)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Lead"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteLead(lead)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing{' '}
                  <span className="font-semibold text-slate-700">
                    {(page - 1) * limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-slate-700">
                    {Math.min(page * limit, data.pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-700">
                    {data.pagination.total}
                  </span>{' '}
                  leads
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
                  <span className="text-xs font-medium text-slate-600 px-2">
                    Page {page} of {data.pagination.totalPages}
                  </span>
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
            title="No leads found"
            description={
              search || status || priority
                ? 'Try adjusting your search filters or clearing them to see all leads.'
                : 'Get started by creating your first lead in the CRM.'
            }
            actionLabel="Create New Lead"
            onAction={() => setCreateOpen(true)}
            className="m-6"
          />
        )}
      </Card>

      {/* Modals */}
      <CreateLeadModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <EditLeadModal
        isOpen={Boolean(editLead)}
        lead={editLead}
        onClose={() => setEditLead(null)}
      />

      <DeleteLeadModal
        isOpen={Boolean(deleteLead)}
        lead={deleteLead}
        onClose={() => setDeleteLead(null)}
      />
    </div>
  );
};
