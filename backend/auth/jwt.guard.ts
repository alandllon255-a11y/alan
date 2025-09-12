import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length)
      : undefined;

    const allowDevHeader = process.env.NODE_ENV !== 'production';
    const xUserId = request.headers['x-user-id'];

    if (token) {
      try {
        const secret = process.env.JWT_SECRET || 'devforum-secret';
        const decoded = jwt.verify(token, secret) as { id: string };
        request.user = { id: decoded.id };
        return true;
      } catch (err) {
        throw new UnauthorizedException('Token inválido');
      }
    }

    if (allowDevHeader && xUserId) {
      request.user = { id: xUserId.toString() };
      return true;
    }

    throw new UnauthorizedException('Autenticação necessária');
  }
}

