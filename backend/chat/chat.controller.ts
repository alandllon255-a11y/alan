import { Controller, Get, Post, Body, Query, Request, UseGuards } from '@nestjs/common';
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
}

