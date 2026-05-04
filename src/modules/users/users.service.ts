import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId, active: true },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(tenantId: string, data: { email: string; password: string; name: string; role: string }) {
    const exists = await this.prisma.user.findUnique({
      where: { email_tenantId: { email: data.email, tenantId } },
    });
    if (exists) throw new ConflictException('Email já cadastrado');

    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: await bcrypt.hash(data.password, 10),
        name: data.name,
        role: data.role,
        tenantId,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async update(tenantId: string, id: string, data: { name?: string; role?: string; active?: boolean }) {
    await this.findOne(tenantId, id);
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, active: true },
    });
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }
}
