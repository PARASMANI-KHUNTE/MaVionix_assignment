# NexusCRM Demo Walkthrough Script (2–3 Minutes)

This script is structured for recording the demonstration video required by the technical assignment.

---

## Act 1: Introduction & Live Database Dashboard (0:00 – 0:35)
1. **Welcome & Context**:
   - *"Hello, this is a demonstration of NexusCRM, a full-stack AI-powered Customer Relationship Management web application built for sales teams."*
2. **Dashboard Highlights**:
   - Point to the **5 KPI cards** (Total Leads, New Leads, Converted Customers, Pending Follow-ups, and Conversion Rate).
   - Point out: *"Every single metric, percentage, and chart on this dashboard is computed live from our PostgreSQL database—no hardcoded demonstration numbers."*
   - Highlight the **Lead Distribution Bar Chart** across all 6 stages (`NEW`, `CONTACTED`, `INTERESTED`, `NEGOTIATION`, `CONVERTED`, `LOST`) and the **Sales Performance Area Chart**.
   - Note the **System Status indicator** at the bottom left confirming PostgreSQL connectivity and active AI mode.

---

## Act 2: Leads Directory, Filtering, & Creation (0:35 – 1:05)
1. **Navigation**:
   - Navigate to the **Leads Directory** (`/leads`).
2. **Search & Filters**:
   - Type `"Zenith"` or `"Logistics"` into the search box to demonstrate instant multi-field searching (matching names, emails, and company names).
   - Filter by stage (`INTERESTED`) and priority (`HIGH`).
3. **Lead Creation**:
   - Click **"+ Create Lead"** to open the modal.
   - Enter a new lead (e.g. *"Elena Rostova"*, *"elena@apex.example"*, company *"Apex Robotics"*, priority *"High"*).
   - Submit the form and point out the validation feedback and instant update in the data table.

---

## Act 3: 6-Stage Drag-and-Drop Pipeline (1:05 – 1:35)
1. **Pipeline Overview**:
   - Navigate to the **Pipeline** view (`/pipeline`).
   - Show the 6 columns in canonical order: *New, Contacted, Interested, Negotiation, Converted, Lost*.
2. **Interactive Drag-and-Drop**:
   - Drag Elena Rostova from *New* to *Contacted*.
   - Point out that column counts and pipeline totals instantly recalculate.
3. **Accessibility**:
   - Highlight the stage selector dropdown menu on the card:
   - *"For users preferring keyboard or screen-reader accessibility, every card also provides an inline stage selector that doesn't require dragging."*

---

## Act 4: Lead Profile, Activity Timeline & Overdue Reminders (1:35 – 2:05)
1. **Open Lead Profile**:
   - Click into a lead with rich data (e.g. *Vikram Malhotra*).
2. **Activity Timeline**:
   - Switch to the **Interaction History** tab.
   - Show the chronological audit trail with calls, emails, and notes.
   - Click **"+ Log Interaction"**, choose *"Phone Call"*, type a brief note, and save.
3. **Follow-up Tasks & Overdue Logic**:
   - Switch to the **Follow-up Tasks** tab.
   - Point out the red **Overdue** badge on past-due pending reminders.
   - Click the checkmark to mark an overdue task **Completed**.
   - Show that the task transitions to completed and is automatically cleared from the overdue status.

---

## Act 5: AI Lead Intelligence in Action (2:05 – 2:45)
1. **AI Panel Walkthrough**:
   - Switch to the **AI Lead Intelligence** tab.
   - Click **"Generate AI Assessment"** / **"Re-analyze Lead"**.
   - Show the loading spinner while the backend evaluates the lead record and interaction context.
2. **Review the 5 Output Deliverables**:
   - **Executive Summary**: Grounded purely in recorded notes and interactions.
   - **Lead Health Score (1–100)**: Visual gauge showing engagement health.
   - **Conversion Probability (0–100%)**: Highlight the explicit disclosure label: *"Statistical estimation based on available CRM data; not a guaranteed outcome."*
   - **Key Signals & Next Best Action**: Bullet points citing specific facts and recommended next steps.
   - **Personalized Follow-up Message**: Pre-drafted contextual email with 1-click **"Copy Email"** button.
   - Point out the transparency badge indicating whether Gemini 1.5 Flash or deterministic mock mode generated the output.

---

## Closing (2:45 – 3:00)
- *"NexusCRM delivers a responsive, end-to-end full-stack experience with clean TypeScript, PostgreSQL persistence, and practical AI assistance for modern sales teams. Thank you!"*
