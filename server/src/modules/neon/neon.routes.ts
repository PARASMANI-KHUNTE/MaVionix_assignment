import { Router, Request, Response } from 'express';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';
import { NeonStorageService } from '../storage/neon-storage.service.js';
import { NeonRealtimeService } from '../realtime/realtime.service.js';
import { NeonAuthService } from '../auth/neon-auth.service.js';
import { NeonFunctionService } from './neon-function.service.js';
import { NeonAIGatewayProvider } from '../ai/neon-gateway.provider.js';

const router = Router();

/**
 * Live test across all 6 Neon services
 */
router.get('/status', async (_req: Request, res: Response) => {
  const timestamp = new Date().toISOString();

  // 1. Postgres check
  let postgresResult: any;
  const pgStart = Date.now();
  try {
    const leadCount = await prisma.lead.count();
    const endpointHost = env.DATABASE_URL.includes('@')
      ? env.DATABASE_URL.split('@')[1].split('/')[0]
      : 'neondb-cluster';
    postgresResult = {
      status: 'healthy',
      provider: 'Lakebase Postgres',
      leadCount,
      host: endpointHost,
      pooled: endpointHost.includes('-pooler'),
      latencyMs: Date.now() - pgStart,
    };
  } catch (err: any) {
    postgresResult = {
      status: 'degraded',
      error: err?.message || 'Database connection error',
      latencyMs: Date.now() - pgStart,
    };
  }

  // 2. Object Storage check
  const objectStorageResult = await NeonStorageService.healthCheck();

  // 3. Functions check
  const functionResult = await NeonFunctionService.healthCheck();

  // 4. Auth check
  const authResult = await NeonAuthService.healthCheck();

  // 5. Realtime check
  const realtimeResult = await NeonRealtimeService.healthCheck();

  // 6. AI Gateway check
  const aiGatewayResult = await NeonAIGatewayProvider.healthCheck();

  const allHealthy = [
    postgresResult.status === 'healthy',
    objectStorageResult.status === 'healthy',
    functionResult.status === 'healthy',
    authResult.status === 'healthy',
    realtimeResult.status === 'healthy',
    aiGatewayResult.status === 'healthy',
  ].every(Boolean);

  res.json({
    status: allHealthy ? 'operational' : 'partially_degraded',
    project: {
      orgId: 'org-sweet-fog-47818546',
      projectId: 'polished-bar-01081840',
      branch: env.NEON_BRANCH || 'production',
      region: env.AWS_REGION || 'ap-southeast-1',
    },
    services: {
      postgres: postgresResult,
      objectStorage: objectStorageResult,
      functions: functionResult,
      auth: authResult,
      realtime: realtimeResult,
      aiGateway: aiGatewayResult,
    },
    timestamp,
  });
});

/**
 * Invoke Neon Serverless Function directly
 */
router.get('/function/hello', async (_req: Request, res: Response) => {
  try {
    const result = await NeonFunctionService.invokeHello();
    res.json({
      success: true,
      service: 'Neon Functions',
      data: result,
    });
  } catch (err: any) {
    res.status(502).json({
      success: false,
      error: err?.message || 'Failed to invoke Neon Function',
    });
  }
});

export default router;
