import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { GAMIFICATION_QUEUE } from './gamification.constants';
import { GamificationEventPayload, GamificationEventType } from './events';

export class EventTriggerService {
  constructor(
    @InjectQueue(GAMIFICATION_QUEUE) private readonly queue: Queue,
  ) {}

  async publish(type: GamificationEventType, payload: GamificationEventPayload) {
    const createdAt = new Date().toISOString();
    const jobId = `${type}:${payload.userId}:${payload.targetId || 'none'}:${createdAt}`;
    await this.queue.add(type, { type, payload, createdAt }, {
      jobId,
      removeOnComplete: 1000,
      removeOnFail: 1000,
    });
  }
}


