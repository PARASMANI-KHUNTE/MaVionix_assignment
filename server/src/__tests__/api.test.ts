import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';

describe('AI CRM Backend API Test Suite', () => {
  beforeAll(async () => {
    // Ensure DB connection is active
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Health Check', () => {
    it('GET /api/health should return status healthy and DB connected', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database).toBe('connected');
    });
  });

  describe('2. Leads API', () => {
    let createdLeadId: string;

    it('POST /api/leads should fail validation when required fields are missing', async () => {
      const res = await request(app).post('/api/leads').send({
        // missing fullName & email
        companyName: 'Incomplete Inc.',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('POST /api/leads should create a valid lead with default NEW status', async () => {
      const res = await request(app).post('/api/leads').send({
        fullName: 'Test Automation Lead',
        email: 'test.lead@crmautomation.example',
        companyName: 'Automation Co.',
        priority: 'HIGH',
        estimatedValue: 50000,
        notes: 'Created via automated integration test.',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.fullName).toBe('Test Automation Lead');
      expect(res.body.data.status).toBe('NEW');
      expect(res.body.data.priority).toBe('HIGH');
      expect(res.body.data.estimatedValue).toBe(50000);

      createdLeadId = res.body.data.id;
    });

    it('GET /api/leads should search by company or name', async () => {
      const res = await request(app).get('/api/leads?search=Automation');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.some((l: any) => l.fullName === 'Test Automation Lead')).toBe(true);
    });

    it('GET /api/leads should filter by status and priority', async () => {
      const res = await request(app).get('/api/leads?status=NEW&priority=HIGH');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const lead of res.body.data) {
        expect(lead.status).toBe('NEW');
        expect(lead.priority).toBe('HIGH');
      }
    });

    it('GET /api/leads/:id should return lead profile and 404 for unknown id', async () => {
      const res = await request(app).get(`/api/leads/${createdLeadId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdLeadId);

      const notFoundRes = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000000');
      expect(notFoundRes.status).toBe(404);
    });

    it('PATCH /api/leads/:id should update allowed lead fields', async () => {
      const res = await request(app).patch(`/api/leads/${createdLeadId}`).send({
        companyName: 'Automation Co. Updated',
        estimatedValue: 65000,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.companyName).toBe('Automation Co. Updated');
      expect(res.body.data.estimatedValue).toBe(65000);
    });

    it('PATCH /api/leads/:id/status should update stage to INTERESTED and record activity', async () => {
      const res = await request(app)
        .patch(`/api/leads/${createdLeadId}/status`)
        .send({ status: 'INTERESTED' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('INTERESTED');

      // Check that activity was automatically logged
      const actRes = await request(app).get(`/api/leads/${createdLeadId}/activities`);
      expect(actRes.status).toBe(200);
      expect(actRes.body.data.some((a: any) => a.subject.includes('to INTERESTED'))).toBe(true);
    });
  });

  describe('3. Activities API', () => {
    let testLeadId: string;

    beforeAll(async () => {
      const lead = await prisma.lead.findFirst();
      testLeadId = lead!.id;
    });

    it('POST /api/leads/:id/activities should create an interaction and GET returns it', async () => {
      const postRes = await request(app)
        .post(`/api/leads/${testLeadId}/activities`)
        .send({
          type: 'MEETING',
          subject: 'Integration Test Meeting',
          description: 'Quarterly review conducted with stakeholders.',
          occurredAt: new Date().toISOString(),
        });

      expect(postRes.status).toBe(201);
      expect(postRes.body.data.type).toBe('MEETING');
      expect(postRes.body.data.subject).toBe('Integration Test Meeting');

      const getRes = await request(app).get(`/api/leads/${testLeadId}/activities`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data[0].subject).toBe('Integration Test Meeting');
    });
  });

  describe('4. Follow-ups API & Overdue Calculation', () => {
    let testLeadId: string;
    let createdFollowUpId: string;

    beforeAll(async () => {
      const lead = await prisma.lead.findFirst();
      testLeadId = lead!.id;
    });

    it('POST /api/leads/:id/follow-ups should schedule a follow-up with past due date and mark it overdue', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post(`/api/leads/${testLeadId}/follow-ups`)
        .send({
          title: 'Urgent Past Due Reminder',
          description: 'This reminder was due yesterday.',
          dueAt: pastDate,
        });

      expect(res.status).toBe(201);
      createdFollowUpId = res.body.data.id;

      // GET /api/follow-ups?filter=overdue must include it
      const overdueRes = await request(app).get('/api/follow-ups?filter=overdue');
      expect(overdueRes.status).toBe(200);
      const found = overdueRes.body.data.find((f: any) => f.id === createdFollowUpId);
      expect(found).toBeDefined();
      expect(found.isOverdue).toBe(true);
    });

    it('PATCH /api/follow-ups/:id should complete the follow-up, removing it from overdue', async () => {
      const patchRes = await request(app)
        .patch(`/api/follow-ups/${createdFollowUpId}`)
        .send({ status: 'COMPLETED' });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.status).toBe('COMPLETED');
      expect(patchRes.body.data.completedAt).toBeDefined();
      expect(patchRes.body.data.isOverdue).toBe(false);

      // Verify it is NOT in overdue query
      const overdueRes = await request(app).get('/api/follow-ups?filter=overdue');
      const foundInOverdue = overdueRes.body.data.find((f: any) => f.id === createdFollowUpId);
      expect(foundInOverdue).toBeUndefined();

      // Verify it IS in completed query
      const completedRes = await request(app).get('/api/follow-ups?filter=completed');
      const foundInCompleted = completedRes.body.data.find((f: any) => f.id === createdFollowUpId);
      expect(foundInCompleted).toBeDefined();
    });
  });

  describe('5. Pipeline & Dashboard APIs', () => {
    it('GET /api/pipeline should return all 6 stages in order', async () => {
      const res = await request(app).get('/api/pipeline');
      expect(res.status).toBe(200);
      expect(res.body.data.stages).toHaveLength(6);
      const stageNames = res.body.data.stages.map((s: any) => s.stage);
      expect(stageNames).toEqual(['NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATION', 'CONVERTED', 'LOST']);
    });

    it('GET /api/dashboard/summary should compute database-backed KPIs and valid conversion rate', async () => {
      const res = await request(app).get('/api/dashboard/summary');
      expect(res.status).toBe(200);
      expect(res.body.data.totalLeads).toBeGreaterThan(0);
      expect(res.body.data.conversionRate).toBeGreaterThanOrEqual(0);
      expect(res.body.data.conversionRate).toBeLessThanOrEqual(100);
      expect(typeof res.body.data.totalPipelineValue).toBe('number');
    });

    it('GET /api/dashboard/lead-distribution should return counts for all 6 statuses', async () => {
      const res = await request(app).get('/api/dashboard/lead-distribution');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(6);
    });
  });

  describe('6. AI Intelligence API', () => {
    let testLeadId: string;

    beforeAll(async () => {
      const lead = await prisma.lead.findFirst({ where: { status: 'INTERESTED' } });
      testLeadId = lead!.id;
    });

    it('POST /api/ai/leads/:id/analyze should produce all 5 required outputs and validate schema', async () => {
      const res = await request(app).post(`/api/ai/leads/${testLeadId}/analyze`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const ai = res.body.data;
      // 1. Summary
      expect(typeof ai.summary).toBe('string');
      expect(ai.summary.length).toBeGreaterThan(10);

      // 2. Score (integer 1-100)
      expect(Number.isInteger(ai.score)).toBe(true);
      expect(ai.score).toBeGreaterThanOrEqual(1);
      expect(ai.score).toBeLessThanOrEqual(100);

      // 3. Conversion Probability (0-100 estimate)
      expect(typeof ai.conversionProbability).toBe('number');
      expect(ai.conversionProbability).toBeGreaterThanOrEqual(0);
      expect(ai.conversionProbability).toBeLessThanOrEqual(100);

      // 4. Next Best Action & Key Signals
      expect(typeof ai.nextBestAction).toBe('string');
      expect(Array.isArray(ai.keySignals)).toBe(true);
      expect(ai.keySignals.length).toBeGreaterThan(0);

      // 5. Personalized Follow-up Message
      expect(ai.followUpMessage).toBeDefined();
      expect(typeof ai.followUpMessage.subject).toBe('string');
      expect(typeof ai.followUpMessage.body).toBe('string');

      // Check labeling (provider is either gemini or mock)
      expect(['gemini', 'mock']).toContain(ai.provider);
      expect(typeof ai.model).toBe('string');
    });
  });
});
