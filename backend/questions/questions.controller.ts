import { Body, Controller, Get, Param, Post, Query, Request, Patch } from '@nestjs/common';
import { QuestionsService } from './questions.service.js';
import { CreateQuestionDto, AddAnswerDto, VoteDto } from './dto.js';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  @Get()
  async list(
    @Query('q') q?: string,
    @Query('tags') tagsCsv?: string,
    @Query('sort') sort?: 'votes' | 'newest' | 'views',
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    const tags = tagsCsv ? tagsCsv.split(',').map((t) => t.trim()).filter(Boolean) : [];
    return this.questions.list({ search: q, tags, sort, limit: Number(limit), offset: Number(offset) });
  }

  @Get(':id([0-9a-fA-F-]{36})')
  async getById(@Param('id') id: string) {
    const result = await this.questions.getById(id);
    if (!result) return { success: false, error: 'Pergunta não encontrada' };
    return { success: true, data: result };
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    if (!q || !q.trim()) return { success: true, data: [] };
    const data = await this.questions.search(q, Number(limit), Number(offset));
    return { success: true, data };
  }

  @Post()
  async create(@Request() req: any, @Body() body: CreateQuestionDto) {
    const userId = req.user?.id?.toString() ?? '7';
    const created = await this.questions.create(userId, {
      title: body.title,
      content: body.content,
      tags: Array.isArray(body.tags) ? body.tags : [],
    });
    return { success: true, id: created.id };
  }

  @Post(':id/answers')
  async addAnswer(@Param('id') questionId: string, @Request() req: any, @Body() body: AddAnswerDto) {
    const userId = req.user?.id?.toString() ?? '7';
    const ans = await this.questions.addAnswer(userId, questionId, body.content, body.parentAnswerId);
    return { success: true, id: ans.id };
  }

  @Post(':id/vote')
  async vote(@Param('id') questionId: string, @Request() req: any, @Body() body: VoteDto) {
    const userId = req.user?.id?.toString() ?? '7';
    const result = await this.questions.voteQuestion(userId, questionId, body.type);
    return { success: true, changed: result.changed };
  }

  @Patch(':id/accept/:answerId')
  async accept(@Param('id') questionId: string, @Param('answerId') answerId: string, @Request() req: any) {
    const userId = req.user?.id?.toString() ?? '7';
    const result = await this.questions.acceptAnswer(questionId, answerId, userId);
    return result;
  }
}

