import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GAMIFICATION_QUEUE } from './gamification.constants.js';
import { EventTriggerService } from './event-trigger.service.js';
import { GamificationProcessor } from './worker.processor.js';

const ENABLE_GAMIFICATION = String(process.env.ENABLE_GAMIFICATION ?? 'true').toLowerCase() === 'true';

@Module({
  imports: [
    ...(ENABLE_GAMIFICATION
      ? [
          // Configure Redis connection via environment variables
          BullModule.forRoot({
            connection: {
              host: process.env.REDIS_HOST || '127.0.0.1',
              port: Number(process.env.REDIS_PORT || 6379),
              username: process.env.REDIS_USERNAME,
              password: process.env.REDIS_PASSWORD,
              db: Number(process.env.REDIS_DB || 0)
            }
          }),
          BullModule.registerQueue({ name: GAMIFICATION_QUEUE })
        ]
      : [])
  ],
  providers: [
    ...(ENABLE_GAMIFICATION
      ? [EventTriggerService, GamificationProcessor]
      : [
          {
            provide: EventTriggerService,
            useValue: { publish: async () => {} }
          }
        ])
  ],
  exports: [EventTriggerService],
})
export class GamificationModule {}


