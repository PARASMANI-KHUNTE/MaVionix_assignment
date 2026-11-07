import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';
import { NotFoundError } from '../../utils/errors.js';
import { AIProvider, LeadContextData } from './ai.interface.js';
import { MockAIProvider } from './mock.provider.js';
import { GeminiAIProvider } from './gemini.provider.js';

export class AIService {
  private static getProvider(): AIProvider {
    if (env.AI_PROVIDER === 'gemini' && env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
      return new GeminiAIProvider();
    }
    return new MockAIProvider();
  }

  static async analyzeLead(leadId: string) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        activities: {
          orderBy: { occurredAt: 'desc' },
        },
        followUps: {
          orderBy: { dueAt: 'asc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundError(`Lead with ID ${leadId} not found`);
    }

    const now = new Date();
    const context: LeadContextData = {
      lead: {
        id: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        companyName: lead.companyName,
        jobTitle: lead.jobTitle,
        source: lead.source,
        status: lead.status,
        priority: lead.priority,
        estimatedValue: lead.estimatedValue,
        notes: lead.notes,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      },
      activities: lead.activities.map((a) => ({
        id: a.id,
        type: a.type,
        subject: a.subject,
        description: a.description,
        occurredAt: a.occurredAt,
      })),
      followUps: lead.followUps.map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        dueAt: f.dueAt,
        status: f.status,
        completedAt: f.completedAt,
        isOverdue: f.status === 'PENDING' && new Date(f.dueAt) < now,
      })),
    };

    const provider = this.getProvider();
    const result = await provider.analyzeLead(context);

    // Persist analysis record
    const savedAnalysis = await prisma.leadAnalysis.create({
      data: {
        leadId,
        summary: result.summary,
        score: result.score,
        conversionProbability: result.conversionProbability,
        keySignals: result.keySignals,
        nextBestAction: result.nextBestAction,
        followUpSubject: result.followUpMessage.subject,
        followUpBody: result.followUpMessage.body,
        limitations: result.limitations,
        provider: result.provider,
        model: result.model,
      },
    });

    return {
      ...result,
      id: savedAnalysis.id,
      createdAt: savedAnalysis.createdAt,
    };
  }

  static async getLatestAnalysis(leadId: string) {
    const analysis = await prisma.leadAnalysis.findFirst({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    });

    if (!analysis) return null;

    return {
      id: analysis.id,
      summary: analysis.summary,
      score: analysis.score,
      conversionProbability: analysis.conversionProbability,
      keySignals: analysis.keySignals,
      nextBestAction: analysis.nextBestAction,
      followUpMessage: {
        subject: analysis.followUpSubject,
        body: analysis.followUpBody,
      },
      limitations: analysis.limitations,
      provider: analysis.provider,
      model: analysis.model,
      createdAt: analysis.createdAt,
    };
  }
}
