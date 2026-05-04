import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/tenant.decorator';

class CreateTenantDto {
  @IsString() name: string;
  @IsString() slug: string;
  @IsEmail() adminEmail: string;
  @IsString() @MinLength(6) adminPassword: string;
  @IsString() adminName: string;
}

@Controller('tenants')
export class TenantsController {
  constructor(private service: TenantsService) {}

  @Post('register')
  register(@Body() dto: CreateTenantDto) {
    return this.service.create(dto.name, dto.slug, dto.adminEmail, dto.adminPassword, dto.adminName);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: any) {
    if (user.role !== 'superadmin') return { message: 'Forbidden' };
    return this.service.findAll();
  }
}
