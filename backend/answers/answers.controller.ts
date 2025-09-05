import { Controller, Post, Param, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AnswersService } from './answers.service.js';
import { EventTriggerService } from '../gamification/event-trigger.service.js';

@ApiTags('answers')
@ApiBearerAuth()
@Controller('answers')
export class AnswersController {
  constructor(
    private readonly answers: AnswersService,
    private readonly events: EventTriggerService,
  ) {}

  @ApiOperation({ summary: 'Upvote em resposta' })
  @ApiParam({ name: 'id', description: 'ID da resposta' })
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


