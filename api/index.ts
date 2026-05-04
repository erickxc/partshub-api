import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import type { INestApplication } from '@nestjs/common';

let app: INestApplication;

async function getApp() {
  if (!app) {
    app = await NestFactory.create(AppModule, { logger: false });
    app.enableCors({ origin: '*' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
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
