import { env } from '../../config/env.js';

export interface NeonAuthJWK {
  kty: string;
  alg: string;
  crv?: string;
  x?: string;
  kid: string;
}

export class NeonAuthService {
  private static cachedJwks: { keys: NeonAuthJWK[] } | null = null;
  private static lastFetched: number = 0;

  static async getJwks(): Promise<{ keys: NeonAuthJWK[] }> {
    const now = Date.now();
    // Cache for 10 minutes
    if (this.cachedJwks && now - this.lastFetched < 10 * 60 * 1000) {
      return this.cachedJwks;
    }

    if (!env.NEON_AUTH_JWKS_URL) {
      throw new Error('NEON_AUTH_JWKS_URL is not configured');
    }

    const res = await fetch(env.NEON_AUTH_JWKS_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch JWKS from Neon Auth: ${res.statusText}`);
    }

    const data = (await res.json()) as { keys: NeonAuthJWK[] };
    this.cachedJwks = data;
    this.lastFetched = now;
    return data;
  }

  static getConfig() {
    return {
      provider: 'neon-managed-better-auth',
      authBaseUrl: env.NEON_AUTH_BASE_URL,
      jwksUrl: env.NEON_AUTH_JWKS_URL,
      branch: env.NEON_BRANCH,
    };
  }

  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded';
    authBaseUrl: string;
    keysCount: number;
    latencyMs: number;
  }> {
    const start = Date.now();
    try {
      const jwks = await this.getJwks();
      return {
        status: 'healthy',
        authBaseUrl: env.NEON_AUTH_BASE_URL || 'configured',
        keysCount: jwks.keys?.length || 0,
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        status: 'degraded',
        authBaseUrl: env.NEON_AUTH_BASE_URL || 'unreachable',
        keysCount: 0,
        latencyMs: Date.now() - start,
      };
    }
  }
}
