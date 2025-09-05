import { Controller, Post, Param, Request } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { EventTriggerService } from '../gamification/event-trigger.service';

@Controller('answers')
export class AnswersController {
  constructor(
    private readonly answers: AnswersService,
    private readonly events: EventTriggerService,
  ) {}

  @Post(':id/upvote')
  async upvoteAnswer(@Param('id') answerId: string, @Request() req) {
    const userId = req.user?.id || '7';
    const ownerId = await this.answers.getAnswerAuthorId(answerId);
    if (ownerId === userId) {
      return { success: false, error: 'Você não pode votar na própria resposta' };
    }
    const result = await this.answers.upvote(userId, answerId);
    if (result?.success) {
      await this.events.publish('ANSWER_UPVOTED', { userId, targetId: answerId, targetOwnerId: ownerId });
    }
    return result;
  }
}


