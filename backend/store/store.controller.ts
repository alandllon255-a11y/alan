import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { getPrisma } from '../prisma.js';
import { CurrencyService } from '../gamification/currency.service.js';

type StoreItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'theme' | 'frame' | 'boost';
  metadata?: Record<string, unknown>;
};

const STORE_ITEMS: StoreItem[] = [
  { id: 'theme_purple_dark', name: 'Tema Purple Dark', description: 'Tema exclusivo roxo escuro', cost: 500, type: 'theme' },
  { id: 'frame_gold', name: 'Moldura Dourada', description: 'Moldura dourada para o perfil', cost: 1000, type: 'frame' },
  { id: 'boost_xp_2x_1h', name: 'Boost XP 2x (1h)', description: 'Dobre o XP por 1 hora', cost: 300, type: 'boost' },
  { id: 'highlight_post', name: 'Destacar Post (24h)', description: 'Destaque um post por 24 horas', cost: 200, type: 'boost' },
];

@Controller('store')
export class StoreController {
  private readonly currency = new CurrencyService();

  @Get('items')
  async listItems() {
    return { success: true, items: STORE_ITEMS };
  }

  @Post('purchase')
  async purchase(@Request() req: any, @Body() body: { itemId: string }) {
    const userId = (req.user?.id || '7').toString();
    const item = STORE_ITEMS.find((i) => i.id === body?.itemId);
    if (!item) return { success: false, error: 'Item não encontrado' };
    const prisma = getPrisma();
    // Check balance
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { currencyBalance: true } });
    if (!user) return { success: false, error: 'Usuário não encontrado' };
    if (user.currencyBalance < item.cost) return { success: false, error: 'Saldo insuficiente' };

    // Debit (no gamification action type here)
    await this.currency.debit(userId, item.cost);
    await prisma.currencyTransaction.create({
      data: {
        userId,
        type: 'PURCHASE',
        amount: item.cost,
        metadata: { itemId: item.id, name: item.name } as any,
      },
    });

    // Here we could persist inventory/effects; for demo, just return success
    return { success: true, item: { id: item.id, name: item.name } };
  }
}

