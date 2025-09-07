import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

type Bucket = { ts: number[] };
const buckets: Record<string, Bucket> = {};

function now() { return Date.now(); }

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private readonly windowMs = 60_000, private readonly max = 60, private readonly key = 'global') {}

  use(req: Request, res: Response, next: NextFunction) {
    const ip = (req.ip || (req.headers['x-forwarded-for'] as string) || (req.socket && req.socket.remoteAddress) || 'unknown').toString();
    const bucketKey = `${this.key}:${ip}`;
    if (!buckets[bucketKey]) buckets[bucketKey] = { ts: [] };
    const arr = buckets[bucketKey].ts;
    const t = now();
    while (arr.length && t - arr[0] > this.windowMs) arr.shift();
    if (arr.length >= this.max) {
      const retryAfterMs = Math.max(0, this.windowMs - (t - arr[0]));
      res.setHeader('Retry-After', Math.ceil(retryAfterMs / 1000));
      res.status(429).json({ error: 'Too Many Requests', key: this.key, windowMs: this.windowMs, max: this.max, retryAfterMs });
      return;
    }
    arr.push(t);
    next();
  }
}

