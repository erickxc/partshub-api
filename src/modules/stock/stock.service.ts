import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.stock.findMany({
      where: { tenantId },
      include: { product: { select: { id: true, name: true, brand: true, internalCode: true, price: true } } },
      orderBy: { product: { name: 'asc' } },
    });
  }

  findLowStock(tenantId: string) {
    return this.prisma.stock.findMany({
      where: { tenantId, quantity: { lte: this.prisma.stock.fields.minQuantity } },
      include: { product: { select: { id: true, name: true, brand: true } } },
    });
  }

  async adjust(tenantId: string, productId: string, quantity: number, reason: string) {
    const stock = await this.prisma.stock.findFirst({ where: { productId, tenantId } });
    if (!stock) throw new BadRequestException('Estoque não encontrado');

    const newQty = stock.quantity + quantity;
    if (newQty < 0) throw new BadRequestException('Estoque insuficiente');

    await this.prisma.$transaction([
      this.prisma.stock.update({ where: { id: stock.id }, data: { quantity: newQty } }),
      this.prisma.stockMovement.create({
        data: {
          productId,
          tenantId,
          type: quantity > 0 ? 'in' : 'out',
          quantity: Math.abs(quantity),
          reason,
        },
      }),
    ]);

    return { productId, quantity: newQty };
  }

  getMovements(tenantId: string, productId?: string) {
    return this.prisma.stockMovement.findMany({
      where: { tenantId, ...(productId && { productId }) },
      include: { product: { select: { name: true, internalCode: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
