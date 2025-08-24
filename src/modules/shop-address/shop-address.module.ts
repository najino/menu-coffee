import { Module } from '@nestjs/common';
import { ShopAddressController } from './shop-address.controller';
import { ShopAddressService } from './shop-address.service';
import { ShopAddressRepository } from './repository/shop-address.repository';

@Module({
  controllers: [ShopAddressController],
  providers: [ShopAddressService, ShopAddressRepository],
  exports: [ShopAddressService],
})
export class ShopAddressModule {}
