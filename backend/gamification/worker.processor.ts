import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import type { GamificationActionType } from '@prisma/client';
import { GAMIFICATION_QUEUE } from './gamification.constants.js';
import { GamificationRulesService } from './rules.service.js';
import { ReputationService } from './reputation.service.js';
import { CurrencyService } from './currency.service.js';
import { getPrisma } from '../prisma.js';

@Processor(GAMIFICATION_QUEUE)
export class GamificationProcessor extends WorkerHost {
  private readonly rules = new GamificationRulesService();
  private readonly reputation = new ReputationService();
  private readonly currency = new CurrencyService();

  async process(job: Job): Promise<void> {
    const { type, payload } = job.data as { type: GamificationActionType; payload: { userId: string; targetId?: string } };
    const rule = this.rules.getRule(type);
    if (!rule) return;
    const prisma = getPrisma();

    // Enforce simple daily limits using DB log counts
    if (rule.dailyLimit && rule.dailyLimit > 0) {
      const start = new Date();
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date();
      end.setUTCHours(23, 59, 59, 999);
      const count = await prisma.gamificationActionLog.count({
        where: {
          userId: payload.userId,
          actionType: type,
          createdAt: { gte: start, lte: end },
        },
      });
      if (count >= rule.dailyLimit) return;
    }

    // Apply rewards
    if (rule.rep !== 0) {
      await this.reputation.grantReputation(payload.userId, rule.rep, type, payload.targetId);
    }
    if (rule.currency !== 0) {
      if (rule.currency > 0) {
        await this.currency.credit(payload.userId, rule.currency, type, payload.targetId);
      } else {
        await this.currency.debit(payload.userId, Math.abs(rule.currency), `${type}`);
      }
    }
  }
}


