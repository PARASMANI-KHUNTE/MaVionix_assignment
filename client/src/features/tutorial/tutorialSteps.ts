export interface TutorialStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  tip: string;
  route: string;
  targetSelector?: string;
  badge: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'dashboard',
    stepNumber: 1,
    title: 'Executive Dashboard & Live Metrics',
    description:
      'Welcome to NexusCRM! The dashboard provides real-time visibility into sales pipeline velocity, live database-backed KPI cards (Total Leads, New Inbound, Converted Customers, Pending Tasks, and Conversion Rate), plus Recharts visual distributions.',
    tip: 'Notice the live database connection and AI model status pills in the left sidebar.',
    route: '/',
    badge: 'Overview',
  },
  {
    id: 'leads',
    stepNumber: 2,
    title: 'Leads Directory & Multi-Field Search',
    description:
      'Manage prospective accounts with instant search matching names, emails, and companies. Filter by sales stages or priority tiers (High, Medium, Low), and launch the validated lead creation modal.',
    tip: 'Click on any lead row to navigate directly into their comprehensive profile.',
    route: '/leads',
    badge: 'Directory',
  },
  {
    id: 'pipeline',
    stepNumber: 3,
    title: '6-Stage Kanban Pipeline with Drag & Drop',
    description:
      'Track deal progress across 6 canonical stages (New, Contacted, Interested, Negotiation, Converted, Lost). Drag cards between columns using @dnd-kit, or use the accessible stage dropdown menu on each card.',
    tip: 'Stage transitions trigger automated audit trail activity logs and recalculate column values.',
    route: '/pipeline',
    badge: 'Kanban',
  },
  {
    id: 'profile-timeline',
    stepNumber: 4,
    title: 'Customer Profile & Interaction Timeline',
    description:
      'Review complete customer intelligence: direct contact links, deal financials, discovery notes, and the chronological interaction history logging calls, emails, demos, and internal notes.',
    tip: 'Click "+ Log Interaction" to append calls or meetings to the customer audit trail.',
    route: '/leads',
    badge: 'Profile',
  },
  {
    id: 'follow-ups',
    stepNumber: 5,
    title: 'Follow-up Reminders & Overdue Tracking',
    description:
      'Never let deals cool off. Schedule time-bound follow-up tasks with derived overdue logic (tasks are overdue only when pending and due date has elapsed). Filter by Upcoming, Overdue, or Completed.',
    tip: 'Click the circle checkbox next to any reminder to mark it completed instantly.',
    route: '/follow-ups',
    badge: 'Tasks',
  },
  {
    id: 'ai-intelligence',
    stepNumber: 6,
    title: 'AI Lead Intelligence (Gemini & Heuristic Engine)',
    description:
      'Click "Generate AI Assessment" or "Re-analyze Lead" to produce 5 grounded outputs: an Executive Summary, a 1–100 Health Score, an Estimated Conversion Probability, Key Signals & Next Best Action, and a ready-to-send personalized email draft.',
    tip: 'The model cites data gaps and uncertainties rather than inventing unverified facts.',
    route: '/leads',
    badge: 'AI Feature',
  },
];
