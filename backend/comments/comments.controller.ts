import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { getPrisma } from '../prisma.js';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsString()
  answerId?: string;

  @IsOptional()
  @IsString()
  questionId?: string;
}

@Controller('comments')
export class CommentsController {
  @Get('question/:id')
  async listForQuestion(@Param('id') questionId: string) {
    const prisma = getPrisma();
    const items = await prisma.comment.findMany({
      where: { questionId },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: items };
  }

  @Get('answer/:id')
  async listForAnswer(@Param('id') answerId: string) {
    const prisma = getPrisma();
    const items = await prisma.comment.findMany({
      where: { answerId },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: items };
  }

  @Post()
  async create(@Request() req: any, @Body() body: CreateCommentDto) {
    const userId = req.user?.id?.toString() ?? '7';
    const prisma = getPrisma();
    if (!body.answerId && !body.questionId) {
      return { success: false, error: 'answerId ou questionId é obrigatório' };
    }
    const created = await prisma.comment.create({
      data: {
        authorId: userId,
        content: body.content,
        answerId: body.answerId ?? null,
        questionId: body.questionId ?? null,
      },
    });
    return { success: true, id: created.id };
  }
}

