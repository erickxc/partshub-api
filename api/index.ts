import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import type { INestApplication } from '@nestjs/common';

let app: INestApplication;

async function getApp() {
  if (!app) {
    const dbUrl = process.env.DATABASE_URL ?? 'MISSING';
    console.log('DB_URL_PREFIX:', dbUrl.substring(0, 30), '| length:', dbUrl.length);
    app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
    app.enableCors({ origin: '*' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
    console.log('NestJS initialized OK');
  }
  return app;
}

export default async function handler(req: any, res: any) {
  try {
    const nestApp = await getApp();
    const expressApp = nestApp.getHttpAdapter().getInstance();
    return expressApp(req, res);
  } catch (err: any) {
    console.error('Handler error:', err?.message, err?.stack);
    res.status(500).json({ error: err?.message ?? 'Unknown error', stack: err?.stack });
  }
}
