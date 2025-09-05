import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance for the whole backend process.
// In NestJS it is usually provided via a PrismaModule provider.
let prismaClient: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    });
  }
  return prismaClient;
}

export type PrismaTx = Parameters<PrismaClient['$transaction']>[0] extends (infer T)[] ? never : Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];


