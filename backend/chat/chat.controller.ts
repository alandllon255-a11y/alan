import { Controller, Get, Post, Body, Query, Request, UseGuards, Patch } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { JwtGuard } from '../auth/jwt.guard.js';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @UseGuards(JwtGuard)
  @Get('messages')
  async listMessages(
    @Request() req,
    @Query('partnerId') partnerId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    const currentUserId = (req.user?.id || req.headers['x-user-id'] || '7').toString();
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.chat.getMessages(currentUserId, partnerId, parsedLimit, before);
  }

  @UseGuards(JwtGuard)
  @Post('messages')
  async sendMessage(
    @Request() req,
    @Body() body: { receiverId: string; content: string },
  ) {
    const currentUserId = (req.user?.id || req.headers['x-user-id'] || '7').toString();
    const { receiverId, content } = body;
    const created = await this.chat.createMessage(currentUserId, receiverId, content);
    return { success: true, message: created };
  }

  @Patch('messages/read')
  async markRead(
    @Request() req,
    @Body() body: { messageId: string }
  ) {
    const internalKey = (req.headers['x-internal-key'] || '').toString();
    const expectedKey = (process.env.INTERNAL_API_KEY || '').toString();
    if (!internalKey || internalKey !== expectedKey) {
      // Require JWT if not internal
      const auth = req.headers['authorization'] as string | undefined;
      if (!auth?.startsWith('Bearer ')) return { statusCode: 401, message: 'Unauthorized' } as any;
      try { require('jsonwebtoken').verify(auth.slice(7), process.env.JWT_SECRET || 'your-super-secret-jwt-key'); } catch { return { statusCode: 401, message: 'Unauthorized' } as any; }
    }
    const prisma = (await import('../prisma.js')).getPrisma();
    const msg = await prisma.message.update({ where: { id: body.messageId }, data: { read: true } }).catch(() => null);
    return { success: !!msg };
  }

  @UseGuards(JwtGuard)
  @Get('unread-counts')
  async unreadCounts(
    @Request() req,
  ) {
    const currentUserId = (req.user?.id || req.headers['x-user-id'] || '7').toString();
    const prisma = (await import('../prisma.js')).getPrisma();
    const rows = await prisma.message.groupBy({
      by: ['senderId'],
      where: { receiverId: currentUserId, read: false },
      _count: { _all: true }
    });
    const map = Object.fromEntries(rows.map(r => [r.senderId, r._count._all]));
    return map;
  }

  @Post('typing')
  async typing(
    @Request() req,
    @Body() body: { partnerId: string; isTyping: boolean; userId?: string }
  ) {
    const internalKey = (req.headers['x-internal-key'] || '').toString();
    const expectedKey = (process.env.INTERNAL_API_KEY || '').toString();
    if (!internalKey || internalKey !== expectedKey) {
      return { statusCode: 401, message: 'Unauthorized' } as any;
    }
    // Aqui apenas confirmamos o recebimento; emissão ao cliente já é feita pelo chat server
    return { success: true };
  }
}

