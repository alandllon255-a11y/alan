import { Injectable } from '@nestjs/common';
import { getPrisma } from '../prisma.js';

function orderPair(userIdA: string, userIdB: string): { userAId: string; userBId: string } {
  return userIdA <= userIdB
    ? { userAId: userIdA, userBId: userIdB }
    : { userAId: userIdB, userBId: userIdA };
}

@Injectable()
export class ChatService {
  async getOrCreateConversation(userId: string, partnerId: string) {
    const prisma = getPrisma();
    const { userAId, userBId } = orderPair(userId, partnerId);
    const conv = await prisma.conversation.upsert({
      where: {
        userAId_userBId: {
          userAId,
          userBId,
        },
      },
      update: {},
      create: { userAId, userBId },
    });
    return conv;
  }

  async createMessage(senderId: string, receiverId: string, content: string) {
    const prisma = getPrisma();
    const conversation = await this.getOrCreateConversation(senderId, receiverId);
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId,
        content,
      },
    });
    // Update conversation last message timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: message.timestamp },
    });
    return message;
  }

  async getMessages(currentUserId: string, partnerId: string, limit = 50, before?: string) {
    const prisma = getPrisma();
    const { userAId, userBId } = orderPair(currentUserId, partnerId);
    const conversation = await prisma.conversation.findFirst({
      where: { userAId, userBId },
    });
    if (!conversation) return [];
    const where: any = { conversationId: conversation.id };
    if (before) where.timestamp = { lt: new Date(before) };
    const messages = await prisma.message.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: Math.min(Math.max(limit, 1), 200),
    });
    return messages.reverse();
  }
}

