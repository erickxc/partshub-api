import { Controller, Post, Get, Patch, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/tenant.decorator';

class CreateTenantDto {
  @IsString() name: string;
  @IsString() slug: string;
  @IsEmail() adminEmail: string;
  @IsString() @MinLength(6) adminPassword: string;
  @IsString() adminName: string;
  @IsOptional() @IsString() plan?: string;
}

class UpdateTenantDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() plan?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

function requireSuperadmin(user: any) {
  if (user.role !== 'superadmin') throw new ForbiddenException();
}

@Controller('tenants')
export class TenantsController {
  constructor(private service: TenantsService) {}

  @Post('register')
  register(@Body() dto: CreateTenantDto) {
    return this.service.create(dto.name, dto.slug, dto.adminEmail, dto.adminPassword, dto.adminName, dto.plan);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: any) {
    requireSuperadmin(user);
    return this.service.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto, @CurrentUser() user: any) {
    requireSuperadmin(user);
    return this.service.update(id, dto);
  }
}
