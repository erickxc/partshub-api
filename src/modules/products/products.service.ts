import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, search?: string) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        active: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { internalCode: { contains: search, mode: 'insensitive' } },
            { manufacturerCode: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        stock: { select: { quantity: true, minQuantity: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        stock: true,
        productVehicles: { include: { vehicle: true } },
      },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async create(tenantId: string, data: any) {
    return this.prisma.product.create({
      data: {
        ...data,
        tenantId,
        stock: { create: { quantity: 0, minQuantity: data.minQuantity ?? 0, tenantId } },
      },
      include: { stock: true },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id);
    return this.prisma.product.update({
      where: { id },
      data: { name: data.name, brand: data.brand, internalCode: data.internalCode, manufacturerCode: data.manufacturerCode, price: data.price, cost: data.cost },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.product.update({ where: { id }, data: { active: false } });
  }
}
