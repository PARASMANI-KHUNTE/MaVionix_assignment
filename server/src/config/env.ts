import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load root .env.local if present, followed by server .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  AI_PROVIDER: z.enum(['gemini', 'neon', 'mock']).default('gemini'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash'),
  // Authentication
  API_KEYS: z.string().optional().default(''), // Comma-separated list of valid API keys
  ALLOW_NO_AUTH: z.enum(['true', 'false']).default('false'), // Allow requests without API key in development

  // Neon Services
  NEON_BRANCH: z.string().default('production'),
  NEON_BRANCH_ID: z.string().optional(),
  NEON_FUNCTION_HOST_SUFFIX: z.string().optional(),
  NEON_FUNCTION_URL: z.string().default('https://br-royal-band-azikn3ny-hello.compute.c-3.ap-southeast-1.aws.neon.tech/'),
  NEON_AUTH_BASE_URL: z.string().optional().default('https://ep-little-base-azfz27rd.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth'),
  NEON_AUTH_JWKS_URL: z.string().optional().default('https://ep-little-base-azfz27rd.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth/.well-known/jwks.json'),
  NEON_REALTIME_URL: z.string().optional().default('wss://ep-little-base-azfz27rd.rt.c-3.ap-southeast-1.aws.neon.tech/'),
  NEON_REALTIME_SECRET: z.string().optional().default(''),
  AWS_ACCESS_KEY_ID: z.string().optional().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(''),
  AWS_ENDPOINT_URL_S3: z.string().optional().default(''),
  AWS_REGION: z.string().default('ap-southeast-1'),
  NEON_AI_GATEWAY_TOKEN: z.string().optional().default(''),
  NEON_AI_GATEWAY_BASE_URL: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
