import { Body, Controller, Get, Param, Post, Query, Request, Patch } from '@nestjs/common';
import { QuestionsService } from './questions.service.js';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  @Get()
  async list(
    @Query('q') q?: string,
    @Query('tags') tagsCsv?: string,
    @Query('sort') sort?: 'votes' | 'newest' | 'views',
  ) {
    const tags = tagsCsv ? tagsCsv.split(',').map((t) => t.trim()).filter(Boolean) : [];
    return this.questions.list({ search: q, tags, sort });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.questions.getById(id);
    if (!result) return { success: false, error: 'Pergunta não encontrada' };
    return { success: true, data: result };
  }

  @Post()
  async create(@Request() req: any, @Body() body: { title: string; content: string; tags?: string[] }) {
    const userId = req.user?.id?.toString() ?? '7';
    if (!body?.title || !body?.content) {
      return { success: false, error: 'Título e conteúdo são obrigatórios' };
    }
    const created = await this.questions.create(userId, {
      title: body.title,
      content: body.content,
      tags: Array.isArray(body.tags) ? body.tags : [],
    });
    return { success: true, id: created.id };
  }

  @Post(':id/answers')
  async addAnswer(@Param('id') questionId: string, @Request() req: any, @Body() body: { content: string; parentAnswerId?: string }) {
    const userId = req.user?.id?.toString() ?? '7';
    if (!body?.content) return { success: false, error: 'Conteúdo é obrigatório' };
    const ans = await this.questions.addAnswer(userId, questionId, body.content, body.parentAnswerId);
    return { success: true, id: ans.id };
  }

  @Post(':id/vote')
  async vote(@Param('id') questionId: string, @Request() req: any, @Body() body: { type: 'UP' | 'DOWN' }) {
    const userId = req.user?.id?.toString() ?? '7';
    if (!body?.type || (body.type !== 'UP' && body.type !== 'DOWN')) {
      return { success: false, error: 'Tipo de voto inválido' };
    }
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

