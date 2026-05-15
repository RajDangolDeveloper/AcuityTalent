import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose'],
  });

  const allowedOrigins = process.env.FRONTEND_URLS?.split(',') || [
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.setGlobalPrefix('api', {
    exclude: ['/socket.io/(.*)'],
  });
  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const uploadsPath = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsPath));

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
