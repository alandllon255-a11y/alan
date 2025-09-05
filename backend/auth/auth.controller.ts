import { Controller, Post, Body } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { getPrisma } from '../prisma.js';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: { id?: string; name?: string }) {
    const userId = (body?.id || '7').toString();
    const name = body?.name || 'Você';
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const token = jwt.sign({ id: userId, name }, secret, { expiresIn: '1h' });
    return { token, userId, name };
  }

  @Post('login-email')
  async loginEmail(@Body() body: { email: string; password: string }) {
    const prisma = getPrisma();
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    try {
      const user = await prisma.user.findUnique({ where: { email: body.email } });
      if (!user) {
        return { statusCode: 401, message: 'Credenciais inválidas' } as any;
      }
      // Comparação simples (seed usa texto puro). Em produção use bcrypt.
      if (user.password !== body.password) {
        return { statusCode: 401, message: 'Credenciais inválidas' } as any;
      }
      const token = jwt.sign({ id: user.id, name: user.name || user.email, email: user.email }, secret, { expiresIn: '1h' });
      return { token, userId: user.id, name: user.name || user.email, email: user.email };
    } catch (e) {
      // Fallback: ambiente sem DB ou erro, emitir token mock para desenvolvimento
      const token = jwt.sign({ id: '7', name: 'Você', email: body.email }, secret, { expiresIn: '1h' });
      return { token, userId: '7', name: 'Você', email: body.email, warning: 'DB indisponível, login mock emitido' };
    }
  }
}

