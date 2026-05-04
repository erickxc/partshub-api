import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FipeService } from './fipe.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('fipe')
@UseGuards(JwtAuthGuard)
export class FipeController {
  constructor(private service: FipeService) {}

  @Get('marcas')
  getBrands(@Query('tipo') tipo: string = 'carros') {
    return this.service.getBrands(tipo);
  }

  @Get('marcas/:brandCode/modelos')
  getModels(@Param('brandCode') brandCode: string, @Query('tipo') tipo: string = 'carros') {
    return this.service.getModels(tipo, brandCode);
  }

  @Get('marcas/:brandCode/modelos/:modelCode/anos')
  getYears(
    @Param('brandCode') brandCode: string,
    @Param('modelCode') modelCode: string,
    @Query('tipo') tipo: string = 'carros',
  ) {
    return this.service.getYears(tipo, brandCode, modelCode);
  }

  @Get('marcas/:brandCode/modelos/:modelCode/anos/:yearCode/preco')
  getPrice(
    @Param('brandCode') brandCode: string,
    @Param('modelCode') modelCode: string,
    @Param('yearCode') yearCode: string,
    @Query('tipo') tipo: string = 'carros',
  ) {
    return this.service.getPrice(tipo, brandCode, modelCode, yearCode);
  }
}
