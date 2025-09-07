import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { getPrisma } from '../prisma.js';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

function signTokens(userId: string) {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId, type: 'refresh' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() body: LoginDto) {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    // Demo: senha não hash, apenas exemplo (em produção use bcrypt)
    if (!user || user.password !== body.password) {
      return { success: false, error: 'Credenciais inválidas' };
    }
    const { accessToken, refreshToken } = signTokens(user.id);
    return { success: true, accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } };
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshDto) {
    try {
      const decoded = jwt.verify(body.refreshToken, process.env.JWT_SECRET || 'dev-secret') as { id?: string; type?: string };
      if (decoded.type !== 'refresh' || !decoded.id) {
        return { success: false, error: 'Token inválido' };
      }
      const { accessToken, refreshToken } = signTokens(decoded.id);
      return { success: true, accessToken, refreshToken };
    } catch {
      return { success: false, error: 'Token inválido' };
    }
  }

  @Get('me')
  async me(@Request() req: any) {
    const userId = (req.user?.id || '').toString();
    if (!userId) return { id: null };
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true } }).catch(() => null);
    return user || { id: userId };
  }
}

