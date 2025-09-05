import { getPrisma } from '../prisma';

export class CurrencyService {
  async credit(userId: string, amount: number, actionType: string, entityId?: string, metadata?: unknown) {
    const prisma = getPrisma();
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { currencyBalance: { increment: amount } }
      });
      await tx.gamificationActionLog.create({
        data: {
          userId,
          actionType: actionType as any,
          repChange: 0,
          currencyChange: amount,
          relatedEntityId: entityId,
          metadata: metadata ? (metadata as any) : undefined
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
          actionType: 'UPVOTE_GIVEN' as any, // placeholder for a debit-specific action if needed
          repChange: 0,
          currencyChange: -amount,
          metadata: { reason } as any
        }
      });
    });
  }
}


