import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ShopAddressService } from './shop-address.service';
import { CreateShopAddressDto } from './dtos/create-shop-address.dto';
import { UpdateShopAddressDto } from './dtos/update-shop-address.dto';
import { ShopAddress } from './entity/shop-address.entity';
import { IsAuth } from '../common/decorator/auth.decorator';

@ApiTags('Shop Address')
@Controller('shop-address')
export class ShopAddressController {
  constructor(private readonly shopAddressService: ShopAddressService) {}

  /**
   * Create shop address
   * @param createShopAddressDto - Shop address data
   * @returns Created shop address
   */
  @Post()
  @IsAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create shop address',
    description: 'Create a new shop address (only one address allowed)',
  })
  @ApiResponse({
    status: 201,
    description: 'Shop address created successfully',
    type: Object,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        phone: '+98-21-12345678',
        address: 'تهران، خیابان ولیعصر، پلاک 123',
        mapUrl: 'https://maps.google.com/?q=35.7219,51.3347',
        workingHours:
          'شنبه تا چهارشنبه: 8 صبح تا 10 شب، پنجشنبه و جمعه: 9 صبح تا 11 شب',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Shop address already exists',
  })
  async create(
    @Body() createShopAddressDto: CreateShopAddressDto,
  ): Promise<ShopAddress> {
    return this.shopAddressService.create(createShopAddressDto);
  }

  /**
   * Get shop address
   * @returns Shop address
   */
  @Get()
  @ApiOperation({
    summary: 'Get shop address',
    description: 'Retrieve the shop address information',
  })
  @ApiResponse({
    status: 200,
    description: 'Shop address retrieved successfully',
    type: Object,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        phone: '+98-21-12345678',
        address: 'تهران، خیابان ولیعصر، پلاک 123',
        mapUrl: 'https://maps.google.com/?q=35.7219,51.3347',
        workingHours:
          'شنبه تا چهارشنبه: 8 صبح تا 10 شب، پنجشنبه و جمعه: 9 صبح تا 11 شب',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Shop address not found',
  })
  async findOne(): Promise<ShopAddress> {
    return this.shopAddressService.findOne();
  }

  /**
   * Update shop address (PUT - replace entire object)
   * @param updateShopAddressDto - Updated shop address data
   * @returns Updated shop address
   */
  @Put()
  @IsAuth()
  @ApiOperation({
    summary: 'Update shop address',
    description: 'Update the shop address (replaces entire object)',
  })
  @ApiResponse({
    status: 200,
    description: 'Shop address updated successfully',
    type: Object,
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        phone: '+98-21-87654321',
        address: 'اصفهان، خیابان چهارباغ، پلاک 456',
        mapUrl: 'https://maps.google.com/?q=32.6546,51.6680',
        workingHours:
          'شنبه تا چهارشنبه: 11 صبح تا 11 شب، پنجشنبه و جمعه: 12 ظهر تا 12 شب',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Shop address not found',
  })
  async update(
    @Body() updateShopAddressDto: UpdateShopAddressDto,
  ): Promise<ShopAddress> {
    return this.shopAddressService.update(updateShopAddressDto);
  }
}
