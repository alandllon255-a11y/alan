import { Controller, Get } from '@nestjs/common';
import { getPrisma } from '../prisma.js';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { GAMIFICATION_QUEUE } from '../gamification/gamification.constants.js';

@Controller('health')
export class HealthController {
  constructor(@InjectQueue(GAMIFICATION_QUEUE) private readonly queue: Queue) {}

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
    // Redis/Queue
    let redis = false;
    try {
      await this.queue.getWaitingCount();
      redis = true;
    } catch {
      redis = false;
    }
    const ok = db && redis;
    return { ok, db, redis };
  }
}

