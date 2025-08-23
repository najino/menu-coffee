import {
  IsString,
  IsHexColor,
  IsUrl,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsNumber,
  validateSync,
  IsEmpty,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

// Generic validation function for nested DTOs
function validateNestedDto<T extends object>(
  value: any,
  DtoClass: new () => T,
  fieldName: string,
): T {
  if (value && Object.keys(value).length > 0) {
    const data = typeof value === 'string' ? JSON.parse(value) : value;
    console.log(`data is : ${fieldName}`, data);
    const instance = plainToInstance(DtoClass, data);
    const errors = validateSync(instance);
    if (errors.length > 0) {
      throw new BadRequestException(
        `${fieldName} validation errors: ${errors
          .flatMap((error) => Object.values(error.constraints || ''))
          .join(', ')}`,
      );
    }
    console.log(`${fieldName} is:`, instance);
    return instance;
  }
  return {} as T;
}

// Map Location DTO
export class CreateMapLocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

// Hero Banner DTO
export class CreateHeroBannerDto {
  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  buttonText?: string;

  @IsOptional()
  @IsUrl()
  buttonLink?: string;
}

// Color Palette DTO
export class CreateColorPaletteDto {
  @IsHexColor()
  primaryColor: string;

  @IsHexColor()
  textColor: string;

  @IsOptional()
  @IsHexColor()
  backgroundColor?: string;

  @IsOptional()
  @IsHexColor()
  surfaceColor?: string;

  @IsOptional()
  @IsHexColor()
  borderColor?: string;

  @IsOptional()
  @IsHexColor()
  successColor?: string;

  @IsOptional()
  @IsHexColor()
  warningColor?: string;

  @IsOptional()
  @IsHexColor()
  errorColor?: string;
}

// Branding DTO
export class CreateBrandingDto {
  @IsOptional()
  siteLogo: string;

  @IsOptional()
  adminLogo: string;

  @IsOptional()
  @IsString()
  favicon?: string;

  @IsOptional()
  @IsString()
  logoAltText?: string;
}

// Contact Info DTO
export class CreateContactInfoDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  workingHours: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateMapLocationDto)
  mapLocation?: CreateMapLocationDto;
}

// Social Media DTO
export class CreateSocialMediaDto {
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @IsOptional()
  @IsUrl()
  telegram?: string;

  @IsOptional()
  @IsUrl()
  whatsapp?: string;

  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsUrl()
  twitter?: string;

  @IsOptional()
  @IsUrl()
  facebook?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}

// Main Create Settings DTO
export class CreateSettingsDto {
  @IsString()
  @IsNotEmpty()
  siteName: string;

  @IsOptional()
  @IsString()
  siteDescription?: string;

  @IsOptional()
  @IsString()
  siteTitle?: string;

  @Transform(({ value }) =>
    validateNestedDto(value, CreateColorPaletteDto, 'colorPalette'),
  )
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateColorPaletteDto)
  colorPalette: CreateColorPaletteDto;
  branding: CreateBrandingDto;
}
