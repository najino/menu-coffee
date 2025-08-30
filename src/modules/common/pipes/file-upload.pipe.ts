import {
  HttpStatus,
  ParseFilePipe,
  ParseFilePipeBuilder,
} from '@nestjs/common';

/**
 * Global file upload pipe builder for image validation
 * @param isRequired - Whether the file is required
 * @param maxSize - Maximum file size in bytes (default: 5MB)
 * @param allowedTypes - Allowed file types regex (default: jpeg, png, jpg)
 * @returns ParseFilePipe with validation
 */
export function FileUploadPipeBuilder(
  isRequired: boolean = true,
  maxSize: number = 5 * 1024 * 1024, // 5MB default
  allowedTypes: RegExp = /^image\/(jpeg|png|jpg)$/,
): ParseFilePipe {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({ fileType: allowedTypes })
    .addMaxSizeValidator({
      maxSize,
      message: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      fileIsRequired: isRequired,
    });
}

/**
 * Specific pipe for hero banner images
 */
export function HeroBannerFilePipe(isRequired: boolean = true): ParseFilePipe {
  return FileUploadPipeBuilder(isRequired, 10 * 1024 * 1024); // 10MB for hero images
}

/**
 * Specific pipe for logo images
 */
export function LogoFilePipe(isRequired: boolean = true): ParseFilePipe {
  return FileUploadPipeBuilder(isRequired, 2 * 1024 * 1024); // 2MB for logos
}

/**
 * Specific pipe for favicon
 */
export function FaviconFilePipe(isRequired: boolean = true): ParseFilePipe {
  return FileUploadPipeBuilder(isRequired, 1 * 1024 * 1024); // 1MB for favicon
}
