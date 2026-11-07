import { prisma } from '../../config/db.js';
import { CreateActivityInput } from './activity.schema.js';
import { NotFoundError } from '../../utils/errors.js';

export class ActivityService {
  static async getActivitiesByLeadId(leadId: string) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundError(`Lead with ID ${leadId} not found`);
    }

    return prisma.activity.findMany({
      where: { leadId },
      orderBy: { occurredAt: 'desc' },
    });
  }

  static async createActivity(leadId: string, data: CreateActivityInput) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundError(`Lead with ID ${leadId} not found`);
    }

    return prisma.activity.create({
      data: {
        leadId,
        type: data.type,
        subject: data.subject,
        description: data.description || null,
        occurredAt: data.occurredAt,
      },
    });
  }
}
