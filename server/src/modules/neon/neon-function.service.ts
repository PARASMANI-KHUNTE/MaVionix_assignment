import { env } from '../../config/env.js';

export class NeonFunctionService {
  static getFunctionUrl(): string {
    return env.NEON_FUNCTION_URL;
  }

  static async invokeHello(): Promise<{ response: string; latencyMs: number; status: number }> {
    const url = this.getFunctionUrl();
    const start = Date.now();
    const res = await fetch(url);
    const text = await res.text();
    return {
      response: text.trim(),
      latencyMs: Date.now() - start,
      status: res.status,
    };
  }

  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded';
    url: string;
    response: string;
    latencyMs: number;
  }> {
    const start = Date.now();
    try {
      const res = await this.invokeHello();
      return {
        status: res.status === 200 ? 'healthy' : 'degraded',
        url: this.getFunctionUrl(),
        response: res.response,
        latencyMs: res.latencyMs,
      };
    } catch (err: any) {
      return {
        status: 'degraded',
        url: this.getFunctionUrl(),
        response: err?.message || 'Connection failed',
        latencyMs: Date.now() - start,
      };
    }
  }
}
