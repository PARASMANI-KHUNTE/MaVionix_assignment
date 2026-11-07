import { prisma } from '../../config/db.js';
import { CreateFollowUpInput, UpdateFollowUpInput, QueryFollowUpsInput } from './followUp.schema.js';
import { NotFoundError } from '../../utils/errors.js';
import { Prisma } from '@prisma/client';

export class FollowUpService {
  static async getFollowUps(query: QueryFollowUpsInput) {
    const { filter, leadId, page, limit } = query;
    const now = new Date();
    const skip = (page - 1) * limit;

    const baseWhere: Prisma.FollowUpWhereInput = {};
    if (leadId) {
      baseWhere.leadId = leadId;
    }

    const where: Prisma.FollowUpWhereInput = { ...baseWhere };

    if (filter === 'upcoming') {
      where.status = 'PENDING';
      where.dueAt = { gte: now };
    } else if (filter === 'overdue') {
      where.status = 'PENDING';
      where.dueAt = { lt: now };
    } else if (filter === 'completed') {
      where.status = 'COMPLETED';
    }

    // Determine sort order: for upcoming sort ascending by dueAt, for overdue sort ascending by dueAt, for completed sort desc by completedAt
    let orderBy: Prisma.FollowUpOrderByWithRelationInput = { dueAt: 'asc' };
    if (filter === 'completed') {
      orderBy = { completedAt: 'desc' };
    }

    const [total, items, pendingCount, upcomingCount, overdueCount, completedCount] =
      await Promise.all([
        prisma.followUp.count({ where }),
        prisma.followUp.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            lead: {
              select: {
                id: true,
                fullName: true,
                companyName: true,
                status: true,
                priority: true,
              },
            },
          },
        }),
        prisma.followUp.count({ where: { ...baseWhere, status: 'PENDING' } }),
        prisma.followUp.count({
          where: { ...baseWhere, status: 'PENDING', dueAt: { gte: now } },
        }),
        prisma.followUp.count({
          where: { ...baseWhere, status: 'PENDING', dueAt: { lt: now } },
        }),
        prisma.followUp.count({ where: { ...baseWhere, status: 'COMPLETED' } }),
      ]);

    // Attach computed isOverdue property
    const enrichedItems = items.map((item) => ({
      ...item,
      isOverdue: item.status === 'PENDING' && new Date(item.dueAt) < now,
    }));

    return {
      data: enrichedItems,
      counts: {
        total: pendingCount + completedCount,
        pending: pendingCount,
        upcoming: upcomingCount,
        overdue: overdueCount,
        completed: completedCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async createFollowUp(leadId: string, data: CreateFollowUpInput) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundError(`Lead with ID ${leadId} not found`);
    }

    return prisma.followUp.create({
      data: {
        leadId,
        title: data.title,
        description: data.description || null,
        dueAt: data.dueAt,
        status: 'PENDING',
      },
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
          },
        },
      },
    });
  }

  static async updateFollowUp(id: string, data: UpdateFollowUpInput) {
    const existing = await prisma.followUp.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Follow-up with ID ${id} not found`);
    }

    let completedAt = existing.completedAt;
    if (data.status) {
      if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
        completedAt = new Date();
      } else if (data.status === 'PENDING') {
        completedAt = null;
      }
    }

    const updated = await prisma.followUp.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.dueAt !== undefined ? { dueAt: data.dueAt } : {}),
        ...(data.status !== undefined ? { status: data.status, completedAt } : {}),
      },
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
            companyName: true,
          },
        },
      },
    });

    const now = new Date();
    return {
      ...updated,
      isOverdue: updated.status === 'PENDING' && new Date(updated.dueAt) < now,
    };
  }

  static async deleteFollowUp(id: string) {
    const existing = await prisma.followUp.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Follow-up with ID ${id} not found`);
    }

    await prisma.followUp.delete({ where: { id } });
    return { success: true, message: 'Follow-up deleted successfully' };
  }
}
