import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] as string | undefined;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    if (!token) return false;
    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      return true;
    } catch {
      return false;
    }
  }
}

