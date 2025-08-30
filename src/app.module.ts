import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/common/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from './modules/common/common.module';
import { ProductModule } from './modules/product/product.module';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';
import { SettingsModule } from './modules/settings/settings.module';
import { HealthModule } from './modules/health/health.module';
import { ShopAddressModule } from './modules/shop-address/shop-address.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env`,
      isGlobal: true,
      cache: true,
    }),
    ProductModule,
    UserModule,
    CommonModule,
    CategoryModule,
    JwtModule.register({}),
    SettingsModule,
    HealthModule,
    ShopAddressModule,
  ],
})
export class AppModule {}
