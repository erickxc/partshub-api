import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, slug: string, adminEmail: string, adminPassword: string, adminName: string) {
    const exists = await this.prisma.tenant.findUnique({ where: { slug } });
    if (exists) throw new ConflictException('Slug já em uso');

    const tenant = await this.prisma.tenant.create({
      data: {
        name,
        slug,
        users: {
          create: {
            email: adminEmail,
            passwordHash: await bcrypt.hash(adminPassword, 10),
            name: adminName,
            role: 'admin',
          },
        },
      },
    });

    return tenant;
  }

  findAll() {
    return this.prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
