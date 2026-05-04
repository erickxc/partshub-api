import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PdvService } from './pdv.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

class ItemDto {
  @IsString() productId: string;
  @IsNumber() @Min(1) @Type(() => Number) quantity: number;
  @IsNumber() @Min(0) @Type(() => Number) price: number;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) discount?: number;
}

class PaymentDto {
  @IsString() method: string;
  @IsNumber() @Min(0) @Type(() => Number) amount: number;
}

class CreateSaleDto {
  @IsOptional() @IsString() customerId?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => ItemDto) items: ItemDto[];
  @IsArray() @ValidateNested({ each: true }) @Type(() => PaymentDto) payments: PaymentDto[];
  @IsOptional() @IsNumber() @Type(() => Number) discount?: number;
  @IsOptional() @IsString() notes?: string;
}

class CreateBudgetDto {
  @IsOptional() @IsString() customerId?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => ItemDto) items: ItemDto[];
  @IsOptional() @IsNumber() @Type(() => Number) discount?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsNumber() @Type(() => Number) validDays?: number;
}

class ConvertBudgetDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => PaymentDto) payments: PaymentDto[];
}

@Controller('pdv')
@UseGuards(JwtAuthGuard)
export class PdvController {
  constructor(private service: PdvService) {}

  // Sales
  @Post('sales')
  createSale(@CurrentTenant() tid: string, @Body() dto: CreateSaleDto) {
    return this.service.createSale(tid, dto.customerId ?? null, dto.items, dto.payments, dto.discount ?? 0, dto.notes ?? '');
  }

  @Get('sales')
  findSales(@CurrentTenant() tid: string) {
    return this.service.findSales(tid);
  }

  @Get('sales/:id')
  findOneSale(@CurrentTenant() tid: string, @Param('id') id: string) {
    return this.service.findOneSale(tid, id);
  }

  // Budgets
  @Post('budgets')
  createBudget(@CurrentTenant() tid: string, @Body() dto: CreateBudgetDto) {
    return this.service.createBudget(tid, dto.customerId ?? null, dto.items, dto.discount ?? 0, dto.notes ?? '', dto.validDays ?? 7);
  }

  @Get('budgets')
  findBudgets(@CurrentTenant() tid: string, @Query('status') status?: string) {
    return this.service.findBudgets(tid, status);
  }

  @Get('budgets/:id')
  findOneBudget(@CurrentTenant() tid: string, @Param('id') id: string) {
    return this.service.findOneBudget(tid, id);
  }

  @Patch('budgets/:id/status')
  updateStatus(@CurrentTenant() tid: string, @Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateBudgetStatus(tid, id, body.status);
  }

  @Post('budgets/:id/convert')
  convertToSale(@CurrentTenant() tid: string, @Param('id') id: string, @Body() dto: ConvertBudgetDto) {
    return this.service.convertBudgetToSale(tid, id, dto.payments);
  }

  // ─── CAIXA ───────────────────────────────────────────────────
  @Get('cash-register/current')
  getCurrent(@CurrentTenant() tid: string) {
    return this.service.getCurrentCashRegister(tid);
  }

  @Get('cash-register')
  listCash(@CurrentTenant() tid: string) {
    return this.service.listCashRegisters(tid);
  }

  @Post('cash-register/open')
  openCash(
    @CurrentTenant() tid: string,
    @Body() body: { openingBalance: number; notes?: string },
    @Param('userId') _u?: string,
  ) {
    // userId vem do JWT — mas para simplificar, usamos string no body
    return this.service.openCashRegister(tid, 'system', Number(body.openingBalance), body.notes);
  }

  @Post('cash-register/close')
  closeCash(
    @CurrentTenant() tid: string,
    @Body() body: { closingBalance: number; notes?: string },
  ) {
    return this.service.closeCashRegister(tid, 'system', Number(body.closingBalance), body.notes);
  }

  // ─── ESTORNO ────────────────────────────────────────────────
  @Post('sales/:id/cancel')
  cancelSale(@CurrentTenant() tid: string, @Param('id') id: string, @Body() body: { reason: string }) {
    return this.service.cancelSale(tid, id, body.reason);
  }
}
