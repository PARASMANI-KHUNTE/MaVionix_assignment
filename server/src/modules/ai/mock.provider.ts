import { AIProvider, LeadAnalysisOutput, LeadContextData } from './ai.interface.js';

export class MockAIProvider implements AIProvider {
  public readonly name = 'mock' as const;
  public readonly modelName = 'deterministic-mock-v1';

  async analyzeLead(context: LeadContextData): Promise<LeadAnalysisOutput> {
    const { lead, activities, followUps } = context;

    // Calculate baseline score & probability based on sales stage
    let score = 50;
    let prob = 40;

    switch (lead.status) {
      case 'NEW':
        score = 42;
        prob = 30;
        break;
      case 'CONTACTED':
        score = 56;
        prob = 48;
        break;
      case 'INTERESTED':
        score = 76;
        prob = 72;
        break;
      case 'NEGOTIATION':
        score = 89;
        prob = 84;
        break;
      case 'CONVERTED':
        score = 98;
        prob = 99;
        break;
      case 'LOST':
        score = 12;
        prob = 4;
        break;
    }

    // Priority adjustments
    if (lead.priority === 'HIGH') {
      score += 7;
      prob += 5;
    } else if (lead.priority === 'LOW') {
      score -= 8;
      prob -= 6;
    }

    // Engagement adjustments
    if (activities.length >= 3) {
      score += 6;
      prob += 5;
    } else if (activities.length === 0) {
      score -= 6;
      prob -= 5;
    }

    // Overdue penalty
    const overdueCount = followUps.filter((f) => f.isOverdue).length;
    if (overdueCount > 0) {
      score -= Math.min(15, overdueCount * 6);
      prob -= Math.min(15, overdueCount * 5);
    }

    // Clamp values
    score = Math.max(1, Math.min(100, Math.round(score)));
    prob = Math.max(0, Math.min(100, Math.round(prob)));

    // Synthesize signals
    const keySignals: string[] = [];
    const limitations: string[] = [];

    const companyStr = lead.companyName ? ` at ${lead.companyName}` : '';

    if (lead.status === 'CONVERTED') {
      keySignals.push(`Customer successfully converted. Account onboarding is in progress.`);
    } else if (lead.status === 'LOST') {
      keySignals.push(`Lead marked as lost. Prior engagement did not meet immediate technical or budget fit.`);
    } else {
      keySignals.push(`Currently in '${lead.status}' stage with ${lead.priority.toLowerCase()} deal priority.`);
    }

    if (activities.length > 0) {
      keySignals.push(
        `Recorded ${activities.length} customer interaction(s), latest was a ${activities[0].type.toLowerCase()} on ${new Date(activities[0].occurredAt).toLocaleDateString()}.`
      );
    } else {
      keySignals.push(`No prior activities or touchpoints recorded yet.`);
      limitations.push(`Lack of recorded activity logs limits confidence in lead velocity.`);
    }

    if (overdueCount > 0) {
      keySignals.push(`Attention needed: ${overdueCount} pending follow-up reminder(s) are currently overdue.`);
    }

    if (lead.estimatedValue && lead.estimatedValue > 0) {
      keySignals.push(`Estimated pipeline opportunity value is $${lead.estimatedValue.toLocaleString()}.`);
    } else {
      limitations.push(`Estimated deal size not specified in lead profile.`);
    }

    if (!lead.notes || lead.notes.trim() === '') {
      limitations.push(`Lead notes are sparse or empty; assessment is inferred from stage and touchpoints.`);
    }

    // Next best action
    let nextBestAction = `Schedule a discovery touchpoint to qualify ${lead.fullName}'s core business pain points.`;
    if (lead.status === 'NEW') {
      nextBestAction = `Initiate immediate outreach via phone or personalized email within 24 hours of inquiry.`;
    } else if (overdueCount > 0) {
      nextBestAction = `Address the overdue follow-up item immediately to prevent the deal from cooling off.`;
    } else if (lead.status === 'CONTACTED') {
      nextBestAction = `Follow up with targeted product collateral or a short video walkthrough relevant to their industry.`;
    } else if (lead.status === 'INTERESTED') {
      nextBestAction = `Coordinate a live product demonstration focusing on executive decision makers.`;
    } else if (lead.status === 'NEGOTIATION') {
      nextBestAction = `Align on remaining commercial or legal redlines and confirm decision timeline.`;
    } else if (lead.status === 'CONVERTED') {
      nextBestAction = `Ensure smooth onboarding kickoff and handoff to the customer success team.`;
    } else if (lead.status === 'LOST') {
      nextBestAction = `Set a calendar reminder for 6 months out to check for organizational or leadership changes.`;
    }

    // Follow-up message
    const firstName = lead.fullName.split(' ')[0] || lead.fullName;
    let subject = `Connecting regarding your CRM initiatives`;
    let body = `Hi ${firstName},\n\nI hope you're having a productive week. I'm reaching out to see if you have 10-15 minutes this week to discuss how we can help streamline your sales workflow${companyStr}.\n\nBest regards,\nSales Team`;

    if (lead.status === 'INTERESTED' || lead.status === 'NEGOTIATION') {
      subject = `Next steps for ${lead.companyName || 'your team'}`;
      body = `Hi ${firstName},\n\nThank you for taking the time to speak with us recently. Following up on our last conversation regarding your requirements, I wanted to confirm if there are any specific questions your team has regarding our proposal.\n\nLooking forward to speaking soon.\n\nBest regards,\nSales Team`;
    } else if (overdueCount > 0) {
      subject = `Quick check-in with ${lead.fullName}`;
      body = `Hi ${firstName},\n\nI wanted to gently bump our earlier discussion. Please let me know if your schedule has opened up for a brief sync, or if there's any additional information I can provide in the meantime.\n\nWarm regards,\nSales Team`;
    }

    // Summary
    const summary = `${lead.fullName}${companyStr} is currently in the ${lead.status} stage with ${lead.priority.toLowerCase()} priority. ${
      lead.notes ? `Key notes: "${lead.notes.slice(0, 150)}..."` : 'No detailed background notes currently logged.'
    }`;

    return {
      summary,
      score,
      conversionProbability: prob,
      keySignals,
      nextBestAction,
      followUpMessage: {
        subject,
        body,
      },
      limitations,
      provider: 'mock',
      model: this.modelName,
    };
  }
}
