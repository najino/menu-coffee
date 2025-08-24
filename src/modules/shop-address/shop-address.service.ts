import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { CreateShopAddressDto } from './dtos/create-shop-address.dto';
import { UpdateShopAddressDto } from './dtos/update-shop-address.dto';
import { ShopAddress } from './entity/shop-address.entity';
import { ObjectId } from 'mongodb';
import { ShopAddressRepository } from './repository/shop-address.repository';

@Injectable()
export class ShopAddressService {
  private readonly logger = new Logger(ShopAddressService.name);

  constructor(private readonly shopAddressRepository: ShopAddressRepository) {}

  /**
   * Create a new shop address
   * @param createShopAddressDto - Shop address data
   * @returns Created shop address
   */
  async create(
    createShopAddressDto: CreateShopAddressDto,
  ): Promise<ShopAddress> {
    try {
      // Check if shop address already exists
      const existingAddress = await this.shopAddressRepository.findOne({});
      if (existingAddress) {
        throw new BadRequestException(
          'Shop address already exists. Use update instead.',
        );
      }

      const shopAddress: Omit<ShopAddress, '_id'> = {
        ...createShopAddressDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await this.shopAddressRepository.create(shopAddress);

      if (!result.acknowledged) {
        throw new InternalServerErrorException('Failed to create shop address');
      }

      const createdAddress = await this.shopAddressRepository.findOne({});
      if (!createdAddress) {
        throw new InternalServerErrorException(
          'Failed to retrieve created shop address',
        );
      }

      return createdAddress;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Failed to create shop address: ${error.message}`);
      throw new InternalServerErrorException('Failed to create shop address');
    }
  }

  /**
   * Get shop address
   * @returns Shop address
   */
  async findOne(): Promise<ShopAddress> {
    try {
      const shopAddress = await this.shopAddressRepository.findOne({});

      if (!shopAddress) {
        throw new NotFoundException('Shop address not found');
      }

      return shopAddress;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Failed to get shop address: ${error.message}`);
      throw new InternalServerErrorException('Failed to get shop address');
    }
  }

  /**
   * Update shop address (replace entire object)
   * @param updateShopAddressDto - Updated shop address data
   * @returns Updated shop address
   */
  async update(
    updateShopAddressDto: UpdateShopAddressDto,
  ): Promise<ShopAddress> {
    try {
      const existingAddress = await this.shopAddressRepository.findOne({});

      if (!existingAddress) {
        throw new NotFoundException('Shop address not found');
      }

      if (!existingAddress._id) {
        throw new InternalServerErrorException('Shop address ID not found');
      }
      console.log(updateShopAddressDto);

      // Create new shop address object with updated data
      const updatedShopAddress: Omit<ShopAddress, '_id'> = {
        phone: updateShopAddressDto.phone || existingAddress.phone,
        address: updateShopAddressDto.address || existingAddress.address,
        mapUrl: updateShopAddressDto.mapUrl || existingAddress.mapUrl,
        workingHours:
          updateShopAddressDto.workingHours || existingAddress.workingHours,
        createdAt: existingAddress.createdAt,
        updatedAt: new Date(),
      };

      const result = await this.shopAddressRepository.update(
        { _id: existingAddress._id },
        updatedShopAddress,
      );

      if (!result) {
        throw new InternalServerErrorException('Failed to update shop address');
      }

      const updatedAddress = await this.shopAddressRepository.findOne({});
      if (!updatedAddress) {
        throw new InternalServerErrorException(
          'Failed to retrieve updated shop address',
        );
      }

      return updatedAddress;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Failed to update shop address: ${error.message}`);
      throw new InternalServerErrorException('Failed to update shop address');
    }
  }

  /**
   * Check if shop address exists
   * @returns True if exists, false otherwise
   */
  async exists(): Promise<boolean> {
    try {
      const shopAddress = await this.shopAddressRepository.findOne({});
      return !!shopAddress;
    } catch (error) {
      this.logger.error(
        `Failed to check shop address existence: ${error.message}`,
      );
      return false;
    }
  }
}
