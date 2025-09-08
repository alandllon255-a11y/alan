import { Controller, Get } from '@nestjs/common';
import { getPrisma } from '../prisma.js';
import { getRedis } from '../redis.js';

@Controller('health')
export class HealthController {
  @Get()
  async check() {
    const prisma = getPrisma();
    // DB
    let db = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch {
      db = false;
    }
    // Redis
    let redis = false;
    try {
      const client = getRedis();
      await client.ping();
      redis = true;
    } catch {
      redis = false;
    }
    const ok = db && redis;
    return { ok, db, redis };
  }
}

