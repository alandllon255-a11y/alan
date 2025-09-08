import { Body, Controller, Post } from '@nestjs/common';
import { EventTriggerService } from './event-trigger.service.js';
import { GamificationEventPayload, GamificationEventType, isGamificationEventType } from './events.js';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly events: EventTriggerService) {}

  @Post('event')
  async publish(@Body() body: { type: string; payload: GamificationEventPayload }) {
    if (!body?.type || !isGamificationEventType(body.type)) {
      return { success: false, error: 'Tipo inválido' };
    }
    await this.events.publish(body.type as GamificationEventType, body.payload);
    return { success: true };
  }
}

