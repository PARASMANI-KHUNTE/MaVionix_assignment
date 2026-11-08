import { prisma } from '../../config/db.js';
import { LeadStatus, ActivityType } from '@prisma/client';
import { NotFoundError } from '../../utils/errors.js';

export const PIPELINE_STAGES: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'INTERESTED',
  'NEGOTIATION',
  'CONVERTED',
  'LOST',
];

export class PipelineService {
  static async getPipeline() {
    const leads = await prisma.lead.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            activities: true,
            followUps: { where: { status: 'PENDING' } },
          },
        },
        analyses: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { score: true, conversionProbability: true },
        },
      },
    });

    // Group leads by stage
    const columns: Record<
      LeadStatus,
      {
        stage: LeadStatus;
        label: string;
        count: number;
        totalValue: number;
        leads: typeof leads;
      }
    > = {
      NEW: { stage: 'NEW', label: 'New', count: 0, totalValue: 0, leads: [] },
      CONTACTED: { stage: 'CONTACTED', label: 'Contacted', count: 0, totalValue: 0, leads: [] },
      INTERESTED: { stage: 'INTERESTED', label: 'Interested', count: 0, totalValue: 0, leads: [] },
      NEGOTIATION: { stage: 'NEGOTIATION', label: 'Negotiation', count: 0, totalValue: 0, leads: [] },
      CONVERTED: { stage: 'CONVERTED', label: 'Converted', count: 0, totalValue: 0, leads: [] },
      LOST: { stage: 'LOST', label: 'Lost', count: 0, totalValue: 0, leads: [] },
    };

    for (const lead of leads) {
      if (columns[lead.status]) {
        columns[lead.status].leads.push(lead);
        columns[lead.status].count += 1;
        columns[lead.status].totalValue += lead.estimatedValue || 0;
      }
    }

    return {
      stages: PIPELINE_STAGES.map((stage) => columns[stage]),
      summary: {
        totalLeads: leads.length,
        totalPipelineValue: leads.reduce((acc, lead) => acc + (lead.estimatedValue || 0), 0),
      },
    };
  }

  static async updateLeadStatus(leadId: string, newStatus: LeadStatus) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundError(`Lead with ID ${leadId} not found`);
    }

    const previousStatus = lead.status;
    if (previousStatus === newStatus) {
      return lead;
    }

    // Update lead status and record stage-change activity transactionally
    const [updatedLead] = await prisma.$transaction([
      prisma.lead.update({
        where: { id: leadId },
        data: { status: newStatus },
      }),
      prisma.activity.create({
        data: {
          leadId,
          type: ActivityType.STATUS_CHANGE,
          subject: `Stage updated from ${previousStatus} to ${newStatus}`,
          description: `Lead moved along the sales pipeline from ${previousStatus} to ${newStatus}.`,
          occurredAt: new Date(),
        },
      }),
    ]);

    return updatedLead;
  }
}
