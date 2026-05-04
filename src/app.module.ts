import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { StockModule } from './modules/stock/stock.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SalesModule } from './modules/sales/sales.module';
import { PdvModule } from './modules/pdv/pdv.module';
import { FipeModule } from './modules/fipe/fipe.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    ProductsModule,
    VehiclesModule,
    StockModule,
    CustomersModule,
    SalesModule,
    PdvModule,
    FipeModule,
  ],
})
export class AppModule {}
