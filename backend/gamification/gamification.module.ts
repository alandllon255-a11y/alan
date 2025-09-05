import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GAMIFICATION_QUEUE } from './gamification.constants.js';
import { EventTriggerService } from './event-trigger.service.js';
import { GamificationProcessor } from './worker.processor.js';

@Module({
  imports: [
    // Configure Redis connection via environment variables
    // BULLMQ_CONNECTION_URI=redis://localhost:6379
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        db: Number(process.env.REDIS_DB || 0)
      }
    }),
    BullModule.registerQueue({ name: GAMIFICATION_QUEUE }),
  ],
  providers: [EventTriggerService, GamificationProcessor],
  exports: [EventTriggerService],
})
export class GamificationModule {}


