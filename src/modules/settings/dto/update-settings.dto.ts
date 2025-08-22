import {
  IsString,
  IsOptional,
  IsHexColor,
  IsUrl,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

// Map Location DTO
export class MapLocationDto {
  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}

// Hero Banner DTO
export class HeroBannerDto {
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
export class ColorPaletteDto {
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  textColor?: string;

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
export class BrandingDto {
  @IsOptional()
  @IsString()
  siteLogo?: string;

  @IsOptional()
  @IsString()
  adminLogo?: string;

  @IsOptional()
  @IsString()
  favicon?: string;

  @IsOptional()
  @IsString()
  logoAltText?: string;
}

// Contact Info DTO
export class ContactInfoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsString()
  workingHours?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MapLocationDto)
  mapLocation?: MapLocationDto;
}

// Social Media DTO
export class SocialMediaDto {
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

// Main Update Settings DTO
export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  siteDescription?: string;

  @IsOptional()
  @IsString()
  siteTitle?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => HeroBannerDto)
  heroBanner?: HeroBannerDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ColorPaletteDto)
  colorPalette?: ColorPaletteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BrandingDto)
  branding?: BrandingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo?: ContactInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto;
}
