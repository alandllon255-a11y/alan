import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { getPrisma } from '../prisma.js';

@ApiTags('leaderboard')
@Controller('v1/leaderboard')
export class LeaderboardController {
  @ApiOperation({ summary: 'Leaderboard por tipo/período' })
  @ApiQuery({ name: 'type', required: false, enum: ['rep','currency'] })
  @ApiQuery({ name: 'period', required: false, enum: ['all_time'] })
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


