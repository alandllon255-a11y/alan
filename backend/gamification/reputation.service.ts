import { getPrisma } from '../prisma';

export class ReputationService {
  /**
   * Grant reputation to a user, log the action, and update current level if needed.
   * newLevel = floor((REP/100)^(1/2.5)) + 1
   */
  async grantReputation(userId: string, amount: number, actionType: string, entityId?: string, metadata?: unknown) {
    const prisma = getPrisma();
    await prisma.$transaction(async (tx) => {
      // Update reputation
      const updated = await tx.user.update({
        where: { id: userId },
        data: { reputationPoints: { increment: amount } },
        select: { reputationPoints: true }
      });

      // Level recalculation
      const newLevel = this.calculateLevel(updated.reputationPoints);
      await tx.user.update({
        where: { id: userId },
        data: { currentLevel: newLevel }
      });

      // Log action
      await tx.gamificationActionLog.create({
        data: {
          userId,
          actionType: actionType as any,
          repChange: amount,
          currencyChange: 0,
          relatedEntityId: entityId,
          metadata: metadata ? (metadata as any) : undefined
        }
      });
    });
  }

  calculateLevel(rep: number): number {
    if (rep < 0) rep = 0;
    const lvl = Math.floor(Math.pow(rep / 100, 1 / 2.5)) + 1;
    return Math.max(1, lvl);
  }
}


