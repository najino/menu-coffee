import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateShopAddressDto {
  @ApiProperty({
    description: 'Phone number of the shop',
    example: '+98-21-12345678',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phone: string;

  @ApiProperty({
    description: 'Physical address of the shop',
    example: 'تهران، خیابان ولیعصر، پلاک 123',
  })
  @IsNotEmpty({ message: 'Address is required' })
  @IsString({ message: 'Address must be a string' })
  address: string;

  @ApiProperty({
    description: 'Google Maps URL of the shop location',
    example: 'https://maps.google.com/?q=35.7219,51.3347',
  })
  @IsNotEmpty({ message: 'Map URL is required' })
  @IsUrl({}, { message: 'Map URL must be a valid URL' })
  mapUrl: string;

  @ApiProperty({
    description: 'Working hours of the shop',
    example: 'شنبه تا چهارشنبه: 8 صبح تا 10 شب، پنجشنبه و جمعه: 9 صبح تا 11 شب',
  })
  @IsNotEmpty({ message: 'Working hours are required' })
  @IsString({ message: 'Working hours must be a string' })
  workingHours: string;
}
