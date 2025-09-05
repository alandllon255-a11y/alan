import { getPrisma } from '../prisma.js';
import type { GamificationActionType, Prisma } from '@prisma/client';

export class CurrencyService {
  async credit(
    userId: string,
    amount: number,
    actionType: GamificationActionType,
    entityId?: string,
    metadata?: Prisma.InputJsonValue
  ) {
    const prisma = getPrisma();
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { currencyBalance: { increment: amount } }
      });
      await tx.gamificationActionLog.create({
        data: {
          userId,
          actionType,
          repChange: 0,
          currencyChange: amount,
          relatedEntityId: entityId,
          metadata: metadata ?? undefined
        }
      });
    });
  }

  async debit(userId: string, amount: number, reason: string) {
    const prisma = getPrisma();
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { currencyBalance: true } });
      if (!user) throw new Error('User not found');
      if (user.currencyBalance < amount) throw new Error('Insufficient balance');

      await tx.user.update({
        where: { id: userId },
        data: { currencyBalance: { decrement: amount } }
      });
      await tx.gamificationActionLog.create({
        data: {
          userId,
          actionType: 'UPVOTE_GIVEN', // placeholder for a debit-specific action if needed
          repChange: 0,
          currencyChange: -amount,
          metadata: { reason } as unknown as Prisma.InputJsonValue
        }
      });
    });
  }
}


