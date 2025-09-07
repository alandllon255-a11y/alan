import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  use(req: Request & { user?: { id: string } }, _res: Response, next: NextFunction) {
    try {
      // Priority: JWT in Authorization: Bearer <token>
      let userId: string | undefined;
      if (typeof req.headers.authorization === 'string') {
        const auth = req.headers.authorization.trim();
        const parts = auth.split(' ');
        if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
          const token = parts[1];
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { id?: string; sub?: string };
            userId = (decoded.id || decoded.sub) as string | undefined;
          } catch {
            // ignore invalid token
          }
        }
      }

      // Fallback: explicit x-user-id header
      if (!userId) {
        userId = (req.headers['x-user-id'] as string | undefined)?.toString();
      }

      // Final fallback for development/demo
      if (!userId) {
        userId = '7';
      }

      req.user = { id: userId };
    } catch {
      req.user = { id: '7' };
    }
    next();
  }
}

