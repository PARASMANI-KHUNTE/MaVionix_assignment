import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { prisma } from './config/db.js';

// Import route modules
import leadRoutes from './modules/leads/lead.routes.js';
import pipelineRoutes from './modules/pipeline/pipeline.routes.js';
import activityRoutes from './modules/activities/activity.routes.js';
import followUpRoutes from './modules/follow-ups/followUp.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';

export const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost and configured client URL
      if (!origin || origin === env.CLIENT_URL || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow for development convenience
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    // Ping DB
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ai-crm-api',
      environment: env.NODE_ENV,
      database: 'connected',
      aiProvider: env.AI_PROVIDER,
      aiModel: env.AI_PROVIDER === 'gemini' ? env.GEMINI_MODEL : 'deterministic-mock-v1',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'ai-crm-api',
      database: 'disconnected',
      error: 'Database connection failed',
    });
  }
});

// Register feature modules
app.use('/api/leads', leadRoutes);
app.use('/api/leads', pipelineRoutes); // Covers PATCH /api/leads/:id/status
app.use('/api/leads', activityRoutes); // Covers GET / POST /api/leads/:id/activities
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api', followUpRoutes); // Covers /api/leads/:id/follow-ups
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Centralized error handler
app.use(errorHandler);
