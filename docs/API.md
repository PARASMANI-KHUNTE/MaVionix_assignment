# NexusCRM REST API Specification

Base URL: `http://localhost:5000/api` (Development)

All endpoints accept and return JSON format (`Content-Type: application/json`).

---

## 1. System Health

### `GET /api/health`
Returns the status of the server process, PostgreSQL connection, and active AI mode.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "timestamp": "2026-11-08T01:00:00.000Z",
  "service": "ai-crm-api",
  "environment": "development",
  "database": "connected",
  "aiProvider": "mock",
  "aiModel": "deterministic-mock-v1"
}
```

---

## 2. Dashboard Endpoints

### `GET /api/dashboard/summary`
Calculates real-time KPIs derived exclusively from database records.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "totalLeads": 8,
    "newLeads": 2,
    "convertedCustomers": 1,
    "pendingFollowUps": 5,
    "overdueFollowUps": 3,
    "conversionRate": 12.5,
    "totalPipelineValue": 420000
  }
}
```

### `GET /api/dashboard/lead-distribution`
Returns counts and total estimated value grouped across all 6 stages.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "status": "NEW", "count": 2, "value": 45000 },
    { "status": "CONTACTED", "count": 2, "value": 60000 },
    { "status": "INTERESTED", "count": 1, "value": 85000 },
    { "status": "NEGOTIATION", "count": 1, "value": 120000 },
    { "status": "CONVERTED", "count": 1, "value": 95000 },
    { "status": "LOST", "count": 1, "value": 15000 }
  ]
}
```

### `GET /api/dashboard/sales-performance`
Time-bucketed aggregation based on actual lead creation dates.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "month": "Oct 26", "leadsCount": 5, "convertedCount": 1, "pipelineValue": 315000 },
    { "month": "Nov 26", "leadsCount": 3, "convertedCount": 0, "pipelineValue": 105000 }
  ]
}
```

### `GET /api/dashboard/recent-activities?limit=8`
Returns latest logged activities across all leads.

---

## 3. Leads Management

### `GET /api/leads`
Lists leads with search, multi-field filtering, sorting, and pagination.

**Query Parameters:**
- `search` (string): Matches full name, email, or company name (case-insensitive).
- `status` (`NEW` | `CONTACTED` | `INTERESTED` | `NEGOTIATION` | `CONVERTED` | `LOST`).
- `priority` (`LOW` | `MEDIUM` | `HIGH`).
- `page` (number, default: 1).
- `limit` (number, default: 10, max: 100).
- `sortBy` (`createdAt` | `fullName` | `companyName` | `estimatedValue` | `priority`).
- `sortOrder` (`asc` | `desc`, default: `desc`).

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "e8a93a20-3df1-4f99-92b4-e2b5db0c6114",
      "fullName": "Vikram Malhotra",
      "email": "v.malhotra@zenithlogistics.example",
      "phone": "+91 97110 54321",
      "companyName": "Zenith Logistics Global",
      "jobTitle": "Chief Commercial Officer",
      "source": "Industry Conference",
      "status": "INTERESTED",
      "priority": "HIGH",
      "estimatedValue": 85000,
      "notes": "Met at Logistics Tech Summit 2026...",
      "createdAt": "2026-10-29T10:00:00.000Z",
      "_count": { "activities": 3, "followUps": 2 },
      "analyses": [{ "score": 88, "conversionProbability": 82 }]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1
  }
}
```

### `POST /api/leads`
Creates a new lead.

**Request Body:**
```json
{
  "fullName": "Maya Patel",
  "email": "maya.patel@horizon-media.example",
  "phone": "+91 98765 43210",
  "companyName": "Horizon Digital Media",
  "jobTitle": "VP Operations",
  "source": "Inbound Demo",
  "status": "NEW",
  "priority": "HIGH",
  "estimatedValue": 40000,
  "notes": "Requested product demo for sales reps."
}
```

**Response `201 Created`:** Returns created lead object.

### `GET /api/leads/:id`
Retrieves a lead profile including activities, follow-ups, and AI analyses.

### `PATCH /api/leads/:id`
Updates allowed lead fields.

### `DELETE /api/leads/:id`
Permanently deletes a lead and cascades related records.

---

## 4. Sales Pipeline & Kanban

### `GET /api/pipeline`
Returns all leads grouped by the 6 standard stages with stage counts and total deal values.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "stages": [
      { "stage": "NEW", "label": "New", "count": 2, "totalValue": 45000, "leads": [...] },
      { "stage": "CONTACTED", "label": "Contacted", "count": 2, "totalValue": 60000, "leads": [...] },
      { "stage": "INTERESTED", "label": "Interested", "count": 1, "totalValue": 85000, "leads": [...] },
      { "stage": "NEGOTIATION", "label": "Negotiation", "count": 1, "totalValue": 120000, "leads": [...] },
      { "stage": "CONVERTED", "label": "Converted", "count": 1, "totalValue": 95000, "leads": [...] },
      { "stage": "LOST", "label": "Lost", "count": 1, "totalValue": 15000, "leads": [...] }
    ],
    "summary": { "totalLeads": 8, "totalPipelineValue": 420000 }
  }
}
```

