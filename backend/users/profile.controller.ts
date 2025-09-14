// @ts-nocheck
/* eslint-disable */
import { Controller, Get, Request, Post, UseInterceptors, UploadedFile, Patch, Param, Body, UseGuards, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { getPrisma } from '../prisma.js';
import { MediaService } from '../media/media.service.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';

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
          bannerUrl: true,
          headline: true,
          location: true,
          company: true,
          education: true,
          websiteUrl: true,
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
        banner_url: user.bannerUrl,
        headline: user.headline,
        location: user.location,
        company: user.company,
        education: user.education,
        website_url: user.websiteUrl,
        avatar_url: user.avatarUrl,
        github_url: user.githubUrl,
        linkedin_url: user.linkedinUrl,
        twitter_url: user.twitterUrl,
        portfolio_url: user.portfolioUrl,
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

  @Post('upload/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
      return cb(new BadRequestException('Tipo de arquivo inválido'), false);
    }
  }))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo de imagem não enviado');
    }
    const uploadResult = await this.mediaService.uploadImageFromBuffer(file.buffer, {
      folder: 'devforum/avatars',
      overwrite: true,
      resource_type: 'image'
    });
    return { url: uploadResult.secure_url };
  }

  @Post('upload/banner')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
      return cb(new BadRequestException('Tipo de arquivo inválido'), false);
    }
  }))
  async uploadBanner(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo de imagem não enviado');
    }
    const uploadResult = await this.mediaService.uploadImageFromBuffer(file.buffer, {
      folder: 'devforum/banners',
      overwrite: true,
      resource_type: 'image'
    });
    return { url: uploadResult.secure_url };
  }

  @Patch(':id/profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Param('id') id: string, @Body() body: any, @Request() req) {
    const authUserId = req.user?.id;
    if (!authUserId || authUserId !== id) {
      throw new ForbiddenException('Você só pode editar o seu próprio perfil');
    }

    const allowedFields = [
      'name', 'bio', 'avatarUrl', 'githubUrl', 'linkedinUrl', 'twitterUrl', 'portfolioUrl',
      'bannerUrl', 'headline', 'location', 'company', 'education', 'websiteUrl'
    ];
    const data: Record<string, any> = {};
    for (const key of allowedFields) {
      if (typeof body[key] !== 'undefined') {
        data[key] = body[key];
      }
    }
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nenhum campo válido para atualizar');
    }
    const prisma = getPrisma();
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, bio: true, avatarUrl: true, githubUrl: true, linkedinUrl: true, twitterUrl: true, portfolioUrl: true }
    });
    return updated;
  }
}


