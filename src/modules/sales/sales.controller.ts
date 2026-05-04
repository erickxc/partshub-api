import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

class SaleItemDto {
  @IsString() productId: string;
  @IsNumber() @Min(1) @Type(() => Number) quantity: number;
  @IsNumber() @Min(0) @Type(() => Number) price: number;
}

class CreateSaleDto {
  @IsOptional() @IsString() customerId?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => SaleItemDto) items: SaleItemDto[];
  @IsOptional() @IsNumber() @Type(() => Number) discount?: number;
  @IsOptional() @IsString() notes?: string;
}

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private service: SalesService) {}

  @Get('dashboard')
  dashboard(@CurrentTenant() tenantId: string) {
    return this.service.getDashboard(tenantId);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateSaleDto) {
    return this.service.create(tenantId, dto.customerId ?? null, dto.items, dto.discount ?? 0, dto.notes ?? '');
  }
}
