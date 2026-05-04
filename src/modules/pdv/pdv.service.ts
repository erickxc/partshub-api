import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface ItemInput { productId: string; quantity: number; price: number; discount?: number }
interface PaymentInput { method: string; amount: number }

@Injectable()
export class PdvService {
  constructor(private prisma: PrismaService) {}

  // ─── VENDAS ──────────────────────────────────────────────────────────────

  async createSale(
    tenantId: string,
    customerId: string | null,
    items: ItemInput[],
    payments: PaymentInput[],
    discount: number,
    notes: string,
  ) {
    for (const item of items) {
      const stock = await this.prisma.stock.findFirst({ where: { productId: item.productId, tenantId } });
      if (!stock || stock.quantity < item.quantity) {
        const p = await this.prisma.product.findFirst({ where: { id: item.productId, tenantId } });
        throw new BadRequestException(`Estoque insuficiente: ${p?.name ?? item.productId}`);
      }
    }

    const subtotal = items.reduce((s, i) => s + i.quantity * (i.price - (i.discount ?? 0)), 0);
    const total = Math.max(0, subtotal - discount);

    const count = await this.prisma.sale.count({ where: { tenantId } });

    const sale = await this.prisma.$transaction(async (tx) => {
      const s = await tx.sale.create({
        data: {
          tenantId,
          number: count + 1,
          customerId: customerId ?? undefined,
          total,
          discount,
          notes,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
              discount: i.discount ?? 0,
              tenantId,
            })),
          },
          payments: {
            create: payments.map((p) => ({ method: p.method, amount: p.amount, tenantId })),
          },
        },
        include: {
          items: { include: { product: { select: { name: true, internalCode: true } } } },
          payments: true,
          customer: true,
        },
      });

      for (const item of items) {
        await tx.stock.updateMany({ where: { productId: item.productId, tenantId }, data: { quantity: { decrement: item.quantity } } });
        await tx.stockMovement.create({
          data: { productId: item.productId, tenantId, type: 'out', quantity: item.quantity, reason: `Venda #${s.number}`, saleId: s.id },
        });
      }

      return s;
    });

    return sale;
  }

  findSales(tenantId: string) {
    return this.prisma.sale.findMany({
      where: { tenantId },
      include: {
        customer: { select: { name: true } },
        items: { include: { product: { select: { name: true, internalCode: true } } } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOneSale(tenantId: string, id: string) {
    const s = await this.prisma.sale.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        items: { include: { product: { select: { id: true, name: true, brand: true, internalCode: true, unit: true } } } },
        payments: true,
      },
    });
    if (!s) throw new NotFoundException('Venda não encontrada');
    return s;
  }

  // ─── ORÇAMENTOS ──────────────────────────────────────────────────────────

  async createBudget(
    tenantId: string,
    customerId: string | null,
    items: ItemInput[],
    discount: number,
    notes: string,
    validDays: number,
  ) {
    const count = await this.prisma.budget.count({ where: { tenantId } });
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (validDays || 7));

    const subtotal = items.reduce((s, i) => s + i.quantity * (i.price - (i.discount ?? 0)), 0);
    const total = Math.max(0, subtotal - discount);

    return this.prisma.budget.create({
      data: {
        tenantId,
        number: count + 1,
        customerId: customerId ?? undefined,
        total,
        discount,
        notes,
        validUntil,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            discount: i.discount ?? 0,
            tenantId,
          })),
        },
      },
      include: {
        items: { include: { product: { select: { name: true, internalCode: true, unit: true } } } },
        customer: true,
      },
    });
  }

  findBudgets(tenantId: string, status?: string) {
    return this.prisma.budget.findMany({
      where: { tenantId, ...(status && { status }) },
      include: {
        customer: { select: { name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOneBudget(tenantId: string, id: string) {
    const b = await this.prisma.budget.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        items: { include: { product: { select: { id: true, name: true, brand: true, internalCode: true, unit: true, price: true } } } },
      },
    });
    if (!b) throw new NotFoundException('Orçamento não encontrado');
    return b;
  }

  async updateBudgetStatus(tenantId: string, id: string, status: string) {
    await this.findOneBudget(tenantId, id);
    return this.prisma.budget.update({ where: { id }, data: { status } });
  }

  // ─── CAIXA ───────────────────────────────────────────────────────────────

  async getCurrentCashRegister(tenantId: string) {
    return this.prisma.cashRegister.findFirst({
      where: { tenantId, status: 'open' },
      orderBy: { openedAt: 'desc' },
    });
  }

  async openCashRegister(tenantId: string, userId: string, openingBalance: number, notes?: string) {
    const open = await this.getCurrentCashRegister(tenantId);
    if (open) throw new BadRequestException('Já existe um caixa aberto');

    return this.prisma.cashRegister.create({
      data: {
        tenantId,
        status: 'open',
        openedAt: new Date(),
        openingBalance,
        expectedBalance: openingBalance,
        notes,
        openedById: userId,
      },
    });
  }

  async closeCashRegister(tenantId: string, userId: string, closingBalance: number, notes?: string) {
    const cur = await this.getCurrentCashRegister(tenantId);
    if (!cur) throw new BadRequestException('Nenhum caixa aberto');

    // calcular esperado: saldo inicial + total de vendas em dinheiro desde abertura
    const sales = await this.prisma.salePayment.aggregate({
      where: {
        tenantId,
        method: 'cash',
        sale: { createdAt: { gte: cur.openedAt! }, status: 'completed' },
      },
      _sum: { amount: true },
    });
    const cashSales = Number(sales._sum.amount ?? 0);
    const expected = Number(cur.openingBalance) + cashSales;
    const difference = closingBalance - expected;

    return this.prisma.cashRegister.update({
      where: { id: cur.id },
      data: {
        status: 'closed',
        closedAt: new Date(),
        closingBalance,
        expectedBalance: expected,
        difference,
        closedById: userId,
        notes: notes ?? cur.notes,
      },
    });
  }

  async listCashRegisters(tenantId: string) {
    return this.prisma.cashRegister.findMany({
      where: { tenantId },
      orderBy: { openedAt: 'desc' },
      take: 30,
    });
  }

  // ─── ESTORNO ────────────────────────────────────────────────────────────

  async cancelSale(tenantId: string, saleId: string, reason: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id: saleId, tenantId },
      include: { items: true },
    });
    if (!sale) throw new NotFoundException('Venda não encontrada');
    if (sale.status === 'cancelled') throw new BadRequestException('Venda já estornada');

    await this.prisma.$transaction(async (tx) => {
      // devolve estoque
      for (const item of sale.items) {
        await tx.stock.updateMany({
          where: { productId: item.productId, tenantId },
          data: { quantity: { increment: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            tenantId,
            type: 'in',
            quantity: item.quantity,
            reason: `Estorno venda #${sale.number}: ${reason}`,
            saleId: sale.id,
          },
        });
      }
      await tx.sale.update({
        where: { id: saleId },
        data: { status: 'cancelled', notes: `${sale.notes ?? ''}\n[ESTORNADA: ${reason}]`.trim() },
      });
    });

    return { ok: true };
  }

  async convertBudgetToSale(tenantId: string, budgetId: string, payments: PaymentInput[]) {
    const budget = await this.findOneBudget(tenantId, budgetId);

    if (budget.status === 'converted') throw new BadRequestException('Orçamento já convertido');

    const items = budget.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      price: Number(i.price),
      discount: Number(i.discount),
    }));

    const sale = await this.createSale(
      tenantId,
      budget.customerId ?? null,
      items,
      payments,
      Number(budget.discount),
      `Originado do Orçamento #${budget.number}`,
    );

    await this.prisma.budget.update({
      where: { id: budgetId },
      data: { status: 'converted', convertedSaleId: sale.id },
    });

    return sale;
  }
}
