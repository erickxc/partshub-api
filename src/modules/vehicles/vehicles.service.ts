import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string, search?: string) {
    return this.prisma.vehicle.findMany({
      where: {
        tenantId,
        active: true,
        ...(search && {
          OR: [
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: [{ brand: 'asc' }, { model: 'asc' }],
    });
  }

  async findOne(tenantId: string, id: string) {
    const v = await this.prisma.vehicle.findFirst({
      where: { id, tenantId },
      include: {
        productVehicles: { include: { product: { include: { stock: true } } } },
      },
    });
    if (!v) throw new NotFoundException('Veículo não encontrado');
    return v;
  }

  create(tenantId: string, data: any) {
    return this.prisma.vehicle.create({ data: { ...data, tenantId } });
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id);
    return this.prisma.vehicle.update({ where: { id }, data });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.vehicle.update({ where: { id }, data: { active: false } });
  }

  async linkProduct(tenantId: string, vehicleId: string, productId: string) {
    return this.prisma.productVehicle.upsert({
      where: { productId_vehicleId_tenantId: { productId, vehicleId, tenantId } },
      update: {},
      create: { productId, vehicleId, tenantId },
    });
  }
}
