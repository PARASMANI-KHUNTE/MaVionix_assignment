import {
  AIProvider,
  LeadAnalysisOutput,
  LeadAnalysisOutputSchema,
  LeadContextData,
} from './ai.interface.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/errors.js';

export class NeonAIGatewayProvider implements AIProvider {
  public readonly name = 'neon-ai-gateway' as const;
  public readonly modelName: string;
  private token: string;
  private baseUrl: string;

  constructor() {
    this.token = env.NEON_AI_GATEWAY_TOKEN || '';
    this.baseUrl = env.NEON_AI_GATEWAY_BASE_URL || '';
    this.modelName = 'gemini-3-flash'; // Supported in Neon AI Gateway catalog
  }

  static async getCatalogModels(): Promise<{ count: number; models: string[]; status: string }> {
    if (!env.NEON_AI_GATEWAY_TOKEN || !env.NEON_AI_GATEWAY_BASE_URL) {
      return { count: 0, models: [], status: 'unconfigured' };
    }

    try {
      const res = await fetch(`${env.NEON_AI_GATEWAY_BASE_URL}/v1/models`, {
        headers: {
          Authorization: `Bearer ${env.NEON_AI_GATEWAY_TOKEN}`,
        },
      });

      if (!res.ok) {
        return { count: 0, models: [], status: `HTTP ${res.status}: ${res.statusText}` };
      }

      const data = (await res.json()) as any;
      const models = Array.isArray(data.data) ? data.data.map((m: any) => m.id) : [];
      return {
        count: models.length,
        models: models.slice(0, 10),
        status: data.request_context_availability?.http?.reason || 'active',
      };
    } catch (err: any) {
      return { count: 0, models: [], status: err?.message || 'failed' };
    }
  }

  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded';
    baseUrl: string;
    modelCount: number;
    creditsStatus: string;
    latencyMs: number;
  }> {
    const start = Date.now();
    try {
      const catalog = await this.getCatalogModels();
      return {
        status: catalog.count > 0 ? 'healthy' : 'degraded',
        baseUrl: env.NEON_AI_GATEWAY_BASE_URL || 'unconfigured',
        modelCount: catalog.count,
        creditsStatus: catalog.status,
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        status: 'degraded',
        baseUrl: env.NEON_AI_GATEWAY_BASE_URL || 'error',
        modelCount: 0,
        creditsStatus: 'unreachable',
        latencyMs: Date.now() - start,
      };
    }
  }

  async analyzeLead(context: LeadContextData): Promise<LeadAnalysisOutput> {
    if (!this.token || !this.baseUrl) {
      throw new AppError('Neon AI Gateway credentials or URL not configured', 500);
    }

    const systemPrompt = `You are an expert CRM sales intelligence analyst. Analyze the CRM lead record and return purely valid JSON.
CRITICAL RULES:
1. Ground assessment only on provided CRM data.
2. Score: integer 1-100.
3. Conversion probability: integer 0-100.
4. Output must match the requested schema exactly.`;

    const userPrompt = `Analyze this lead record:
${JSON.stringify(context, null, 2)}

Return pure JSON with keys: summary, score, conversionProbability, keySignals, nextBestAction, followUpMessage { subject, body }, limitations.`;

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Neon AI Gateway returned HTTP ${response.status}: ${errBody}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty completion from Neon AI Gateway');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error('Failed to parse JSON output from Neon AI Gateway');
    }

    return LeadAnalysisOutputSchema.parse({
      ...parsed,
      provider: 'neon-ai-gateway',
      model: this.modelName,
    });
  }
}
