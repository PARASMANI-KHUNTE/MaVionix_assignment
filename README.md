# NexusCRM — AI-Powered Sales Intelligence CRM

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2d3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791.svg)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38b2ac.svg)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini_API-1.5_Flash-orange.svg)](https://ai.google.dev/)

NexusCRM is a full-stack, responsive, and robust Customer Relationship Management system built for modern sales teams. It empowers sales representatives to track prospective leads across a 6-stage Kanban pipeline, log multi-channel customer interactions, schedule follow-ups with derived overdue tracking, and leverage grounded AI lead intelligence for automated deal scoring, conversion probability estimates, and contextual follow-up email drafts.

---

## Key Features

### 1. Executive Dashboard (100% Database-Backed)
- **5 Core KPI Cards**: Total Leads, New Leads, Converted Customers, Pending Follow-ups (with overdue warning count), and Lead Conversion Rate.
- **Lead Distribution Chart**: Visual volume breakdown across all 6 stages (`NEW`, `CONTACTED`, `INTERESTED`, `NEGOTIATION`, `CONVERTED`, `LOST`).
- **Sales Performance Area Chart**: Historical trajectory of inbound deal count and estimated pipeline value.
- **Recent Activity Audit Feed**: Live chronological log of team touchpoints and stage progressions.

### 2. Complete Lead Lifecycle (CRUD & Search)
- **Search & Multi-Filter**: Real-time search across names, emails, and company names; filterable by stage and priority (`LOW`, `MEDIUM`, `HIGH`).
- **Validated Creation & Editing**: Managed with React Hook Form and Zod schemas, enforcing email format, mandatory names, and non-negative values.
- **Safe Deletion**: Deletion dialog with confirmation preventing accidental data loss and cascading associated records.
- **Rich Customer Profile**: Dedicated profile view consolidating contact info, deal financials, discovery notes, interaction history, reminders, and AI intelligence.

### 3. Six-Stage Interactive Pipeline (Kanban)
- **Fluid Drag-and-Drop**: Built using `@dnd-kit` for intuitive card movement between stages.
- **Reversible Optimistic Updates**: Board state updates instantly with automatic rollback if a network error occurs.
- **Full Accessibility Fallback**: Every card includes an inline stage selector for keyboard and assistive device navigation.
- **Automated Stage Activity Logging**: Moving a lead between stages automatically logs an audit trail event.

### 4. Customer Activity Timeline
- Multi-channel interaction logging: **Phone Call**, **Email Exchange**, **Meeting / Demo**, **Internal Note**, and **Follow-up Activity**.
- Reverse chronological timeline display with formatted local timestamps and descriptive notes.

### 5. Follow-up Tasks & Intelligent Overdue Logic
- Schedule reminders with specific due dates and actionable descriptions.
- **Accurate Derived Overdue State**: Overdue is computed dynamically as `status === 'PENDING' && dueAt < now()`. Completed tasks are never labeled overdue.
- Filter views for **All**, **Upcoming**, **Overdue**, and **Completed** reminders with 1-click completion toggle.

### 6. AI Lead Intelligence (Backend-Grounded)
- Grounded strictly in actual lead profile data, interaction logs, and follow-up milestones.
- **All 5 Required Deliverables**:
  1. *Executive Summary*: Clear synthesis of prospect needs and deal size.
  2. *Lead Health Score (1–100)*: Objective qualification score.
  3. *Conversion Probability Estimate (0–100%)*: Clearly labeled as a statistical estimate to prevent false certainty.
  4. *Key Signals & Recommended Next Action*: Concrete bullet points highlighting critical factors (e.g. overdue reminders, meeting signals) and next steps.
  5. *Personalized Follow-up Draft*: Ready-to-send email copy with 1-click clipboard copy.
- **Transparent Mode Labeling**: Displays whether analysis is produced by Google Gemini or the deterministic Mock AI engine.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query v5, React Router v6, React Hook Form, Zod, Recharts, @dnd-kit, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, Zod, Helmet, CORS, Morgan, Express Rate Limit |
| **Database** | PostgreSQL (local or Supabase-hosted) |
| **AI Provider** | Google Gemini API (`@google/generative-ai`) with deterministic mock fallback |
| **Testing** | Vitest, Supertest |

---

## Repository Structure

```
├── client/                     # Vite + React frontend application
│   ├── src/
│   │   ├── app/                # Router and React Query providers
│   │   ├── components/         # Layout (Sidebar, Header) and reusable UI
│   │   ├── features/           # Feature slices: dashboard, leads, pipeline, activities, follow-ups, ai-intelligence
│   │   ├── lib/                # Formatting utilities and cn helper
│   │   ├── services/           # Typed API client
│   │   └── types/              # Domain interfaces and enums
│   └── package.json
├── server/                     # Express + Prisma backend API
│   ├── prisma/
│   │   ├── schema.prisma       # Database models and relations
│   │   └── seed.ts             # Realistic fictional sample data seed
│   ├── src/
│   │   ├── config/             # Zod environment validation & Prisma client
│   │   ├── middleware/         # Centralized error handler & Zod validator
│   │   ├── modules/            # Domain modules (leads, pipeline, activities, follow-ups, dashboard, ai)
│   │   └── __tests__/          # Integration test suite (15 passing tests)
│   └── package.json
├── docs/                       # Project documentation
│   ├── AI_IMPLEMENTATION.md    # In-depth AI specification & prompt design
│   ├── API.md                  # Complete REST API reference
│   ├── DEMO_SCRIPT.md          # 2-3 minute presentation video script
│   └── IMPLEMENTATION_STATUS.md# Work checklist & test record
├── package.json                # Root workspace orchestration
└── README.md
```

---

## Local Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or later (v24+ verified)
- **npm**: v9.0.0 or later
- **PostgreSQL**: v14+ running locally (e.g. on port 5432) or a hosted instance (Supabase/Neon).

### 1. Clone & Configure Environment

```bash
git clone https://github.com/PARASMANI-KHUNTE/MaVionix_assignment.git
cd MaVionix_assignment
```

Configure backend environment variables in `server/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:root@localhost:5432/crm_db?schema=public"
CLIENT_URL="http://localhost:5173"
AI_PROVIDER="mock"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-1.5-flash"
```

Configure frontend environment variables in `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

Install root, backend, and frontend packages:
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install

# Return to root
cd ..
```

### 3. Database Migration & Realistic Seeding

Push the Prisma schema to PostgreSQL and populate realistic fictional sample records:
```bash
# Push schema to PostgreSQL
cd server
npx prisma db push

# Seed 8 realistic fictional leads, interactions, and follow-ups
npm run prisma:seed
cd ..
```

*Note: The seeded leads and activities are strictly fictional sample data created for demonstration purposes.*

### 4. Run Development Servers

Run both backend and frontend concurrently:
```bash
# Terminal 1: Backend API (port 5000)
npm run dev:server

# Terminal 2: Frontend Client (port 5173)
npm run dev:client
```
Visit `http://localhost:5173` to explore the CRM.

---

## Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP port for the Express backend API | `5000` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `CLIENT_URL` | Allowed CORS origin for the client | `http://localhost:5173` |
| `AI_PROVIDER` | AI backend engine (`gemini` or `mock`) | `mock` |
| `GEMINI_API_KEY` | Google Gemini API key from Google AI Studio | `""` |
| `GEMINI_MODEL` | Gemini model name | `gemini-1.5-flash` |
| `VITE_API_URL` | API base URL consumed by the Vite client | `http://localhost:5000/api` |

---

## Quality Gates & Verification Commands

All quality gates pass without warnings or regressions:

```bash
# 1. Typecheck both client and server TypeScript
npm run typecheck

# 2. Run backend integration test suite (15 automated tests)
npm run test

# 3. Compile production builds for both client and server
npm run build
```

---

## AI Provider Modes & Disclosure

NexusCRM supports two AI modes configured via `server/.env`:
1. **Google Gemini Mode** (`AI_PROVIDER=gemini`): Calls Gemini 1.5 Flash backend-only using structured JSON outputs validated against Zod.
2. **Deterministic Mock Mode** (`AI_PROVIDER=mock`): Uses an intelligent heuristic engine factoring in deal stages, priority weights, overdue penalties, and activity velocity.

**Explicit Disclosure**: When `AI_PROVIDER=mock` or if `GEMINI_API_KEY` is not set, all AI assessments are visibly badged in the UI as **Demo / Mock AI analysis**. The system never misrepresents mock calculations as real model output. Detailed documentation is provided in [`docs/AI_IMPLEMENTATION.md`](docs/AI_IMPLEMENTATION.md).

---

## Known Limitations
- Multi-user authentication/RBAC is omitted from the P0 submission scope to prioritize core CRM workflows and reliable AI intelligence.
- Live email transmission is mocked via the Activity Timeline (the application drafts personalized emails for 1-click clipboard copying rather than sending SMTP messages).

---

## License
MIT License. Developed for the MaVionix Technical Assignment.
