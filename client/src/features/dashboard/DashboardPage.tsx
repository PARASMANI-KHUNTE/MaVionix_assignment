import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  Users,
  UserPlus,
  Trophy,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  FileText,
  DollarSign,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDateTime, getStatusBadgeProps } from '../../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => api.getDashboardSummary(),
  });

  const {
    data: distribution,
    isLoading: distLoading,
    error: distError,
  } = useQuery({
    queryKey: ['dashboardDistribution'],
    queryFn: () => api.getDashboardDistribution(),
  });

  const {
    data: performance,
    isLoading: perfLoading,
    error: perfError,
  } = useQuery({
    queryKey: ['dashboardPerformance'],
    queryFn: () => api.getDashboardPerformance(),
  });

  const {
    data: recentActivities,
    isLoading: actLoading,
    error: actError,
  } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: () => api.getRecentActivities(6),
  });

  if (summaryLoading || distLoading || perfLoading || actLoading) {
    return <LoadingSpinner size="lg" text="Loading dashboard metrics..." className="h-96" />;
  }

  if (summaryError || distError || perfError || actError) {
    return (
      <ErrorState
        title="Failed to load dashboard metrics"
        message="Could not retrieve data from the CRM server. Please ensure the backend is connected."
        onRetry={() => refetchSummary()}
      />
    );
  }

  const kpis = [
    {
      label: 'Total Leads',
      value: summary?.totalLeads ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtext: `Total pipeline: ${formatCurrency(summary?.totalPipelineValue)}`,
    },
    {
      label: 'New Leads',
      value: summary?.newLeads ?? 0,
      icon: UserPlus,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      subtext: 'Awaiting discovery call',
    },
    {
      label: 'Converted Customers',
      value: summary?.convertedCustomers ?? 0,
      icon: Trophy,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      subtext: 'Won deals in portfolio',
    },
    {
      label: 'Pending Follow-ups',
      value: summary?.pendingFollowUps ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      subtext: (
        <span className="flex items-center gap-1 font-medium text-rose-600">
          <AlertTriangle className="h-3 w-3" />
          {summary?.overdueFollowUps ?? 0} overdue
        </span>
      ),
    },
    {
      label: 'Lead Conversion Rate',
      value: `${summary?.conversionRate ?? 0}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      subtext: 'Converted / Total Leads',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL':
        return <Phone className="h-3.5 w-3.5 text-blue-500" />;
      case 'EMAIL':
        return <Mail className="h-3.5 w-3.5 text-purple-500" />;
      case 'MEETING':
        return <Calendar className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Executive Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">
          Real-time visibility into sales pipeline velocity, lead stages, and team activity.
        </p>
      </div>

      {/* Overdue alert banner if any */}
      {(summary?.overdueFollowUps ?? 0) > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200/80 p-4 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                You have {summary?.overdueFollowUps} overdue follow-up task
                {summary?.overdueFollowUps === 1 ? '' : 's'}!
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Proactively engaging leads before momentum slows improves conversion probabilities.
              </p>
            </div>
          </div>
          <Link
            to="/follow-ups"
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Review tasks
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* 5 Required KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</p>
                <div className="mt-1 text-xs text-slate-500">{kpi.subtext}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Distribution Chart */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Lead Distribution by Stage</h3>
              <p className="text-xs text-slate-500 mt-0.5">Current volume across sales stages</p>
            </div>
            <Link
              to="/pipeline"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Open Pipeline <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg">
                          <p className="font-semibold">{data.status}</p>
                          <p className="text-slate-300">Leads: {data.count}</p>
                          <p className="text-emerald-400 font-medium">
                            Value: {formatCurrency(data.value)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Sales Performance Trend */}
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sales Inbound & Pipeline Value</h3>
              <p className="text-xs text-slate-500 mt-0.5">Database-backed lead trajectory</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={performance}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg">
                          <p className="font-semibold">{data.month}</p>
                          <p className="text-slate-300">New Leads: {data.leadsCount}</p>
                          <p className="text-slate-300">Converted: {data.convertedCount}</p>
                          <p className="text-emerald-400 font-medium">
                            Pipeline Value: {formatCurrency(data.pipelineValue)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pipelineValue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Customer Activities</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live audit trail of calls, emails, notes, and stage updates
            </p>
          </div>
          <Link
            to="/leads"
            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            All Leads <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentActivities && recentActivities.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentActivities.map((act) => {
              const badge = act.lead ? getStatusBadgeProps(act.lead.status) : null;
              return (
                <div key={act.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 mt-0.5">
                      {getActivityIcon(act.type)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{act.subject}</p>
                      {act.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {act.description}
                        </p>
                      )}
                      {act.lead && (
                        <div className="flex items-center gap-2 mt-1">
                          <Link
                            to={`/leads/${act.lead.id}`}
                            className="text-[11px] font-medium text-blue-600 hover:underline"
                          >
                            {act.lead.fullName} {act.lead.companyName && `(${act.lead.companyName})`}
                          </Link>
                          {badge && (
                            <Badge dot dotColor={badge.dotColor} className={badge.className}>
                              {badge.label}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {formatDateTime(act.occurredAt)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">No recent activities logged yet.</p>
        )}
      </Card>
    </div>
  );
};
