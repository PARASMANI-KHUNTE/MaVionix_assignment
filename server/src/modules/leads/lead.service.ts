import { prisma } from '../../config/db.js';
import { CreateLeadInput, UpdateLeadInput, QueryLeadsInput } from './lead.schema.js';
import { NotFoundError } from '../../utils/errors.js';
import { Prisma } from '@prisma/client';

export class LeadService {
  static async getLeads(query: QueryLeadsInput) {
    const { search, status, priority, page, limit, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search && search.trim() !== '') {
      const trimmed = search.trim();
      where.OR = [
        { fullName: { contains: trimmed, mode: 'insensitive' } },
        { email: { contains: trimmed, mode: 'insensitive' } },
        { companyName: { contains: trimmed, mode: 'insensitive' } },
      ];
    }

    const [total, leads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
            select: {
              score: true,
              conversionProbability: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    return {
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getLeadById(id: string) {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { occurredAt: 'desc' },
        },
        followUps: {
          orderBy: { dueAt: 'asc' },
        },
        analyses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundError(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  static async createLead(data: CreateLeadInput) {
    return prisma.lead.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        companyName: data.companyName || null,
        jobTitle: data.jobTitle || null,
        source: data.source || null,
        status: data.status,
        priority: data.priority,
        estimatedValue: data.estimatedValue,
        notes: data.notes || null,
      },
    });
  }

  static async updateLead(id: string, data: UpdateLeadInput) {
    // Check if lead exists
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Lead with ID ${id} not found`);
    }

    return prisma.lead.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.companyName !== undefined ? { companyName: data.companyName } : {}),
        ...(data.jobTitle !== undefined ? { jobTitle: data.jobTitle } : {}),
        ...(data.source !== undefined ? { source: data.source } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.estimatedValue !== undefined ? { estimatedValue: data.estimatedValue } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });
  }

  static async deleteLead(id: string) {
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Lead with ID ${id} not found`);
    }

    await prisma.lead.delete({
      where: { id },
    });

    return { success: true, message: 'Lead deleted successfully' };
  }
}
