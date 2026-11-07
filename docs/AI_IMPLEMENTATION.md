# AI Lead Intelligence Specification & Architecture

## 1. Overview
The AI Lead Intelligence feature is the core differentiator of NexusCRM, evaluated as the highest-weight requirement (20% of the technical assignment). It operates exclusively on the backend as an objective analytical advisor, grounding all deductions directly in verified CRM records (lead attributes, recorded calls/emails/meetings, and overdue/pending follow-up milestones).

It completely avoids hallucination, unverified assumptions, or false precision. If critical context (such as lead notes or interaction logs) is absent, the system explicitly documents these uncertainties in the `limitations` array.

---

## 2. Provider Abstraction Architecture

The backend implements a clean provider pattern through the `AIProvider` TypeScript interface:

```
                   +------------------------+
                   |       AI Service       |
                   |   (Selects Provider)   |
                   +-----------+------------+
                               |
              +----------------+----------------+
              |                                 |
              v                                 v
   +--------------------+             +--------------------+
   |  GeminiAIProvider  |             |   MockAIProvider   |
   | (Google Gemini API)|             |  (Deterministic)   |
   +--------------------+             +--------------------+
```

### Provider Contract
Every provider implements:
```typescript
export interface AIProvider {
  readonly name: 'gemini' | 'mock';
  readonly modelName: string;
  analyzeLead(context: LeadContextData): Promise<LeadAnalysisOutput>;
}
```

### Active Mode Configuration
The active provider is governed by environment variables in `server/.env`:
- `AI_PROVIDER`: `"gemini"` or `"mock"` (defaults to `"mock"`).
- `GEMINI_API_KEY`: API key for Google Gemini (Google AI Studio).
- `GEMINI_MODEL`: Model identifier (defaults to `"gemini-1.5-flash"`).

If `GEMINI_API_KEY` is not provided or `AI_PROVIDER=mock`, the system activates `MockAIProvider`. The UI displays a persistent badge (`Gemini 1.5 Flash` vs `Demo / Mock AI`), guaranteeing that mock output is never disguised as real model output.

---

## 3. Input Context Construction

When `POST /api/ai/leads/:id/analyze` is called, the backend queries PostgreSQL via Prisma to build a sanitized, comprehensive context payload:

```json
{
  "lead": {
    "id": "uuid",
    "fullName": "Vikram Malhotra",
    "email": "v.malhotra@zenithlogistics.example",
    "phone": "+91 97110 54321",
    "companyName": "Zenith Logistics Global",
    "jobTitle": "Chief Commercial Officer",
    "source": "Industry Conference",
    "status": "INTERESTED",
    "priority": "HIGH",
    "estimatedValue": 85000,
    "notes": "Met at Logistics Tech Summit 2026. Highly interested in AI lead scoring...",
    "createdAt": "2026-10-29T...",
    "updatedAt": "2026-11-04T..."
  },
  "activities": [
    {
      "id": "uuid",
      "type": "CALL",
      "subject": "Detailed Demo with Commercial Team",
      "description": "Presented live product demo to Vikram and 3 regional sales directors.",
      "occurredAt": "2026-11-03T..."
    }
  ],
  "followUps": [
    {
      "id": "uuid",
      "title": "Follow up on Security Review Sign-off",
      "description": "Confirm their InfoSec lead completed vendor risk assessment.",
      "dueAt": "2026-11-07T...",
      "status": "PENDING",
      "isOverdue": true
    }
  ]
}
```

---

## 4. Output Schema & Strict Zod Validation

All model responses (real or mock) are validated against a strict Zod schema before persisting to the database or returning to the client:

```typescript
export const LeadAnalysisOutputSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  score: z.number().int().min(1).max(100, 'Score must be between 1 and 100'),
  conversionProbability: z.number().min(0).max(100, 'Conversion probability must be between 0 and 100'),
  keySignals: z.array(z.string()).min(1, 'At least one key signal is required'),
  nextBestAction: z.string().min(1, 'Next best action is required'),
  followUpMessage: z.object({
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(1, 'Body is required'),
  }),
  limitations: z.array(z.string()).default([]),
  provider: z.enum(['gemini', 'mock']),
  model: z.string(),
});
```

### The 5 Required Deliverables
1. **Executive Summary**: A concise, factual summary of the lead's current status, deal size, and explicit business requirements.
2. **Lead Health Score (1–100)**: An integer reflecting engagement health, response velocity, and qualification completeness.
3. **Estimated Conversion Probability (0–100%)**: Clearly labeled in the UI as a statistical projection rather than a guaranteed outcome.
4. **Key Signals & Next Best Action**: Granular bullet points explaining the driving signals (e.g. overdue tasks, unanswered outreach) plus a concrete next action for the sales representative.
5. **Personalized Follow-up Message**: Pre-drafted email with a contextual subject line and body that addresses the prospect by name and cites their specific requirements, complete with a 1-click clipboard copy button.

---

## 5. Deterministic Mock Engine Details

In demo/mock mode, the `MockAIProvider` applies deterministic scoring heuristics:
- **Baseline Stage Weighting**:
  - `NEW`: Base Score 42, Est. Probability 30%
  - `CONTACTED`: Base Score 56, Est. Probability 48%
  - `INTERESTED`: Base Score 76, Est. Probability 72%
  - `NEGOTIATION`: Base Score 89, Est. Probability 84%
  - `CONVERTED`: Base Score 98, Est. Probability 99%
  - `LOST`: Base Score 12, Est. Probability 4%
- **Deal Priority Modifier**: High (+7 score, +5 prob), Low (-8 score, -6 prob).
- **Engagement Depth**: ≥ 3 interactions (+6 score, +5 prob), 0 interactions (-6 score, -5 prob).
- **Overdue Penalty**: Deducts 6 points per overdue reminder (capped at -15) and highlights the urgency in the next best action.
- **Data Gap Auditing**: If `notes` are missing or empty, adds explicit entries to the `limitations` array.

---

## 6. Resilience & Security Safeguards
- **Backend-Only Execution**: The client never possesses API keys or directly communicates with model endpoints.
- **Express Rate Limiting**: AI analysis endpoints are rate-limited (`express-rate-limit`) to prevent quota exhaustion or denial-of-service.
- **Prompt Injection Defense**: CRM user content is treated strictly as untrusted input data enclosed in a separate JSON payload, and the system prompt instructs the model to ignore any instructions embedded within lead notes.
- **Timeout & Error Safety**: If the external model returns malformed JSON or times out, the backend throws an `AppError` with status `502 Bad Gateway`, returning a safe user error without exposing system credentials or stack traces.
