import { Injectable } from '@nestjs/common';
import { getPrisma } from '../prisma.js';
import type { Prisma, VoteType } from '@prisma/client';
import { EventTriggerService } from '../gamification/event-trigger.service.js';

type CreateQuestionInput = {
  title: string;
  content: string;
  tags?: string[];
};

@Injectable()
export class QuestionsService {
  constructor(private readonly events: EventTriggerService) {}

  async list(params: { search?: string; tags?: string[]; sort?: 'votes' | 'newest' | 'views'; limit?: number; offset?: number }) {
    const prisma = getPrisma();
    const { search, tags, sort = 'newest', limit = 20, offset = 0 } = params || {};

    const where: Prisma.QuestionWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            }
          : undefined,
        tags && tags.length
          ? {
              questionTags: {
                some: { tag: { slug: { in: tags } } },
              },
            }
          : undefined,
      ].filter(Boolean) as Prisma.QuestionWhereInput[],
    };

    const orderBy: Prisma.QuestionOrderByWithRelationInput[] = [];
    if (sort === 'newest') orderBy.push({ createdAt: 'desc' });
    if (sort === 'views') orderBy.push({ views: 'desc' });
    if (sort === 'votes') orderBy.push({ votes: { _count: 'desc' } } as any);

    const questions = await prisma.question.findMany({
      where,
      orderBy: orderBy.length ? orderBy : [{ createdAt: 'desc' }],
      take: Math.min(Math.max(limit, 1), 100),
      skip: Math.max(offset, 0),
      include: {
        author: { select: { id: true, name: true, email: true } },
        questionTags: { include: { tag: { select: { slug: true, name: true } } } },
        _count: { select: { votes: true, answers: true } },
      },
    });

    return questions.map((q) => ({
      id: q.id,
      title: q.title,
      content: q.content,
      views: q.views,
      createdAt: q.createdAt,
      author: { id: q.author.id, name: q.author.name },
      tags: q.questionTags.map((qt) => qt.tag.slug),
      votes: q._count.votes,
      answersCount: q._count.answers,
      hasAcceptedAnswer: Boolean(q.acceptedAnswerId),
    }));
  }

  async search(q: string, limit = 20, offset = 0) {
    const prisma = getPrisma();
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safeOffset = Math.max(offset, 0);

    // Raw FTS using Postgres to_tsvector/plainto_tsquery (no extra extension required)
    const rows = await prisma.$queryRawUnsafe<Array<{ id: string; title: string; content: string; created_at: Date; views: number; rank: number }>>(
      `SELECT q.id, q.title, q.content, q.created_at, q.views,
              ts_rank(to_tsvector('simple', coalesce(q.title,'') || ' ' || coalesce(q.content,'')), plainto_tsquery('simple', $1)) as rank
         FROM questions q
        WHERE to_tsvector('simple', coalesce(q.title,'') || ' ' || coalesce(q.content,'')) @@ plainto_tsquery('simple', $1)
        ORDER BY rank DESC, q.created_at DESC
        LIMIT $2 OFFSET $3`,
      q,
      safeLimit,
      safeOffset
    );

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      createdAt: r.created_at,
      views: r.views,
    }));
  }

  async getById(questionId: string) {
    const prisma = getPrisma();
    const q = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        author: { select: { id: true, name: true, email: true } },
        questionTags: { include: { tag: { select: { slug: true, name: true } } } },
        answers: {
          include: {
            author: { select: { id: true, name: true } },
            votes: { select: { id: true, type: true, userId: true } },
            comments: { include: { author: { select: { id: true, name: true } } } },
          },
          orderBy: { createdAt: 'asc' },
        },
        votes: { select: { id: true, type: true, userId: true } },
      },
    });
    if (!q) return null;
    return q;
  }

  async create(userId: string, input: CreateQuestionInput) {
    const prisma = getPrisma();
    const tags = input.tags?.map((t) => t.trim().toLowerCase()).filter(Boolean) ?? [];
    return await prisma.$transaction(async (tx) => {
      // Ensure tags
      const tagRecords = await Promise.all(
        tags.map((slug) =>
          tx.tag.upsert({ where: { slug }, update: {}, create: { slug, name: slug } })
        )
      );

      const created = await tx.question.create({
        data: {
          title: input.title,
          content: input.content,
          authorId: userId,
          questionTags: { create: tagRecords.map((t) => ({ tagId: t.id })) },
        },
        include: {
          author: { select: { id: true, name: true } },
          questionTags: { include: { tag: true } },
        },
      });

      return created;
    });
  }

  async addAnswer(userId: string, questionId: string, content: string, parentAnswerId?: string) {
    const prisma = getPrisma();
    const answer = await prisma.answer.create({
      data: {
        questionId,
        authorId: userId,
        content,
        parentAnswerId: parentAnswerId ?? undefined,
      },
      include: { author: { select: { id: true, name: true } } },
    });
    return answer;
  }

  async voteQuestion(userId: string, questionId: string, type: VoteType) {
    const prisma = getPrisma();
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.questionVote
        .findUnique({ where: { questionId_userId: { questionId, userId } } })
        .catch(() => null);

      if (existing) {
        if (existing.type === type) return { changed: false } as const;
        await tx.questionVote.update({
          where: { questionId_userId: { questionId, userId } },
          data: { type },
        });
      } else {
        await tx.questionVote.create({ data: { questionId, userId, type } });
      }

      // Gamification: reward voter for giving a vote
      await this.events.publish(type === 'UP' ? 'UPVOTE_GIVEN' : 'DOWNVOTE_GIVEN', {
        userId,
        targetId: questionId,
      });
      return { changed: true } as const;
    });
  }

  async acceptAnswer(questionId: string, answerId: string, actingUserId: string) {
    const prisma = getPrisma();
    return await prisma.$transaction(async (tx) => {
      const question = await tx.question.findUnique({ where: { id: questionId } });
      if (!question) return { success: false, error: 'Pergunta não encontrada' } as const;
      if (question.authorId !== actingUserId) return { success: false, error: 'Somente o autor pode aceitar uma resposta' } as const;

      const answer = await tx.answer.findUnique({ where: { id: answerId }, select: { id: true, authorId: true } });
      if (!answer || answerId && answerId.length === 0) return { success: false, error: 'Resposta não encontrada' } as const;

      // Update question accepted answer
      await tx.question.update({ where: { id: questionId }, data: { acceptedAnswerId: answerId } });
      // Mark accepted flag
      await tx.answer.update({ where: { id: answerId }, data: { isAccepted: true } });

      // Publish gamification for the answer author
      await this.events.publish('SOLUTION_MARKED', {
        userId: answer.authorId,
        targetId: answerId,
        targetOwnerId: answer.authorId,
      });

      return { success: true } as const;
    });
  }
}

