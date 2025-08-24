import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { DiscountType } from '../entity/product.entity';

export class AddDiscountDto {
  @ApiProperty({
    description: 'Type of discount (flat or percentage)',
    enum: ['flat', 'percentage'],
    example: 'percentage',
  })
  @IsNotEmpty({ message: 'Discount type is required' })
  @IsEnum(['flat', 'percentage'], {
    message: 'Discount type must be either flat or percentage',
  })
  type: DiscountType;

  @ApiProperty({
    description: 'Discount value (amount for flat, percentage for percentage)',
    example: 15,
  })
  @IsNotEmpty({ message: 'Discount value is required' })
  @IsNumber({}, { message: 'Discount value must be a number' })
  @Min(0, { message: 'Discount value cannot be negative' })
  value: number;

  @ApiProperty({
    description: 'Whether the discount is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean = true;
}
