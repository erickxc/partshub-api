import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, slug: string, adminEmail: string, adminPassword: string, adminName: string, plan = 'starter') {
    const exists = await this.prisma.tenant.findUnique({ where: { slug } });
    if (exists) throw new ConflictException('Slug já em uso');

    return this.prisma.tenant.create({
      data: {
        name,
        slug,
        plan,
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
  }

  findAll() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { users: true } } },
    });
  }

  async update(id: string, data: { name?: string; plan?: string; active?: boolean }) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    return this.prisma.tenant.update({ where: { id }, data });
  }
}
