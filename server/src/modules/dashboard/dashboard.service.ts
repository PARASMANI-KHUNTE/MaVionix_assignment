import { prisma } from '../../config/db.js';
import { LeadStatus } from '@prisma/client';

export class DashboardService {
  static async getSummary() {
    const now = new Date();

    const [
      totalLeads,
      newLeads,
      convertedCustomers,
      pendingFollowUps,
      overdueFollowUps,
      valueAggregation,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.lead.count({ where: { status: 'CONVERTED' } }),
      prisma.followUp.count({ where: { status: 'PENDING' } }),
      prisma.followUp.count({ where: { status: 'PENDING', dueAt: { lt: now } } }),
      prisma.lead.aggregate({
        _sum: {
          estimatedValue: true,
        },
      }),
    ]);

    const totalPipelineValue = valueAggregation._sum.estimatedValue || 0;
    const conversionRate =
      totalLeads > 0 ? Math.round((convertedCustomers / totalLeads) * 1000) / 10 : 0;

    return {
      totalLeads,
      newLeads,
      convertedCustomers,
      pendingFollowUps,
      overdueFollowUps,
      conversionRate, // Percentage e.g. 12.5
      totalPipelineValue,
    };
  }

  static async getLeadDistribution() {
    const statuses: LeadStatus[] = [
      'NEW',
      'CONTACTED',
      'INTERESTED',
      'NEGOTIATION',
      'CONVERTED',
      'LOST',
    ];

    const distribution = await prisma.lead.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
      _sum: {
        estimatedValue: true,
      },
    });

    const distMap = new Map(
      distribution.map((d) => [
        d.status,
        { count: d._count._all, value: d._sum.estimatedValue || 0 },
      ])
    );

    return statuses.map((status) => {
      const data = distMap.get(status) || { count: 0, value: 0 };
      return {
        status,
        count: data.count,
        value: data.value,
      };
    });
  }

  static async getSalesPerformance() {
    // Fetch all leads with their creation date and status for real, database-backed trend
    const leads = await prisma.lead.findMany({
      select: {
        createdAt: true,
        status: true,
        estimatedValue: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group leads by month label (e.g. "Oct", "Nov", "Dec")
    const monthMap = new Map<string, { month: string; leadsCount: number; convertedCount: number; pipelineValue: number }>();

    for (const lead of leads) {
      const date = new Date(lead.createdAt);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });

      if (!monthMap.has(key)) {
        monthMap.set(key, { month: key, leadsCount: 0, convertedCount: 0, pipelineValue: 0 });
      }

      const item = monthMap.get(key)!;
      item.leadsCount += 1;
      item.pipelineValue += lead.estimatedValue || 0;
      if (lead.status === 'CONVERTED') {
        item.convertedCount += 1;
      }
    }

    return Array.from(monthMap.values());
  }

  static async getRecentActivities(limit = 10) {
    return prisma.activity.findMany({
      take: limit,
      orderBy: { occurredAt: 'desc' },
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
            status: true,
          },
        },
      },
    });
  }
}
