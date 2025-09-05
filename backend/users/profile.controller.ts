import { Controller, Get, Request } from '@nestjs/common';
import { getPrisma } from '../prisma';

function rankTitleFromLevel(level: number): string {
  if (level < 5) return 'Iniciante';
  if (level < 15) return 'Júnior';
  if (level < 30) return 'Pleno';
  if (level < 50) return 'Sênior';
  return 'Arquiteto';
}

@Controller('users')
export class ProfileController {
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = (req.user?.id || req.headers['x-user-id'] || '7').toString();
    const prisma = getPrisma();
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          reputationPoints: true,
          currencyBalance: true,
          currentLevel: true,
        },
      });

      if (!user) {
        // Resposta aditiva mínima quando usuário não existe ainda
        return {
          id: userId,
          email: null,
          name: 'Você',
          reputation_points: 0,
          currency_balance: 0,
          current_level: 1,
          rank_title: rankTitleFromLevel(1),
          achievements: [],
        };
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        reputation_points: user.reputationPoints,
        currency_balance: user.currencyBalance,
        current_level: user.currentLevel,
        rank_title: rankTitleFromLevel(user.currentLevel),
        achievements: [],
      };
    } catch (e) {
      // Fallback quando DB não está disponível
      return {
        id: userId,
        email: null,
        name: 'Você',
        reputation_points: 0,
        currency_balance: 0,
        current_level: 1,
        rank_title: rankTitleFromLevel(1),
        achievements: [],
        warning: 'DB indisponível, retornando valores padrão',
      };
    }
  }
}


