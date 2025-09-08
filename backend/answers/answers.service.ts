import { Injectable } from '@nestjs/common';
import { getPrisma } from '../prisma.js';

@Injectable()
export class AnswersService {
  async upvote(userId: string, answerId: string) {
    const prisma = getPrisma();

    return await prisma.$transaction(async (tx) => {
      const answer = await tx.answer.findUnique({
        where: { id: answerId },
        select: { authorId: true }
      });
      if (!answer) {
        return { success: false, error: 'Resposta não encontrada' } as const;
      }

      // Upsert voto como UP
      const existing = await tx.answerVote.findUnique({
        where: { answerId_userId: { answerId, userId } }
      }).catch(() => null);

      if (existing) {
        if (existing.type === 'UP') {
          // toggle to neutral
          await tx.answerVote.delete({ where: { answerId_userId: { answerId, userId } } });
          return { success: true, answerAuthorId: answer.authorId, changed: true, newType: 'NEUTRAL' as const };
        }
        await tx.answerVote.update({
          where: { answerId_userId: { answerId, userId } },
          data: { type: 'UP' }
        });
        return { success: true, answerAuthorId: answer.authorId, changed: true, newType: 'UP' as const };
      } else {
        await tx.answerVote.create({
          data: { answerId, userId, type: 'UP' }
        });
        return { success: true, answerAuthorId: answer.authorId, changed: true, newType: 'UP' as const };
      }
    });
  }

  async downvote(userId: string, answerId: string) {
    const prisma = getPrisma();
    return await prisma.$transaction(async (tx) => {
      const answer = await tx.answer.findUnique({
        where: { id: answerId },
        select: { authorId: true }
      });
      if (!answer) {
        return { success: false, error: 'Resposta não encontrada' } as const;
      }

      const existing = await tx.answerVote.findUnique({
        where: { answerId_userId: { answerId, userId } }
      }).catch(() => null);

      if (existing) {
        if (existing.type === 'DOWN') {
          await tx.answerVote.delete({ where: { answerId_userId: { answerId, userId } } });
          return { success: true, answerAuthorId: answer.authorId, changed: true, newType: 'NEUTRAL' as const };
        }
        await tx.answerVote.update({
          where: { answerId_userId: { answerId, userId } },
          data: { type: 'DOWN' }
        });
        return { success: true, answerAuthorId: answer.authorId, changed: true, newType: 'DOWN' as const };
      } else {
        await tx.answerVote.create({ data: { answerId, userId, type: 'DOWN' } });
        return { success: true, answerAuthorId: answer.authorId, changed: true, newType: 'DOWN' as const };
      }
    });
  }

  async getAnswerAuthorId(answerId: string): Promise<string> {
    const prisma = getPrisma();
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: { authorId: true }
    });
    return answer?.authorId || '';
  }
}


