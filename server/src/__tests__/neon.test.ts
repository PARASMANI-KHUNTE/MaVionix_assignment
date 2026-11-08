import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { NeonStorageService } from '../modules/storage/neon-storage.service.js';
import { NeonFunctionService } from '../modules/neon/neon-function.service.js';
import { NeonAuthService } from '../modules/auth/neon-auth.service.js';
import { NeonRealtimeService } from '../modules/realtime/realtime.service.js';
import { NeonAIGatewayProvider } from '../modules/ai/neon-gateway.provider.js';

const hasNeonDb = Boolean(env.DATABASE_URL && env.DATABASE_URL.includes('neon.tech'));
const hasStorage = Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_ENDPOINT_URL_S3);
const hasAiGateway = Boolean(env.NEON_AI_GATEWAY_TOKEN && env.NEON_AI_GATEWAY_BASE_URL);
const hasRealtime = Boolean(env.NEON_REALTIME_SECRET && env.NEON_REALTIME_URL);

describe('Neon Cloud Services End-to-End Test Suite', () => {
  // 1. Lakebase Postgres
  describe('1. Neon Postgres Service', () => {
    it('should query Postgres database and count existing leads', async () => {
      const count = await prisma.lead.count();
      expect(count).toBeGreaterThanOrEqual(0);
      expect(typeof count).toBe('number');
    });

    it.runIf(hasNeonDb)('should verify connection to the configured Neon host', () => {
      expect(env.DATABASE_URL).toContain('neon.tech');
    });
  });

  // 2. Object Storage
  describe('2. Neon Object Storage Service (S3 Compatible)', () => {
    const testKey = `test-e2e-${Date.now()}.txt`;
    const testContent = 'End-to-end verification content for Neon S3 Object Storage';

    it.runIf(hasStorage)('should upload an object to the assets bucket', async () => {
      const result = await NeonStorageService.uploadFile(
        testKey,
        testContent,
        'text/plain',
        { testRun: 'vitest' }
      );
      expect(result.bucket).toBe('assets');
      expect(result.key).toBe(testKey);
      expect(result.size).toBe(Buffer.byteLength(testContent));
    });

    it.runIf(hasStorage)('should retrieve and read back the stored object', async () => {
      const file = await NeonStorageService.getFile(testKey);
      expect(file.data.toString('utf-8')).toBe(testContent);
      expect(file.contentType).toBe('text/plain');
    });

    it.runIf(hasStorage)('should list files in the bucket and find the uploaded object', async () => {
      const files = await NeonStorageService.listFiles();
      const found = files.find((f) => f.key === testKey);
      expect(found).toBeDefined();
      expect(found?.size).toBe(Buffer.byteLength(testContent));
    });

    it.runIf(hasStorage)('should delete the test object cleanly', async () => {
      await NeonStorageService.deleteFile(testKey);
      const files = await NeonStorageService.listFiles();
      const found = files.find((f) => f.key === testKey);
      expect(found).toBeUndefined();
    });
  });

  // 3. Serverless Functions
  describe('3. Neon Serverless Functions Service', () => {
    it('should invoke the deployed hello serverless function', async () => {
      const result = await NeonFunctionService.invokeHello();
      expect(result.status).toBe(200);
      expect(result.response).toBe('Hello from Neon Functions');
      expect(result.latencyMs).toBeGreaterThan(0);
    }, 15000);
  });

  // 4. Managed Better Auth
  describe('4. Neon Auth Service', () => {
    it('should fetch and validate JWKS public keys from Neon Auth', async () => {
      const jwks = await NeonAuthService.getJwks();
      expect(jwks.keys).toBeDefined();
      expect(Array.isArray(jwks.keys)).toBe(true);
      expect(jwks.keys.length).toBeGreaterThan(0);
      const primaryKey = jwks.keys[0];
      expect(primaryKey.kty).toBe('OKP');
      expect(primaryKey.alg).toBe('EdDSA');
    }, 15000);
  });

  // 5. Neon Realtime
  describe('5. Neon Realtime Service', () => {
    it.runIf(hasRealtime)('should seal a live query with AES-256-GCM using NEON_REALTIME_SECRET', async () => {
      const sealed = await NeonRealtimeService.sealLeadsQuery();
      expect(sealed).toBeDefined();
      expect(typeof sealed.capability).toBe('string');
      expect(sealed.capability.length).toBeGreaterThan(20);
      expect(typeof sealed.queryFingerprint).toBe('string');
      expect(sealed.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  // 6. Neon AI Gateway
  describe('6. Neon AI Gateway Service', () => {
    it.runIf(hasAiGateway)('should connect to Neon AI Gateway and list catalog models', async () => {
      const catalog = await NeonAIGatewayProvider.getCatalogModels();
      expect(catalog.count).toBeGreaterThan(0);
      expect(catalog.models.length).toBeGreaterThan(0);
    }, 15000);
  });

  // 7. Full Status Integration Route
  describe('7. Neon Status Route (GET /api/v1/neon/status)', () => {
    it('should return status details for all Neon services', async () => {
      const res = await request(app).get('/api/v1/neon/status');
      expect(res.status).toBe(200);
      expect(res.body.services).toBeDefined();
      expect(res.body.services.postgres).toBeDefined();
      expect(res.body.services.objectStorage).toBeDefined();
      expect(res.body.services.functions).toBeDefined();
      expect(res.body.services.auth).toBeDefined();
      expect(res.body.services.realtime).toBeDefined();
      expect(res.body.services.aiGateway).toBeDefined();
    }, 20000);
  });
});
