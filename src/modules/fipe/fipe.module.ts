import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FipeController } from './fipe.controller';
import { FipeService } from './fipe.service';

@Module({
  imports: [HttpModule.register({ timeout: 10000, baseURL: 'https://parallelum.com.br/fipe/api/v1' })],
  controllers: [FipeController],
  providers: [FipeService],
})
export class FipeModule {}
