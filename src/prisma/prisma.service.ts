import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    const dbUrl = process.env.DATABASE_URL ?? 'MISSING';
    console.log('[Prisma] Connecting to:', dbUrl.substring(0, 50) + '...');
    await this.$connect();
    console.log('[Prisma] Connected OK');
  }
}
