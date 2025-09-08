import { Redis } from 'ioredis';

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT || 6379),
      db: Number(process.env.REDIS_DB || 0),
      username: process.env.REDIS_USERNAME || undefined,
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
    });
    // Try connecting lazily; errors are handled by callers
    redisClient.connect().catch(() => {});
  }
  return redisClient;
}

