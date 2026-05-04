import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

class AdjustStockDto {
  @IsString() productId: string;
  @IsNumber() @Type(() => Number) quantity: number;
  @IsString() reason: string;
}

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private service: StockService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get('movements')
  getMovements(@CurrentTenant() tenantId: string, @Query('productId') productId?: string) {
    return this.service.getMovements(tenantId, productId);
  }

  @Post('adjust')
  adjust(@CurrentTenant() tenantId: string, @Body() dto: AdjustStockDto) {
    return this.service.adjust(tenantId, dto.productId, dto.quantity, dto.reason);
  }
}
