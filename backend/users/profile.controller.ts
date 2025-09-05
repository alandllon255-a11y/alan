import { Controller, Get, Request, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { getPrisma } from '../prisma.js';
import { JwtGuard } from '../auth/jwt.guard.js';

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
          username: true,
          avatarUrl: true,
          bannerUrl: true,
          bio: true,
          location: true,
          website: true,
          company: true,
          social: true,
          preferences: true,
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
        username: user.username,
        avatar_url: user.avatarUrl,
        banner_url: user.bannerUrl,
        bio: user.bio,
        location: user.location,
        website: user.website,
        company: user.company,
        social: user.social,
        preferences: user.preferences,
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

  @UseGuards(JwtGuard)
  @Patch('profile')
  async patchProfile(@Request() req, @Body() body: any) {
    const prisma = getPrisma();
    const userId = (req.user?.id).toString();
    const allowed = ['name','username','avatarUrl','bannerUrl','bio','location','website','company','social','preferences'];
    const data: any = {};
    for (const key of allowed) if (key in body) data[key] = body[key];
    // Hard limits / sanitization basic
    if (typeof data.bio === 'string' && data.bio.length > 1000) data.bio = data.bio.slice(0,1000);
    if (typeof data.username === 'string') data.username = data.username.trim().toLowerCase().slice(0,32);
    try {
      const updated = await prisma.user.update({ where: { id: userId }, data });
      return { success: true, id: updated.id };
    } catch (e) {
      return { success: false, error: 'update_failed' };
    }
  }

  @Get(':id')
  async getPublicProfile(@Param('id') id: string) {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        location: true,
        website: true,
        company: true,
      }
    }).catch(() => null);
    if (!user) return { statusCode: 404, message: 'Not found' } as any;
    return user;
  }
}


