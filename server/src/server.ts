import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/db.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 AI CRM Server running on port ${PORT}`);
  console.log(`   - Environment: ${env.NODE_ENV}`);
  console.log(`   - AI Provider: ${env.AI_PROVIDER}`);
  console.log(`   - Health Check: http://localhost:${PORT}/api/health`);
});

const handleShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ PostgreSQL disconnected. Process exited.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
