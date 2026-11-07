import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIProvider,
  LeadAnalysisOutput,
  LeadAnalysisOutputSchema,
  LeadContextData,
} from './ai.interface.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/errors.js';

export class GeminiAIProvider implements AIProvider {
  public readonly name = 'gemini' as const;
  public readonly modelName: string;
  private client: GoogleGenerativeAI;

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new AppError('Gemini API key is not configured on the server', 500);
    }
    this.modelName = env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  async analyzeLead(context: LeadContextData): Promise<LeadAnalysisOutput> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
        systemInstruction: `You are an expert CRM sales intelligence analyst. Your role is to analyze supplied CRM lead records and provide structured, objective, and actionable intelligence.
CRITICAL RULES:
1. Ground your assessment ONLY on the provided CRM data (lead details, recorded activities, and follow-ups).
2. Do NOT hallucinate or invent customer facts, budgets, conversation details, or commitments not present in the record.
3. If information is sparse or missing (e.g. no notes or no activities), state this clearly in "limitations" and adjust confidence accordingly.
4. Score must be an integer from 1 to 100 representing lead quality and engagement.
5. Conversion probability must be a estimated percentage from 0 to 100.
6. Return purely valid JSON conforming to the requested schema. Do not wrap in markdown quotes.`,
      });

      const prompt = `Please analyze this CRM lead record:
${JSON.stringify(context, null, 2)}

Return a JSON object with this exact structure:
{
  "summary": "Short factual summary of the lead and stated requirements",
  "score": 75, // integer 1-100
  "conversionProbability": 60, // number 0-100 estimate
  "keySignals": ["key point 1", "key point 2"],
  "nextBestAction": "Concrete recommended action for the sales rep",
  "followUpMessage": {
    "subject": "Clear, contextual email subject",
    "body": "Professional personalized draft email addressing the lead"
  },
  "limitations": ["Any data gaps, e.g. unverified budget or missing direct phone contact"]
}`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new AppError('Gemini model returned malformed JSON output', 502, { raw: text });
      }

      const validated = LeadAnalysisOutputSchema.safeParse({
        ...(parsed as object),
        provider: 'gemini',
        model: this.modelName,
      });

      if (!validated.success) {
        throw new AppError('AI output failed schema validation', 502, validated.error.format());
      }

      return validated.data;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      console.error('Gemini API Error:', err);
      throw new AppError(
        `Failed to generate AI intelligence from Gemini provider: ${err?.message || 'Unknown error'}`,
        502
      );
    }
  }
}
