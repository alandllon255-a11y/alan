import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log']
  });
  app.setGlobalPrefix('api');
  const port = Number(process.env.BACKEND_PORT || 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Nest backend listening on http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to bootstrap Nest backend', err);
  process.exit(1);
});


