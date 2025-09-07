import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  use(req: Request & { user?: { id: string } }, _res: Response, next: NextFunction) {
    try {
      // Priority: explicit x-user-id header
      let userId = (req.headers['x-user-id'] as string | undefined)?.toString();

      // Fallback: Authorization: Bearer <userId> (dev convenience, no JWT verification here)
      if (!userId && typeof req.headers.authorization === 'string') {
        const auth = req.headers.authorization.trim();
        const parts = auth.split(' ');
        if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
          userId = parts[1];
        }
      }

      // Final fallback for development/demo
      if (!userId) {
        userId = '7';
      }

      req.user = { id: userId };
    } catch {
      // On any parsing issue, still set a safe default for dev
      req.user = { id: '7' };
    }
    next();
  }
}

