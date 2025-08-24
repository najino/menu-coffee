import { PartialType } from '@nestjs/swagger';
import { CreateShopAddressDto } from './create-shop-address.dto';

export class UpdateShopAddressDto extends PartialType(CreateShopAddressDto) {}
