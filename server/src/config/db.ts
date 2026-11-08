import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      { level: 'warn', emit: 'event' },
      { level: 'error', emit: 'event' },
    ],
  });

  // Handle logging events and filter routine Neon/PgBouncer idle socket recycling
  client.$on('error', (e) => {
    const msg = e?.message || '';
    if (
      msg.includes('kind: Closed') ||
      msg.includes('Connection closed') ||
      msg.includes('connection reset by peer')
    ) {
      // Benign serverless connection pool recycling by Neon/PgBouncer
      return;
    }
    console.error('Prisma Database Error:', msg);
  });

  client.$on('warn', (e) => {
    console.warn('Prisma Database Warning:', e?.message || e);
  });

  return client;
}

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
