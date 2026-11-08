import { PrismaClient, LeadStatus, LeadPriority, ActivityType, FollowUpStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CRM Production Database Seeding...');

  // Clean existing test and demo records
  await prisma.leadAnalysis.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.lead.deleteMany();

  const now = new Date();
  const d = (daysAgo: number) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const futureD = (daysAhead: number) => new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  // ---------------------------------------------------------------------------
  // 1. NEW LEADS (Inbound inquiries, fresh signups, conference leads)
  // ---------------------------------------------------------------------------
  await prisma.lead.create({
    data: {
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@novatech-solutions.com',
      phone: '+91 98201 12345',
      companyName: 'NovaTech Solutions',
      jobTitle: 'VP of Technology',
      source: 'Website Contact Form',
      status: LeadStatus.NEW,
      priority: LeadPriority.HIGH,
      estimatedValue: 65000,
      notes: 'Submitted demo request form. Evaluating CRM replacement for their 45-person sales and solution engineering team.',
      createdAt: d(2),
      activities: {
        create: [
          {
            type: ActivityType.NOTE,
            subject: 'Inbound Enterprise Form Submission',
            description: 'Prospect requested pricing sheet, SOC2 compliance overview, and migration timeline from legacy Salesforce instance.',
            occurredAt: d(2),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Schedule Discovery Call',
            description: 'Conduct initial 20-minute qualification call with Aarav and lead solution architect.',
            dueAt: futureD(1),
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  await prisma.lead.create({
    data: {
      fullName: 'Elena Rostova',
      email: 'elena.r@neuralmatrix.ai',
      phone: '+1 415 555 0192',
      companyName: 'NeuralMatrix AI',
      jobTitle: 'Head of Growth',
      source: 'Product Hunt Launch',
      status: LeadStatus.NEW,
      priority: LeadPriority.HIGH,
      estimatedValue: 80000,
      notes: 'Discovered product via product launch. Wants native AI capabilities to score high-velocity enterprise pipeline.',
      createdAt: d(1),
      activities: {
        create: [
          {
            type: ActivityType.EMAIL,
            subject: 'Inbound Evaluation Welcome',
            description: 'Sent automated onboarding sequence and invite link to sandbox environment.',
            occurredAt: d(1),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Product Walkthrough Setup',
            description: 'Coordinate customized executive demonstration focusing on AI conversion predictions.',
            dueAt: futureD(2),
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  await prisma.lead.create({
    data: {
      fullName: 'Marcus Vance',
      email: 'marcus@biovance-rx.com',
      phone: '+1 617 555 0834',
      companyName: 'BioVance Therapeutics',
      jobTitle: 'Chief Operating Officer',
      source: 'Healthcare BioTech Expo',
      status: LeadStatus.NEW,
      priority: LeadPriority.MEDIUM,
      estimatedValue: 48000,
      notes: 'Met at industry symposium. Looking for HIPAA compliant CRM workflows for clinical research partnerships.',
      createdAt: d(3),
      activities: {
        create: [
          {
            type: ActivityType.NOTE,
            subject: 'Conference Badge Scan',
            description: 'Interested in pipeline tracking for multi-year university research agreements.',
            occurredAt: d(3),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Send Healthcare Compliance Whitepaper',
            description: 'Share security architecture document with InfoSec compliance committee.',
            dueAt: futureD(3),
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  await prisma.lead.create({
    data: {
      fullName: 'Sneha Patel',
      email: 'sneha.patel@quickmail.io',
      phone: '+91 99102 33445',
      companyName: 'QuickKart Express',
      jobTitle: 'E-commerce Operations Manager',
      source: 'Organic Search',
      status: LeadStatus.NEW,
      priority: LeadPriority.LOW,
      estimatedValue: 18000,
      notes: 'Direct web registration. Evaluating tier options for basic pipeline tracking.',
      createdAt: d(4),
      activities: {
        create: [
          {
            type: ActivityType.NOTE,
            subject: 'Account Created',
            description: 'User initiated basic tier trial without sales rep assistance.',
            occurredAt: d(4),
          },
        ],
      },
    },
  });

  // ---------------------------------------------------------------------------
  // 2. CONTACTED LEADS (First outreach made, awaiting feedback or demo scheduling)
  // ---------------------------------------------------------------------------
  await prisma.lead.create({
    data: {
      fullName: 'Priya Iyer',
      email: 'priya.iyer@cloudscale-analytics.com',
      phone: '+91 98450 67890',
      companyName: 'CloudScale Analytics',
      jobTitle: 'Director of Business Operations',
      source: 'LinkedIn Outreach',
      status: LeadStatus.CONTACTED,
      priority: LeadPriority.MEDIUM,
      estimatedValue: 35000,
      notes: 'Initial cold message on LinkedIn received positive reaction. Sent introduction email with company one-pager.',
      createdAt: d(7),
      activities: {
        create: [
          {
            type: ActivityType.EMAIL,
            subject: 'Introduction to AI CRM Platform',
            description: 'Sent overview deck and pricing tiers. Awaiting response regarding current vendor contract renewal date.',
            occurredAt: d(6),
          },
          {
            type: ActivityType.CALL,
            subject: 'Gatekeeper Verification Call',
            description: 'Spoke with executive assistant; Priya requested follow-up during Q3 planning window.',
            occurredAt: d(2),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Send Enterprise Case Study',
            description: 'Forward case study on mid-market SaaS pipeline acceleration.',
            dueAt: futureD(2),
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  await prisma.lead.create({
    data: {
      fullName: 'David K. Reynolds',
      email: 'dreynolds@quantedge-capital.com',
      phone: '+44 20 7946 0912',
      companyName: 'QuantEdge Capital',
      jobTitle: 'Managing Director, Client Relations',
      source: 'Executive Referral',
      status: LeadStatus.CONTACTED,
      priority: LeadPriority.HIGH,
      estimatedValue: 110000,
      notes: 'Referral from board advisor. Managing institutional LP client interactions across London and Singapore desks.',
      createdAt: d(12),
      activities: {
        create: [
          {
            type: ActivityType.CALL,
            subject: 'Initial 15-Minute Alignment',
            description: 'David highlighted the need for customized role-based access control and strict audit logs.',
            occurredAt: d(8),
          },
          {
            type: ActivityType.EMAIL,
            subject: 'Sent NDA & Architecture Deck',
            description: 'Mutual NDA sent to their legal ops desk for review before deeper architectural exchange.',
            occurredAt: d(4),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Verify NDA Execution',
            description: 'Check in with legal counsel to confirm countersignature on mutual NDA.',
            dueAt: d(1), // OVERDUE!
            status: FollowUpStatus.PENDING,
          },
          {
            title: 'Schedule In-Depth Tech Review',
            description: 'Book technical architecture session with QuantEdge VP of Infrastructure.',
            dueAt: futureD(4),
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  await prisma.lead.create({
    data: {
      fullName: 'Devendra Joshi',
      email: 'd.joshi@heritagecrafts.in',
      phone: '+91 94432 10987',
      companyName: 'Heritage Crafts Co.',
      jobTitle: 'General Manager',
      source: 'Trade Show',
      status: LeadStatus.CONTACTED,
      priority: LeadPriority.MEDIUM,
      estimatedValue: 28000,
      notes: 'Contacted following regional handicrafts trade expo. Expressed interest in vendor management module.',
      createdAt: d(18),
      activities: {
        create: [
          {
            type: ActivityType.CALL,
            subject: 'Check-in Phone Call',
            description: 'Discussed high volume of wholesale export inquiries during festive season.',
            occurredAt: d(14),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Follow-up on Proposal Review',
            description: 'Re-engage following their quarterly board review meeting.',
            dueAt: d(3), // OVERDUE!
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  // ---------------------------------------------------------------------------
  // 3. INTERESTED LEADS (Active demos, deep qualification, evaluation teams)
  // ---------------------------------------------------------------------------
  const leadVikram = await prisma.lead.create({
    data: {
      fullName: 'Vikram Malhotra',
      email: 'v.malhotra@zenithlogistics.com',
      phone: '+91 97110 54321',
      companyName: 'Zenith Logistics Global',
      jobTitle: 'Chief Commercial Officer',
      source: 'Industry Conference',
      status: LeadStatus.INTERESTED,
      priority: LeadPriority.HIGH,
      estimatedValue: 95000,
      notes: 'Met at Logistics Tech Summit 2026. Highly interested in AI lead scoring to triage 5,000+ monthly maritime freight inquiries.',
      createdAt: d(14),
      activities: {
        create: [
          {
            type: ActivityType.MEETING,
            subject: 'Summit In-Person Intro',
            description: 'Discussed bottlenecks in manual inquiry assignment across regional port hubs.',
            occurredAt: d(14),
          },
          {
            type: ActivityType.CALL,
            subject: 'Commercial Executive Demo',
            description: 'Presented live product demonstration to Vikram and regional sales directors. Strong engagement with conversion scoring.',
            occurredAt: d(8),
          },
          {
            type: ActivityType.EMAIL,
            subject: 'Security & SLA Documentation Sent',
            description: 'Provided SOC2 Type II report and cloud SLA specifications requested by IT compliance.',
            occurredAt: d(3),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Security Review Sign-off Sync',
            description: 'Confirm InfoSec lead completed vendor risk assessment questionnaire.',
            dueAt: d(1), // OVERDUE
            status: FollowUpStatus.PENDING,
          },
          {
            title: 'Deliver Tailored Commercial Proposal',
            description: 'Prepare custom quote for 85 enterprise user seats with premium AI credits.',
            dueAt: futureD(5),
            status: FollowUpStatus.PENDING,
          },
        ],
      },
      analyses: {
        create: [
          {
            summary: 'High-intent enterprise logistics opportunity with active budget and strong executive sponsorship from CCO.',
            score: 88,
            conversionProbability: 84,
            keySignals: [
              'Conducted 45-minute commercial demo with all 3 regional sales directors',
              'Requested security compliance docs and formal SLA for 85 seats',
              'Explicit Q3 rollout timeline to support peak shipping quarter',
            ],
            nextBestAction: 'Check in with Vikram on InfoSec review progress and propose a joint 15-minute technical clarification session.',
            followUpSubject: 'Zenith Logistics & AI CRM: Security review check-in',
            followUpBody: 'Hi Vikram, following up on the SOC2 Type II report and SLA documentation sent last week. Happy to jump on a quick 15-minute sync with your IT compliance team if any specific questions arose.',
            limitations: [
              'InfoSec sign-off timeline pending formal verification',
              'Final decision relies on regional port director buy-in',
            ],
            provider: 'neon-ai-gateway',
            model: 'gemini-3-flash',
          },
        ],
      },
    },
  });

  await prisma.lead.create({
    data: {
      fullName: 'Sarah Jenkins',
      email: 'sjenkins@voltelectric.com',
      phone: '+1 312 555 7821',
      companyName: 'VoltCharge Mobility',
      jobTitle: 'VP of Commercial Fleet Partnerships',
      source: 'Webinar Inbound',
      status: LeadStatus.INTERESTED,
      priority: LeadPriority.HIGH,
      estimatedValue: 72000,
      notes: 'Attended webinar on Automated Sales Pipeline Workflows. Expanding EV fleet charging network across Midwest corridor.',
      createdAt: d(10),
      activities: {
        create: [
          {
            type: ActivityType.MEETING,
            subject: 'Discovery & Needs Analysis',
            description: 'Walked through charging station pipeline stages and municipal permit tracking requirements.',
            occurredAt: d(6),
          },
          {
            type: ActivityType.EMAIL,
            subject: 'Custom Workflow Template Shared',
            description: 'Sent custom pipeline layout configured specifically for municipal utility partnerships.',
            occurredAt: d(2),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Technical Demo with Ops Team',
            description: 'Demonstrate drag-and-drop kanban board and automated follow-up triggers to operational leads.',
            dueAt: futureD(3),
            status: FollowUpStatus.PENDING,
          },
        ],
      },
      analyses: {
        create: [
          {
            summary: 'Fast-moving EV infrastructure deal with clear workflow pains and high team readiness for modern CRM.',
            score: 82,
            conversionProbability: 78,
            keySignals: [
              'Clear operational bottleneck with municipal utility permit tracking',
              'VP actively shared workflow specs and invited operational stakeholders',
              'Budget approved under quarterly clean tech infrastructure allocation',
            ],
            nextBestAction: 'Finalize custom pipeline staging for the upcoming ops team demo.',
            followUpSubject: 'VoltCharge & AI CRM: Ops demo preview & agenda',
            followUpBody: 'Hi Sarah, excited for our team session this Thursday. I have prepared the municipal utility workflow template we discussed so your operational managers can test it hands-on.',
            limitations: [
              'Municipal regulatory approval cycles may affect rollout pace',
            ],
            provider: 'gemini',
            model: 'gemini-3.5-flash',
          },
        ],
      },
    },
  });

  await prisma.lead.create({
    data: {
      fullName: 'Takashi Yamamoto',
      email: 'yamamoto.t@precisionrobotics.jp',
      phone: '+81 3 5555 0147',
      companyName: 'Precision Robotics Corp',
      jobTitle: 'Director of Global Sales Ops',
      source: 'Global Partner Network',
      status: LeadStatus.INTERESTED,
      priority: LeadPriority.MEDIUM,
      estimatedValue: 64000,
      notes: 'Evaluating cloud CRM for industrial automation robotics distribution network across APAC and EU.',
      createdAt: d(16),
      activities: {
        create: [
          {
            type: ActivityType.CALL,
            subject: 'Tokyo Timezone Qualification Call',
            description: 'Discussed localization requirements and data residency guarantees on AWS Tokyo region.',
            occurredAt: d(9),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Send Multi-Currency Billing Specs',
            description: 'Confirm JPY and USD consolidated invoice support.',
            dueAt: futureD(2),
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  // ---------------------------------------------------------------------------
  // 4. NEGOTIATION LEADS (Contracts in legal review, pricing proposals, redlines)
  // ---------------------------------------------------------------------------
  const leadAnanya = await prisma.lead.create({
    data: {
      fullName: 'Ananya Deshmukh',
      email: 'ananya.d@apexfintech.com',
      phone: '+91 99887 76655',
      companyName: 'Apex FinTech Labs',
      jobTitle: 'Head of Growth & Partnerships',
      source: 'Direct Executive Referral',
      status: LeadStatus.NEGOTIATION,
      priority: LeadPriority.HIGH,
      estimatedValue: 140000,
      notes: 'Master Services Agreement (MSA) in redlining stage. Finalizing custom indemnity limits and 2-year payment discount.',
      createdAt: d(24),
      activities: {
        create: [
          {
            type: ActivityType.MEETING,
            subject: 'Commercial Terms Alignment',
            description: 'Discussed annual prepay discount (15%) and enterprise dedicated support SLA.',
            occurredAt: d(7),
          },
          {
            type: ActivityType.CALL,
            subject: 'Legal Counsel Working Session',
            description: 'Brief discussion between legal counsels to finalize liability caps and standard data protection addendum.',
            occurredAt: d(3),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Deliver Revised MSA Contract Draft',
            description: 'Incorporate agreed liability compromise into contract envelope.',
            dueAt: d(2),
            status: FollowUpStatus.COMPLETED,
            completedAt: d(1),
          },
          {
            title: 'Receive Final DocuSign Signature',
            description: 'Track DocuSign execution from Ananya and CFO for Q3 onboarding kickoff.',
            dueAt: futureD(2),
            status: FollowUpStatus.PENDING,
          },
        ],
      },
      analyses: {
        create: [
          {
            summary: 'Late-stage enterprise FinTech contract with agreed commercial terms and active legal review.',
            score: 94,
            conversionProbability: 92,
            keySignals: [
              'Commercial terms and 15% 2-year discount approved by CFO',
              'Legal compromise on liability caps reached during sync call',
              'C-level commitment to complete rollout before end of month',
            ],
            nextBestAction: 'Send polite check-in on DocuSign envelope status to facilitate immediate tenant provisioning.',
            followUpSubject: 'Apex FinTech & AI CRM: MSA signature check-in',
            followUpBody: 'Hi Ananya, following up on the finalized MSA sent yesterday. Everything is ready on our end to spin up your dedicated tenant as soon as the envelope is completed.',
            limitations: [
              'CFO final countersignature dependent on internal board approval schedule',
            ],
            provider: 'neon-ai-gateway',
            model: 'claude-sonnet-4-6',
          },
        ],
      },
    },
  });

  await prisma.lead.create({
    data: {
      fullName: 'Carlos Morales',
      email: 'c.morales@urbankite.com',
      phone: '+34 91 123 4567',
      companyName: 'UrbanKite Apparel Global',
      jobTitle: 'VP of Global Retail Operations',
      source: 'Inbound Inbound RFP',
      status: LeadStatus.NEGOTIATION,
      priority: LeadPriority.HIGH,
      estimatedValue: 88000,
      notes: 'Final RFP selection won against incumbent vendor. Reviewing order management integration specs before contract signing.',
      createdAt: d(30),
      activities: {
        create: [
          {
            type: ActivityType.MEETING,
            subject: 'Executive Board RFP Presentation',
            description: 'Presented final architecture comparison to board of directors in Madrid. Scored highest on usability and AI insights.',
            occurredAt: d(12),
          },
          {
            type: ActivityType.EMAIL,
            subject: 'Order Form & Tier Agreement',
            description: 'Dispatched custom order form for 120 retail store manager seats.',
            occurredAt: d(4),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Finalize Billing Currency & Tax Details',
            description: 'Obtain EU VAT identification number and European banking transfer details.',
            dueAt: futureD(1),
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  // ---------------------------------------------------------------------------
  // 5. CONVERTED LEADS (Won enterprise accounts, active paying customers)
  // ---------------------------------------------------------------------------
  await prisma.lead.create({
    data: {
      fullName: 'Rohan Mehra',
      email: 'rohan.mehra@stellarretail.com',
      phone: '+91 98199 11223',
      companyName: 'Stellar Retail Chains',
      jobTitle: 'Chief Executive Officer',
      source: 'Strategic Partner Channel',
      status: LeadStatus.CONVERTED,
      priority: LeadPriority.HIGH,
      estimatedValue: 125000,
      notes: 'Contract executed for 2-year annual commitment ($250,000 Total Contract Value). Onboarding kickoff completed with implementation team.',
      createdAt: d(35),
      activities: {
        create: [
          {
            type: ActivityType.CALL,
            subject: 'Final Commercial Verbal Approval',
            description: 'Rohan confirmed unanimous board sign-off on 2-year enterprise agreement.',
            occurredAt: d(15),
          },
          {
            type: ActivityType.EMAIL,
            subject: 'Signed Agreement & Welcome Pack',
            description: 'Received countersigned DocuSign envelope and issued production workspace credentials.',
            occurredAt: d(10),
          },
          {
            type: ActivityType.MEETING,
            subject: 'Implementation Kickoff & Handover',
            description: 'Held 60-minute technical onboarding with customer success manager and enterprise architects.',
            occurredAt: d(3),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: '30-Day Executive Business Review',
            description: 'Schedule first monthly cadence to review team adoption KPIs and pipeline health.',
            dueAt: futureD(25),
            status: FollowUpStatus.PENDING,
          },
          {
            title: 'Kickoff Handover Complete',
            description: 'Verify all 50 retail store managers logged into CRM system.',
            dueAt: d(5),
            status: FollowUpStatus.COMPLETED,
            completedAt: d(4),
          },
        ],
      },
      analyses: {
        create: [
          {
            summary: 'Successfully converted enterprise customer with multi-year contract and high executive satisfaction.',
            score: 98,
            conversionProbability: 100,
            keySignals: [
              'Executed 2-year commitment with annual prepayment',
              'Onboarding kickoff finished with 95% initial user activation',
              'CEO interested in expanding to international subsidiary in Q4',
            ],
            nextBestAction: 'Monitor first month daily active usage and prepare Q4 expansion presentation.',
            followUpSubject: 'Stellar Retail: First week check-in & onboarding milestones',
            followUpBody: 'Hi Rohan, delighted to see your team actively logging customer interactions this week. Our customer success team is tracking your team adoption metrics closely.',
            limitations: [],
            provider: 'neon-ai-gateway',
            model: 'gemini-3-flash',
          },
        ],
      },
    },
  });

  await prisma.lead.create({
    data: {
      fullName: 'Hannah Schmidt',
      email: 'h.schmidt@solariagrid.de',
      phone: '+49 89 2444 8800',
      companyName: 'Solaria Energy Grid',
      jobTitle: 'VP of Commercial Strategy',
      source: 'Clean Energy Summit',
      status: LeadStatus.CONVERTED,
      priority: LeadPriority.HIGH,
      estimatedValue: 92000,
      notes: 'Customer won! Commercial solar farm partnership pipeline successfully migrated from legacy spreadsheets.',
      createdAt: d(40),
      activities: {
        create: [
          {
            type: ActivityType.EMAIL,
            subject: 'Production Tenant Handoff',
            description: 'Provided API credentials and completed initial CSV data import of 3,500 historical projects.',
            occurredAt: d(14),
          },
          {
            type: ActivityType.CALL,
            subject: 'First Sprint Feedback Sync',
            description: 'Hannah confirmed the sales team saved 8 hours per week with automated follow-up reminders.',
            occurredAt: d(5),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Quarterly Value Realization Review',
            description: 'Prepare report comparing pre-migration vs post-migration conversion rates.',
            dueAt: futureD(45),
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  // ---------------------------------------------------------------------------
  // 6. LOST LEADS (Closed lost with documented root cause and win-back timelines)
  // ---------------------------------------------------------------------------
  await prisma.lead.create({
    data: {
      fullName: 'Karan Singhania',
      email: 'karan.s@vanguardmedia.com',
      phone: '+91 91234 56780',
      companyName: 'Vanguard Digital Media',
      jobTitle: 'Marketing Ops Lead',
      source: 'Google Ads',
      status: LeadStatus.LOST,
      priority: LeadPriority.LOW,
      estimatedValue: 22000,
      notes: 'Decided to renew with legacy ERP vendor due to existing custom on-premise accounting hooks. Revisit next year.',
      createdAt: d(28),
      activities: {
        create: [
          {
            type: ActivityType.CALL,
            subject: 'Loss Review & Retrospective',
            description: 'Karan explained that integration switching costs outweighed benefits this fiscal year. Left door open for Q2 2027.',
            occurredAt: d(10),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Annual Contract Expiry Win-Back',
            description: 'Reach back out 60 days before their legacy software renewal window.',
            dueAt: futureD(180),
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  await prisma.lead.create({
    data: {
      fullName: 'Arthur Pendelton',
      email: 'arthur.p@cargoway.co.uk',
      phone: '+44 161 496 0233',
      companyName: 'PortWay Cargo Ltd',
      jobTitle: 'Managing Director',
      source: 'Cold Inbound',
      status: LeadStatus.LOST,
      priority: LeadPriority.LOW,
      estimatedValue: 16000,
      notes: 'Project deferred due to company restructuring and temporary hiring freeze.',
      createdAt: d(35),
      activities: {
        create: [
          {
            type: ActivityType.EMAIL,
            subject: 'Project Postponement Notice',
            description: 'Arthur notified that all non-essential IT software procurement is paused until next budget year.',
            occurredAt: d(15),
          },
        ],
      },
    },
  });

  // Summary counts
  const [totalLeads, totalActivities, totalFollowUps, totalAnalyses] = await Promise.all([
    prisma.lead.count(),
    prisma.activity.count(),
    prisma.followUp.count(),
    prisma.leadAnalysis.count(),
  ]);

  console.log(`✅ CRM Production Database Seeded Successfully!`);
  console.log(`   - Total Leads: ${totalLeads} (Across all 6 statuses: NEW, CONTACTED, INTERESTED, NEGOTIATION, CONVERTED, LOST)`);
  console.log(`   - Total Activities: ${totalActivities} (Calls, Emails, Meetings, Notes)`);
  console.log(`   - Total Follow-Ups: ${totalFollowUps} (Upcoming, Overdue, and Completed)`);
  console.log(`   - AI Intelligence Records: ${totalAnalyses}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
