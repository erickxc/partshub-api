import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import type { INestApplication } from '@nestjs/common';

let app: INestApplication;

async function getApp() {
  if (!app) {
    app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
    app.enableCors({ origin: '*' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  if (req.url === '/api/debug-env') {
    const dbUrl = process.env.DATABASE_URL ?? 'MISSING';
    return res.end(JSON.stringify({
      db: dbUrl.substring(0, 50),
      dbLen: dbUrl.length,
      node: process.env.NODE_ENV,
      jwt: !!process.env.JWT_SECRET,
    }));
  }
  if (req.url === '/api/debug-init') {
    try {
      await getApp();
      return res.end(JSON.stringify({ ok: true }));
    } catch (err: any) {
      return res.end(JSON.stringify({ error: err?.message, stack: err?.stack?.substring(0, 500) }));
    }
  }
  try {
    const nestApp = await getApp();
    const expressApp = nestApp.getHttpAdapter().getInstance();
    return expressApp(req, res);
  } catch (err: any) {
    console.error('Handler error:', err?.message, err?.stack);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err?.message ?? 'Unknown error' }));
  }
}
