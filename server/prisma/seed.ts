import { PrismaClient, LeadStatus, LeadPriority, ActivityType, FollowUpStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CRM database seeding...');

  // Clean existing records in correct order
  await prisma.leadAnalysis.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.lead.deleteMany();

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);

  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 1. NEW Lead - Inbound website inquiry
  const lead1 = await prisma.lead.create({
    data: {
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@novatech-solutions.example',
      phone: '+91 98201 12345',
      companyName: 'NovaTech Solutions',
      jobTitle: 'VP of Technology',
      source: 'Website Contact Form',
      status: LeadStatus.NEW,
      priority: LeadPriority.HIGH,
      estimatedValue: 45000,
      notes: 'Submitted demo request form. Interested in CRM enterprise licensing for a 50-person sales team.',
      createdAt: twoDaysAgo,
      activities: {
        create: [
          {
            type: ActivityType.NOTE,
            subject: 'Inbound Demo Request',
            description: 'Prospect submitted enterprise contact form requesting custom demo and security compliance sheet.',
            occurredAt: twoDaysAgo,
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Initial Discovery Call',
            description: 'Schedule a 20-minute discovery call to qualify requirements and current tech stack.',
            dueAt: tomorrow,
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  // 2. CONTACTED Lead - Outbound with upcoming reminder
  const lead2 = await prisma.lead.create({
    data: {
      fullName: 'Priya Iyer',
      email: 'priya.iyer@cloudscale-analytics.example',
      phone: '+91 98450 67890',
      companyName: 'CloudScale Analytics',
      jobTitle: 'Director of Business Operations',
      source: 'LinkedIn Outreach',
      status: LeadStatus.CONTACTED,
      priority: LeadPriority.MEDIUM,
      estimatedValue: 28000,
      notes: 'Initial cold message on LinkedIn received positive reaction. Sent introduction email with company one-pager.',
      createdAt: fiveDaysAgo,
      activities: {
        create: [
          {
            type: ActivityType.EMAIL,
            subject: 'Introduction to AI CRM Platform',
            description: 'Sent overview deck and pricing tiers. Awaiting response regarding current vendor contract renewal date.',
            occurredAt: fourDaysAgo(),
          },
          {
            type: ActivityType.CALL,
            subject: 'Brief Gatekeeper Call',
            description: 'Called office line; assistant confirmed Priya is reviewing Q3 budget proposals this week.',
            occurredAt: twoDaysAgo,
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Send Case Study on Tech Migrations',
            description: 'Follow up with customer success study relevant to mid-market analytics firms.',
            dueAt: inThreeDays,
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  // 3. INTERESTED Lead - Active discussions with overdue follow-up & rich notes
  const lead3 = await prisma.lead.create({
    data: {
      fullName: 'Vikram Malhotra',
      email: 'v.malhotra@zenithlogistics.example',
      phone: '+91 97110 54321',
      companyName: 'Zenith Logistics Global',
      jobTitle: 'Chief Commercial Officer',
      source: 'Industry Conference',
      status: LeadStatus.INTERESTED,
      priority: LeadPriority.HIGH,
      estimatedValue: 85000,
      notes: 'Met at Logistics Tech Summit 2026. Highly interested in AI lead scoring to prioritize shipping inquiries. Budget allocated for Q3 rollout.',
      createdAt: tenDaysAgo,
      activities: {
        create: [
          {
            type: ActivityType.MEETING,
            subject: 'Summit In-Person Intro',
            description: 'Discussed challenges with manual lead triage in high-volume freight forwarding.',
            occurredAt: tenDaysAgo,
          },
          {
            type: ActivityType.CALL,
            subject: 'Detailed Demo with Commercial Team',
            description: 'Presented live product demo to Vikram and 3 regional sales directors. Strong engagement with the AI intelligence panel.',
            occurredAt: fiveDaysAgo,
          },
          {
            type: ActivityType.EMAIL,
            subject: 'Security & SLA Documentation Sent',
            description: 'Provided SOC2 Type II report and SLA terms requested by their IT compliance team.',
            occurredAt: threeDaysAgo(),
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Follow up on Security Review Sign-off',
            description: 'Confirm their InfoSec lead completed vendor risk assessment.',
            dueAt: yesterday, // OVERDUE!
            status: FollowUpStatus.PENDING,
          },
          {
            title: 'Send Proposal Draft',
            description: 'Prepare tailored commercial proposal based on 75 seat tier.',
            dueAt: inOneWeek,
            status: FollowUpStatus.PENDING,
          },
        ],
      },
      analyses: {
        create: [
          {
            summary: 'High-intent enterprise opportunity with active budget and strong executive engagement.',
            score: 88,
            conversionProbability: 82,
            keySignals: [
              'Conducted 45-minute commercial demo with key decision makers',
              'Requested security compliance docs and pricing for 75 seats',
              'Clear urgency linked to upcoming fiscal year budget allocation',
            ],
            nextBestAction: 'Check in with Vikram on security review status and offer a joint working session.',
            followUpSubject: 'Zenith Logistics & AI CRM: Security review check-in',
            followUpBody: 'Hi Vikram, following up on the SOC2 and SLA documentation sent last week. Happy to jump on a quick 15-minute call with your InfoSec lead if any questions arose.',
            limitations: [
              'Security team timeline not yet explicitly confirmed',
            ],
            provider: 'mock',
            model: 'deterministic-heuristic',
          },
        ],
      },
    },
  });

  // 4. NEGOTIATION Lead - Contract in review with completed follow-up
  const lead4 = await prisma.lead.create({
    data: {
      fullName: 'Ananya Deshmukh',
      email: 'ananya.d@apexfintech.example',
      phone: '+91 99887 76655',
      companyName: 'Apex FinTech Labs',
      jobTitle: 'Head of Growth',
      source: 'Referral',
      status: LeadStatus.NEGOTIATION,
      priority: LeadPriority.HIGH,
      estimatedValue: 120000,
      notes: 'Master Services Agreement (MSA) sent. Redlining indemnity clause and multi-year payment discount terms.',
      createdAt: twentyDaysAgo,
      activities: {
        create: [
          {
            type: ActivityType.MEETING,
            subject: 'Contract Terms Alignment',
            description: 'Discussed annual prepay discount (15%) and custom API rate limits.',
            occurredAt: fiveDaysAgo,
          },
          {
            type: ActivityType.CALL,
            subject: 'Legal counsel sync',
            description: 'Brief discussion between legal counsels to finalize liability caps.',
            occurredAt: twoDaysAgo,
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Deliver Revised MSA Contract',
            description: 'Incorporate agreed liability compromise into contract draft.',
            dueAt: twoDaysAgo,
            status: FollowUpStatus.COMPLETED,
            completedAt: yesterday,
          },
          {
            title: 'Receive Final Signature',
            description: 'Track DocuSign envelope completion from Ananya and CFO.',
            dueAt: inThreeDays,
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  // 5. CONVERTED Lead - Successfully won customer
  const lead5 = await prisma.lead.create({
    data: {
      fullName: 'Rohan Mehra',
      email: 'rohan.mehra@stellarretail.example',
      phone: '+91 98199 11223',
      companyName: 'Stellar Retail Chains',
      jobTitle: 'Chief Executive Officer',
      source: 'Partner Channel',
      status: LeadStatus.CONVERTED,
      priority: LeadPriority.HIGH,
      estimatedValue: 95000,
      notes: 'Customer converted! Contract executed for 2-year annual commitment. Onboarding kickoff scheduled with implementation team.',
      createdAt: twentyDaysAgo,
      activities: {
        create: [
          {
            type: ActivityType.CALL,
            subject: 'Final Verbal Agreement',
            description: 'Rohan confirmed CEO sign-off on 2-year plan.',
            occurredAt: tenDaysAgo,
          },
          {
            type: ActivityType.EMAIL,
            subject: 'Countersigned Agreement & Welcome Pack',
            description: 'Exchanged signed contracts and sent tenant provisioning credentials.',
            occurredAt: fiveDaysAgo,
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'Implementation Kickoff Handover',
            description: 'Introduce customer success manager and review data migration milestones.',
            dueAt: threeDaysAgo(),
            status: FollowUpStatus.COMPLETED,
            completedAt: twoDaysAgo,
          },
        ],
      },
    },
  });

  // 6. LOST Lead - Competitor selected with sparse notes
  const lead6 = await prisma.lead.create({
    data: {
      fullName: 'Karan Singhania',
      email: 'karan.s@vanguardmedia.example',
      phone: '+91 91234 56780',
      companyName: 'Vanguard Digital Media',
      jobTitle: 'Marketing Ops Lead',
      source: 'Google Ads',
      status: LeadStatus.LOST,
      priority: LeadPriority.LOW,
      estimatedValue: 15000,
      notes: 'Decided to renew with legacy vendor due to existing custom ERP integrations and unwilling to switch mid-year.',
      createdAt: fifteenDaysAgo(),
      activities: {
        create: [
          {
            type: ActivityType.CALL,
            subject: 'Loss Review Call',
            description: 'Karan explained that integration switching costs outweighed feature benefits at this time. Left door open for next annual review.',
            occurredAt: fourDaysAgo(),
          },
        ],
      },
    },
  });

  // 7. Sparse NEW Lead - minimal info to test AI and UI edge cases
  const lead7 = await prisma.lead.create({
    data: {
      fullName: 'Sneha Patel',
      email: 'sneha@quickmail.example',
      status: LeadStatus.NEW,
      priority: LeadPriority.LOW,
      source: 'Cold Inbound',
      notes: null,
      createdAt: yesterday,
    },
  });

  // 8. Lead with multiple overdue follow-ups to test overdue filtering
  const lead8 = await prisma.lead.create({
    data: {
      fullName: 'Devendra Joshi',
      email: 'd.joshi@heritagecrafts.example',
      phone: '+91 94432 10987',
      companyName: 'Heritage Crafts Co.',
      jobTitle: 'General Manager',
      source: 'Trade Show',
      status: LeadStatus.CONTACTED,
      priority: LeadPriority.MEDIUM,
      estimatedValue: 32000,
      notes: 'Initial contact made at artisan expo. Had indicated interest in inventory CRM integration but has missed subsequent communications.',
      createdAt: twentyDaysAgo,
      activities: {
        create: [
          {
            type: ActivityType.CALL,
            subject: 'Unanswered Phone Call',
            description: 'Left voicemail reminding about requested product catalog.',
            occurredAt: tenDaysAgo,
          },
        ],
      },
      followUps: {
        create: [
          {
            title: 'First Re-engagement Check-in',
            description: 'Check if summer season rush is over to resume conversations.',
            dueAt: fiveDaysAgo, // OVERDUE
            status: FollowUpStatus.PENDING,
          },
          {
            title: 'Second Re-engagement Email',
            description: 'Send revised pricing offer.',
            dueAt: twoDaysAgo, // OVERDUE
            status: FollowUpStatus.PENDING,
          },
        ],
      },
    },
  });

  console.log(`✅ CRM database seeded successfully!`);
  console.log(`   - 8 fictional sample leads created across all 6 statuses`);
  console.log(`   - Multiple activity types (Call, Email, Meeting, Note)`);
  console.log(`   - Follow-up states: Pending, Overdue, and Completed`);
  console.log(`   - Pre-computed sample AI intelligence analysis`);
}

function threeDaysAgo() {
  return new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
}
function fourDaysAgo() {
  return new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
}
function fifteenDaysAgo() {
  return new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
