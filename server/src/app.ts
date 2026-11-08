import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { prisma } from './config/db.js';
import { authenticate } from './middleware/auth.js';

// Import route modules
import leadRoutes from './modules/leads/lead.routes.js';
import pipelineRoutes from './modules/pipeline/pipeline.routes.js';
import activityRoutes from './modules/activities/activity.routes.js';
import followUpRoutes from './modules/follow-ups/followUp.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import storageRoutes from './modules/storage/storage.routes.js';
import realtimeRoutes from './modules/realtime/realtime.routes.js';
import neonRoutes from './modules/neon/neon.routes.js';

export const app = express();

// Security and utility middleware
app.use(helmet());

// CORS - strict origin checking
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
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

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Stricter rate limiter for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 AI requests per hour
  message: { success: false, message: 'AI analysis rate limit exceeded. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply authentication to all API routes except health
app.use('/api', authenticate);

// Health check (no auth required)
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
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/leads', pipelineRoutes); // Supports PATCH /api/v1/leads/:id/status
app.use('/api/v1/pipeline', pipelineRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/follow-ups', followUpRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/ai', aiLimiter, aiRoutes); // Apply AI-specific rate limiting
app.use('/api/v1/storage', storageRoutes); // Neon Object Storage
app.use('/api/v1/realtime', realtimeRoutes); // Neon Realtime Live Queries
app.use('/api/v1/neon', neonRoutes); // Neon Diagnostics and Serverless Functions

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Centralized error handler
app.use(errorHandler);

