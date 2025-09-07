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
      // períodos dinâmicos: weekly/monthly por soma de repChange/currencyChange no ActionLog
      const now = new Date();
      let start = new Date(now);
      if (period === 'weekly') {
        const day = now.getUTCDay(); // 0..6 (Sun..Sat)
        const diff = (day + 6) % 7; // start Monday
        start.setUTCDate(now.getUTCDate() - diff);
        start.setUTCHours(0, 0, 0, 0);
      } else if (period === 'monthly') {
        start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
      } else {
        // default: last 7 days
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Aggregate via raw query for performance
      const selectField = type === 'currency' ? 'currency_change' : 'rep_change';
      const rows = await prisma.$queryRawUnsafe<Array<{ user_id: string; total: number }>>(
        `SELECT user_id, SUM(${selectField}) as total
           FROM gamification_action_log
          WHERE created_at >= $1
          GROUP BY user_id
          ORDER BY total DESC
          LIMIT 100`,
        start
      );

      // Enrich with user display fields
      const userIds = rows.map((r) => r.user_id);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, reputationPoints: true, currencyBalance: true, currentLevel: true },
      });
      const byId = new Map(users.map((u) => [u.id, u]));
      const data = rows.map((r) => ({
        id: r.user_id,
        name: byId.get(r.user_id)?.name ?? 'Usuário',
        reputationPoints: byId.get(r.user_id)?.reputationPoints ?? 0,
        currencyBalance: byId.get(r.user_id)?.currencyBalance ?? 0,
        currentLevel: byId.get(r.user_id)?.currentLevel ?? 1,
        periodTotal: Number(r.total ?? 0),
      }));
      return { type, period, since: start.toISOString(), data };
    } catch (e) {
      return { type, period, data: [], warning: 'DB indisponível' };
    }
  }
}


