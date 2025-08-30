import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'name is required.' })
  @IsString({ message: 'name must be string.' })
  @ApiProperty()
  name: string;

  @IsNumberString()
  @IsNotEmpty({ message: 'price cannot be empty.' })
  @ApiProperty({
    description: 'Price Of Product With (Toman)',
    example: '120000',
  })
  price: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray({ message: 'please enter array of string in models.' })
  @IsString({ each: true, message: 'models must be array of string.' })
  @ApiProperty({
    type: [String],
    required: false,
    description: 'Array of names',
  })
  models: string[];

  @IsNotEmpty({ message: 'description cannot be empty.' })
  @IsString({ message: 'typeof description must be string' })
  @ApiProperty()
  description: string;

  @IsNotEmpty({ message: 'status cannot be empty' })
  @IsString({ message: 'status must be string.' })
  @IsIn(['1', '0'], { message: 'status must be 0 or 1.' })
  @ApiProperty({
    type: 'string',
    description: 'the product is exist or not. must be 0 or 1',
    examples: ['1', '0'],
  })
  status: string;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: string
}