### `PATCH /api/leads/:id/status`
Updates a lead's stage and automatically logs a pipeline movement activity record.

**Request Body:**
```json
{
  "status": "NEGOTIATION"
}
```

---

## 5. Interactions & Activity Timeline

### `GET /api/leads/:id/activities`
Returns chronological list of activities for a lead (newest first).

### `POST /api/leads/:id/activities`
Logs an interaction for a lead.

**Request Body:**
```json
{
  "type": "CALL",
  "subject": "Discovery Call with Executive Team",
  "description": "Reviewed CRM requirements and timeline for rollout.",
  "occurredAt": "2026-11-08T01:00:00.000Z"
}
```

---

## 6. Follow-up Tasks

### `GET /api/follow-ups`
Lists follow-ups with filter and pagination.

**Query Parameters:**
- `filter`: `"all"` | `"upcoming"` | `"overdue"` | `"completed"`
- `leadId` (optional UUID)
- `page`, `limit`

### `POST /api/leads/:id/follow-ups`
Schedules a follow-up task.

**Request Body:**
```json
{
  "title": "Send updated contract redlines",
  "description": "Include requested payment flexibility clause.",
  "dueAt": "2026-11-10T10:00:00.000Z"
}
```

### `PATCH /api/follow-ups/:id`
Updates title, dueAt, or toggles status between `"PENDING"` and `"COMPLETED"`. Automatically assigns `completedAt` timestamp when completed.

### `DELETE /api/follow-ups/:id`
Deletes a follow-up task.

---

## 7. AI Lead Intelligence

### `POST /api/ai/leads/:id/analyze`
Generates a structured, grounded AI assessment for the specified lead.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lead analysis generated successfully",
  "data": {
    "id": "analysis-uuid",
    "summary": "Vikram Malhotra at Zenith Logistics Global is currently in the INTERESTED stage...",
    "score": 88,
    "conversionProbability": 82,
    "keySignals": [
      "Conducted 45-minute commercial demo with key decision makers",
      "Requested security compliance docs and pricing for 75 seats",
      "Attention needed: 1 pending follow-up reminder is currently overdue."
    ],
    "nextBestAction": "Check in with Vikram on security review status and offer a joint working session.",
    "followUpMessage": {
      "subject": "Zenith Logistics & AI CRM: Security review check-in",
      "body": "Hi Vikram,\n\nFollowing up on our earlier discussion..."
    },
    "limitations": [
      "Security team evaluation timeline not yet explicitly confirmed"
    ],
    "provider": "mock",
    "model": "deterministic-mock-v1",
    "createdAt": "2026-11-08T01:00:00.000Z"
  }
}
```

### `GET /api/ai/leads/:id/latest`
Retrieves the most recent saved AI analysis for a lead without re-triggering the provider.
