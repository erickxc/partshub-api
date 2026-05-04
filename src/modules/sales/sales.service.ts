import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface SaleItemInput {
  productId: string;
  quantity: number;
  price: number;
}

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, customerId: string | null, items: SaleItemInput[], discount: number, notes: string) {
    for (const item of items) {
      const stock = await this.prisma.stock.findFirst({ where: { productId: item.productId, tenantId } });
      if (!stock || stock.quantity < item.quantity) {
        const product = await this.prisma.product.findFirst({ where: { id: item.productId, tenantId } });
        throw new BadRequestException(`Estoque insuficiente para: ${product?.name ?? item.productId}`);
      }
    }

    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    const total = Math.max(0, subtotal - discount);

    const sale = await this.prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          tenantId,
          customerId: customerId ?? undefined,
          total,
          discount,
          notes,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
              tenantId,
            })),
          },
        },
        include: { items: true, customer: true },
      });

      for (const item of items) {
        await tx.stock.updateMany({
          where: { productId: item.productId, tenantId },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            tenantId,
            type: 'out',
            quantity: item.quantity,
            reason: `Venda #${newSale.id.slice(0, 8)}`,
            saleId: newSale.id,
          },
        });
      }

      return newSale;
    });

    return sale;
  }

  findAll(tenantId: string) {
    return this.prisma.sale.findMany({
      where: { tenantId },
      include: {
        customer: { select: { name: true } },
        items: { include: { product: { select: { name: true, internalCode: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findOne(tenantId: string, id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        items: { include: { product: { select: { id: true, name: true, brand: true, internalCode: true } } } },
      },
    });
    if (!sale) throw new NotFoundException('Venda não encontrada');
    return sale;
  }

  async getDashboard(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSalesToday, totalSalesMonth, lowStock, recentSales] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { tenantId, createdAt: { gte: today } },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.sale.aggregate({
        where: { tenantId, createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.stock.count({
        where: { tenantId, quantity: { lte: 5 } },
      }),
      this.prisma.sale.findMany({
        where: { tenantId },
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      today: { total: totalSalesToday._sum.total ?? 0, count: totalSalesToday._count },
      month: { total: totalSalesMonth._sum.total ?? 0, count: totalSalesMonth._count },
      lowStockCount: lowStock,
      recentSales,
    };
  }
}
