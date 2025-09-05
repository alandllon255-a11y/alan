import { Controller, Get, Query } from '@nestjs/common';
import { getPrisma } from '../prisma.js';

@Controller('v1/leaderboard')
export class LeaderboardController {
  @Get()
  async getLeaderboard(@Query('type') type = 'rep', @Query('period') period = 'all_time') {
    const prisma = getPrisma();
    try {
      // all_time: simples por reputationPoints/currencyBalance
      if (period === 'all_time') {
        if (type === 'currency') {
          const data = await prisma.user.findMany({
            orderBy: { currencyBalance: 'desc' },
            select: { id: true, name: true, currencyBalance: true, reputationPoints: true, currentLevel: true },
            take: 100,
          });
          return { type, period, data };
        } else {
          const data = await prisma.user.findMany({
            orderBy: { reputationPoints: 'desc' },
            select: { id: true, name: true, currencyBalance: true, reputationPoints: true, currentLevel: true },
            take: 100,
          });
          return { type: 'rep', period, data };
        }
      }

      // períodos dinâmicos (weekly/monthly) exigem GamificationActionLog; placeholder
      return { type, period, data: [], note: 'Implementar agregação por período com ActionLog e cache' };
    } catch (e) {
      return { type, period, data: [], warning: 'DB indisponível' };
    }
  }
}


