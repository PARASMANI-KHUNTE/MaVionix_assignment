import { createRealtime, rawSql } from '@neon/realtime/server';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/errors.js';

export class NeonRealtimeService {
  private static realtimeClient: ReturnType<typeof createRealtime> | null = null;

  private static getClient() {
    if (!this.realtimeClient) {
      if (!env.NEON_REALTIME_SECRET) {
        throw new AppError('NEON_REALTIME_SECRET is not configured', 500);
      }
      this.realtimeClient = createRealtime({
        secret: env.NEON_REALTIME_SECRET,
        db: 'neondb',
      });
    }
    return this.realtimeClient;
  }

  /**
   * Seal a live query for leads list
   */
  static async sealLeadsQuery() {
    const client = this.getClient();
    // Raw query for leads
    const query = rawSql(
      'SELECT id, "fullName", email, "companyName", status, priority, "estimatedValue", "updatedAt" FROM "Lead" ORDER BY "updatedAt" DESC LIMIT 50'
    );
    return await client.seal({ query });
  }

  /**
   * Seal a live query for pipeline counts
   */
  static async sealPipelineQuery() {
    const client = this.getClient();
    const query = rawSql(
      'SELECT status, count(*)::int as count, coalesce(sum("estimatedValue"), 0) as "totalValue" FROM "Lead" GROUP BY status'
    );
    return await client.seal({ query });
  }

  /**
   * Get Realtime connection configuration
   */
  static getConfig() {
    return {
      enabled: Boolean(env.NEON_REALTIME_URL && env.NEON_REALTIME_SECRET),
      url: env.NEON_REALTIME_URL,
      database: 'neondb',
    };
  }

  /**
   * Health check for Neon Realtime
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded';
    url: string;
    sealingActive: boolean;
    latencyMs: number;
  }> {
    const start = Date.now();
    try {
      if (!env.NEON_REALTIME_SECRET || !env.NEON_REALTIME_URL) {
        return {
          status: 'degraded',
          url: env.NEON_REALTIME_URL || 'unconfigured',
          sealingActive: false,
          latencyMs: 0,
        };
      }
      const client = this.getClient();
      const testQuery = rawSql('SELECT 1 as live_check');
      const sealed = await client.seal({ query: testQuery });

      return {
        status: sealed && sealed.capability ? 'healthy' : 'degraded',
        url: env.NEON_REALTIME_URL,
        sealingActive: Boolean(sealed?.capability),
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        status: 'degraded',
        url: env.NEON_REALTIME_URL || 'error',
        sealingActive: false,
        latencyMs: Date.now() - start,
      };
    }
  }
}
