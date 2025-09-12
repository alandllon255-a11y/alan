import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    // Fallback for dev: allow x-user-id when JWT is not provided
    if (!token) {
      const allowDevHeader = process.env.ALLOW_DEV_HEADER === 'true';
      const headerUserId = allowDevHeader ? request.headers['x-user-id'] : undefined;
      if (allowDevHeader && headerUserId) {
        request.user = { id: headerUserId.toString() };
        return true;
      }
      throw new UnauthorizedException('Missing Authorization token');
    }

    const secret = process.env.JWT_SECRET || 'devforum-secret';
    try {
      const payload = jwt.verify(token, secret) as { id?: string; sub?: string };
      const userId = payload.id || payload.sub;
      if (!userId) throw new UnauthorizedException('Invalid token payload');
      request.user = { id: userId };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

