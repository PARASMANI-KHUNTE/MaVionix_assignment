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
    const rawModel = env.GEMINI_MODEL || 'gemini-3.5-flash';
    this.modelName = this.normalizeModelName(rawModel);
    this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  private normalizeModelName(model: string): string {
    const trimmed = model.trim();
    // Map deprecated or alias names to active Google AI Studio models
    const DEPRECATED_MAP: Record<string, string> = {
      'gemini-1.5-flash-latest': 'gemini-3.5-flash',
      'gemini-1.5-flash': 'gemini-3.5-flash',
      'gemini-2.5-flash': 'gemini-3.5-flash',
      'gemini-2.5-flash-lite': 'gemini-3.5-flash-lite',
      'gemini-1.5-pro': 'gemini-2.5-pro',
      'gemini-1.5-pro-latest': 'gemini-2.5-pro',
    };
    if (DEPRECATED_MAP[trimmed]) {
      return DEPRECATED_MAP[trimmed];
    }
    return trimmed;
  }

  async analyzeLead(context: LeadContextData): Promise<LeadAnalysisOutput> {
    const modelsToTry = [this.modelName, 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
    const uniqueModels = Array.from(new Set(modelsToTry));

    let lastError: any = null;

    for (const modelToUse of uniqueModels) {
      try {
        const model = this.client.getGenerativeModel({
          model: modelToUse,
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
5. Conversion probability must be an estimated percentage from 0 to 100.
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
        let text = response.response.text();

        // Strip markdown code fences if model wrapped the JSON
        text = text.trim();
        if (text.startsWith('```json')) {
          text = text.slice(7);
        } else if (text.startsWith('```')) {
          text = text.slice(3);
        }
        if (text.endsWith('```')) {
          text = text.slice(0, -3);
        }
        text = text.trim();

        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          throw new AppError('Gemini model returned malformed JSON output', 502, { raw: text });
        }

        const validated = LeadAnalysisOutputSchema.safeParse({
          ...(parsed as object),
          provider: 'gemini',
          model: modelToUse,
        });

        if (!validated.success) {
          throw new AppError('AI output failed schema validation', 502, validated.error.format());
        }

        return validated.data;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || '';
        // If 404 model not found or deprecated, try next model in fallback list
        if (errMsg.includes('404') || errMsg.includes('not found') || errMsg.includes('no longer available')) {
          console.warn(`Model ${modelToUse} failed (${errMsg.slice(0, 100)}...), trying fallback...`);
          continue;
        }
        // For other errors, break and report
        break;
      }
    }

    if (lastError instanceof AppError) throw lastError;
    console.error('Gemini API Error after fallback attempts:', lastError);
    throw new AppError(
      `Failed to generate AI intelligence from Gemini provider: ${lastError?.message || 'Unknown error'}`,
      502
    );
  }
}
