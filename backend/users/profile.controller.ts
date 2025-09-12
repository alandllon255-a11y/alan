// @ts-nocheck
/* eslint-disable */
import { Controller, Get, Patch, Post, Request, UseGuards, UploadedFile, UseInterceptors, Param, Body, ForbiddenException } from '@nestjs/common';
import { getPrisma } from '../prisma.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { MediaService } from '../media/media.service.js';

function rankTitleFromLevel(level: number): string {
  if (level < 5) return 'Iniciante';
  if (level < 15) return 'Júnior';
  if (level < 30) return 'Pleno';
  if (level < 50) return 'Sênior';
  return 'Arquiteto';
}

@Controller('users')
export class ProfileController {
  constructor(private readonly mediaService: MediaService) {}
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
          bio: true,
          avatarUrl: true,
          githubUrl: true,
          linkedinUrl: true,
          twitterUrl: true,
          portfolioUrl: true,
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
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        twitterUrl: user.twitterUrl,
        portfolioUrl: user.portfolioUrl,
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

  @UseGuards(JwtAuthGuard)
  @Post('upload/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!/^image\/(jpeg|png|webp|gif|jpg)$/.test(file.mimetype)) {
        return cb(new Error('Tipo de arquivo não suportado'), false);
      }
      cb(null, true);
    }
  }))
  async uploadAvatar(@UploadedFile() file: any) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    const result = await this.mediaService.uploadImage(file.buffer, file.originalname, {
      transformation: [{ width: 512, height: 512, crop: 'fill', gravity: 'face' }],
      folder: process.env.CLOUDINARY_FOLDER || 'devforum/avatars',
    });
    return { url: result.secure_url };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/profile')
  async updateProfile(@Param('id') id: string, @Body() body: any, @Request() req) {
    const authUserId = (req.user?.id || '').toString();
    if (!authUserId || authUserId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    const prisma = getPrisma();
    const data: any = {};
    if (typeof body.name !== 'undefined') data.name = body.name;
    if (typeof body.bio !== 'undefined') data.bio = body.bio;
    if (typeof body.avatarUrl !== 'undefined') data.avatarUrl = body.avatarUrl;
    if (typeof body.githubUrl !== 'undefined') data.githubUrl = body.githubUrl;
    if (typeof body.linkedinUrl !== 'undefined') data.linkedinUrl = body.linkedinUrl;
    if (typeof body.twitterUrl !== 'undefined') data.twitterUrl = body.twitterUrl;
    if (typeof body.portfolioUrl !== 'undefined') data.portfolioUrl = body.portfolioUrl;

    try {
      const updated = await prisma.user.update({
        where: { id },
        data,
        select: { id: true, name: true, bio: true, avatarUrl: true, githubUrl: true, linkedinUrl: true, twitterUrl: true, portfolioUrl: true },
      });
      return updated;
    } catch (e) {
      // Fallback para ambientes sem DB: retorna os dados que seriam atualizados
      return { id, name: data.name ?? null, bio: data.bio ?? null, avatarUrl: data.avatarUrl ?? null, githubUrl: data.githubUrl ?? null, linkedinUrl: data.linkedinUrl ?? null, twitterUrl: data.twitterUrl ?? null, portfolioUrl: data.portfolioUrl ?? null, warning: 'DB indisponível, alterando apenas em memória' };
    }
  }
}


