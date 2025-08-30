import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SiteSettings } from './entity/setting.entity';
import { extname, join } from 'path';
import { writeFileSync, existsSync, rmSync } from 'fs';
import * as sharp from 'sharp';
import { ObjectId } from 'mongodb';

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  private logger = new Logger(SettingsService.name);

  /**
   * Generate unique filename for uploaded image
   * @param file - Uploaded file object
   * @param type - Type of image (hero, logo, favicon)
   * @returns Object containing full path and URL path
   */
  private generateFileName(
    file: Express.Multer.File,
    type: string,
  ): { fullPath: string; urlPath: string } {
    const fileExtension = extname(file.originalname);
    const uniqueFileName = `${type}-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const fullPath = join(
      process.cwd(),
      'public',
      'site',
      `${uniqueFileName}${fileExtension}`,
    );
    const urlPath = `/public/site/${uniqueFileName}${fileExtension}`;

    return { fullPath, urlPath };
  }

  /**
   * Save image file to local storage using writeFileSync
   * @param fileBuffer - Image buffer
   * @param filePath - Full path where to save the file
   */
  private saveImageFile(fileBuffer: Buffer, filePath: string): void {
    try {
      writeFileSync(filePath, fileBuffer);
    } catch (error) {
      this.logger.error(`Failed to save image: ${error.message}`);
      throw new BadRequestException('Error saving image file');
    }
  }

  /**
   * Remove image file from local storage
   * @param imagePath - Relative path of the image to remove
   */
  private removeImageFile(imagePath: string): void {
    if (!imagePath) return;

    const fullPath = join(process.cwd(), imagePath);

    if (existsSync(fullPath)) {
      try {
        rmSync(fullPath);
        this.logger.log(`Image removed: ${imagePath}`);
      } catch (error) {
        this.logger.error(`Failed to remove image: ${error.message}`);
      }
    }
  }

  /**
   * Process and compress image based on type
   * @param imageBuffer - Original image buffer
   * @param type - Type of image (hero, logo, favicon)
   * @returns Processed image buffer
   */
  private async processImage(
    imageBuffer: Buffer,
    type: string,
  ): Promise<Buffer> {
    try {
      switch (type) {
        case 'hero':
          // Hero banner: resize to 1200x600, high quality
          return sharp(imageBuffer)
            .resize(1200, 600, { fit: 'cover' })
            .jpeg({ quality: 90 })
            .toBuffer();

        case 'logo':
          // Logo: resize to 200x200, maintain aspect ratio
          return sharp(imageBuffer)
            .resize(200, 200, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .png()
            .toBuffer();

        case 'favicon':
          // Favicon: resize to 32x32, ICO format
          return sharp(imageBuffer)
            .resize(32, 32, { fit: 'contain' })
            .png()
            .toBuffer();

        default:
          // Default: resize to 800x600, medium quality
          return sharp(imageBuffer)
            .resize(800, 600, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toBuffer();
      }
    } catch (error) {
      this.logger.error(`Image processing error: ${error.message}`);
      throw new BadRequestException('Error processing image');
    }
  }
  /**
   * Process site logo image for update
   * @param file - Uploaded site logo file
   * @param currentSettings - Current settings to get old image path
   * @param updateSettingsDto - Settings DTO to update
   */
  private async processSiteLogoImageForUpdate(
    file: Express.Multer.File,
    currentSettings: SiteSettings,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<void> {
    // Remove old site logo
    this.removeImageFile(currentSettings.branding.siteLogo);

    // Process and save new site logo
    const processedImage = await this.processImage(file.buffer, 'logo');
    const { fullPath, urlPath } = this.generateFileName(file, 'logo');
    this.saveImageFile(processedImage, fullPath);

    updateSettingsDto.branding.siteLogo = urlPath;
  }

  /**
   * Process admin logo image for update
   * @param file - Uploaded admin logo file
   * @param currentSettings - Current settings to get old image path
   * @param updateSettingsDto - Settings DTO to update
   */ private async processAdminLogoImageForUpdate(
    file: Express.Multer.File,
    currentSettings: SiteSettings,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<void> {
    // Remove old admin logo
    this.removeImageFile(currentSettings.branding.adminLogo);

    // Process and save new admin logo
    const processedImage = await this.processImage(file.buffer, 'logo');
    const { fullPath, urlPath } = this.generateFileName(file, 'admin-logo');
    this.saveImageFile(processedImage, fullPath);

    updateSettingsDto.branding.adminLogo = urlPath;
  }

  /**
   * Process favicon image for update
   * @param file - Uploaded favicon file
   * @param currentSettings - Current settings to get old image path
   * @param updateSettingsDto - Settings DTO to update
   */
  private async processFaviconImageForUpdate(
    file: Express.Multer.File,
    currentSettings: SiteSettings,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<void> {
    // Remove old favicon
    if (currentSettings.branding.favicon) {
      this.removeImageFile(currentSettings.branding.favicon);
    }

    // Process and save new favicon
    const processedImage = await this.processImage(file.buffer, 'favicon');
    const { fullPath, urlPath } = this.generateFileName(file, 'favicon');
    this.saveImageFile(processedImage, fullPath);

    updateSettingsDto.branding.favicon = urlPath;
  }

  /**
   * Process all uploaded files for update
   * @param files - Uploaded files object
   * @param currentSettings - Current settings to get old image paths
   * @param updateSettingsDto - Settings DTO to update
   */
  private async processUploadedFilesForUpdate(
    files: {
      siteLogo?: Express.Multer.File;
      adminLogo?: Express.Multer.File;
      favicon?: Express.Multer.File;
    },
    currentSettings: SiteSettings,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<void> {
    const fileProcessingTasks: Promise<void>[] = [];

    if (files.siteLogo) {
      fileProcessingTasks.push(
        this.processSiteLogoImageForUpdate(
          files.siteLogo,
          currentSettings,
          updateSettingsDto,
        ),
      );
    }

    if (files.adminLogo) {
      fileProcessingTasks.push(
        this.processAdminLogoImageForUpdate(
          files.adminLogo,
          currentSettings,
          updateSettingsDto,
        ),
      );
    }

    if (files.favicon) {
      fileProcessingTasks.push(
        this.processFaviconImageForUpdate(
          files.favicon,
          currentSettings,
          updateSettingsDto,
        ),
      );
    }

    // Process all files concurrently for better performance
    if (fileProcessingTasks.length > 0) {
      await Promise.all(fileProcessingTasks);
    }
  }

  /**
   * Update settings in database and return result
   * @param currentSettings - Current settings with ID
   * @param updateSettingsDto - Settings data to update
   * @returns Updated settings
   */
  private async updateSettingsInDatabase(
    currentSettings: SiteSettings,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<SiteSettings> {
    if (!currentSettings._id) {
      throw new InternalServerErrorException('Settings ID not found');
    }

    const result = await this.settingsRepository.update(
      { _id: currentSettings._id },
      updateSettingsDto as Partial<SiteSettings>,
    );

    if (!result) {
      throw new InternalServerErrorException('Failed to update site settings');
    }

    const updatedSettings = await this.settingsRepository.findActive();
    if (!updatedSettings) {
      throw new InternalServerErrorException(
        'Failed to retrieve updated settings',
      );
    }

    return updatedSettings;
  }

  /**
   * Update site settings
   * @param updateSettingsDto - Settings data to update
   * @param files - Optional uploaded files
   * @returns Updated settings
   */
  async updateSettings(
    updateSettingsDto: UpdateSettingsDto,
    files?: {
      siteLogo?: Express.Multer.File;
      adminLogo?: Express.Multer.File;
      favicon?: Express.Multer.File;
    },
  ): Promise<SiteSettings> {
    try {
      const currentSettings = await this.getCurrentSettings();

      // Process uploaded files if any
      if (files) {
        await this.processUploadedFilesForUpdate(
          files,
          currentSettings,
          updateSettingsDto,
        );
      }

      // Update and return settings
      return await this.updateSettingsInDatabase(
        currentSettings,
        updateSettingsDto,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Update settings error: ${error.message}`);
      throw new InternalServerErrorException('Failed to update site settings');
    }
  }

  /**
   * Get public site data (without sensitive info)
   * @returns Public site data
   */
  async getPublicSiteData(): Promise<Partial<SiteSettings>> {
    try {
      const settings = await this.getCurrentSettings();

      return {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        siteTitle: settings.siteTitle,
        colorPalette: settings.colorPalette,
        branding: {
          siteLogo: settings.branding.siteLogo,
          adminLogo: settings.branding.adminLogo,
          favicon: settings.branding.favicon,
          logoAltText: settings.branding.logoAltText,
        },
        contactInfo: settings.contactInfo,
        socialMedia: settings.socialMedia,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Get public site data error: ${error.message}`);
      throw new InternalServerErrorException('Failed to get public site data');
    }
  }

  private getColor(color: string): string {
    return color.charAt(0) === '#' ? color : `#${color}`;
  }

  /**
   * Get CSS variables for frontend theme
   * @returns CSS string with color variables
   */
  async getThemeCSS(): Promise<string> {
    try {
      const settings = await this.getCurrentSettings();

      return `
        :root {
          --primary-color: ${this.getColor(settings.colorPalette.primaryColor)};
          --text-color: ${this.getColor(settings.colorPalette.textColor)};
          --background-color: ${this.getColor(settings.colorPalette.backgroundColor || '#FFFFFF')};
          --surface-color: ${this.getColor(settings.colorPalette.surfaceColor || '#F9FAFB')};
          --border-color: ${this.getColor(settings.colorPalette.borderColor || '#E5E7EB')};
          --success-color: ${this.getColor(settings.colorPalette.successColor || '#10B981')};
          --warning-color: ${this.getColor(settings.colorPalette.warningColor || '#F59E0B')};
          --error-color: ${this.getColor(settings.colorPalette.errorColor || '#EF4444')};
        }
      `;
    } catch (error) {
      this.logger.error(`Get theme CSS error: ${error.message}`);
      throw new InternalServerErrorException('Failed to get theme CSS');
    }
  }

  /**
   * Delete site settings
   * @param id - Settings ID
   * @returns Deletion result
   */
  async deleteSettings(id: string): Promise<boolean> {
    try {
      const settings = await this.settingsRepository.findOneById(id);
      if (!settings) {
        throw new NotFoundException('Site settings not found');
      }

      // Remove all associated images
      this.removeImageFile(settings.branding.siteLogo);
      this.removeImageFile(settings.branding.adminLogo);
      if (settings.branding.favicon) {
        this.removeImageFile(settings.branding.favicon);
      }

      // Delete from database
      const result = await this.settingsRepository.deleteById(id);
      if (!result)
        throw new NotFoundException('Failed to delete site settings');

      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Delete settings error: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete site settings');
    }
  }

  /**
   * Validate that settings don't already exist
   */
  private async validateSettingsNotExists(): Promise<void> {
    const existingSettings = await this.settingsRepository.exists();
    if (existingSettings) {
      throw new ConflictException(
        'Site settings already exist. Use update instead.',
      );
    }
  }

  /**
   * Create settings in database and return result
   * @param createSettingsDto - Settings data to create
   * @returns Created settings
   */
  private async createSettingsInDatabase(
    createSettingsDto: CreateSettingsDto,
  ): Promise<SiteSettings> {
    const result = await this.settingsRepository.create(
      createSettingsDto as SiteSettings,
    );

    if (!result.acknowledged) {
      throw new InternalServerErrorException('Failed to create site settings');
    }

    const createdSettings = await this.settingsRepository.findActive();
    if (!createdSettings) {
      throw new InternalServerErrorException(
        'Failed to retrieve created settings',
      );
    }

    return createdSettings as any;
  }

  /**
   * Process site logo image
   * @param file - Uploaded site logo file
   * @param createSettingsDto - Settings DTO to update
   */
  private async processSiteLogoImage(
    file: Express.Multer.File,
    createSettingsDto: CreateSettingsDto,
  ): Promise<void> {
    const processedImage = await this.processImage(file.buffer, 'logo');
    const { fullPath, urlPath } = this.generateFileName(file, 'logo');

    this.saveImageFile(processedImage, fullPath);
    createSettingsDto.branding.siteLogo = urlPath;
  }

  /**
   * Process admin logo image
   * @param file - Uploaded admin logo file
   * @param createSettingsDto - Settings DTO to update
   */
  private async processAdminLogoImage(
    file: Express.Multer.File,
    createSettingsDto: CreateSettingsDto,
  ): Promise<void> {
    const processedImage = await this.processImage(file.buffer, 'logo');
    const { fullPath, urlPath } = this.generateFileName(file, 'admin-logo');

    this.saveImageFile(processedImage, fullPath);
    createSettingsDto.branding.adminLogo = urlPath;
  }

  /**
   * Process favicon image
   * @param file - Uploaded favicon file
   * @param createSettingsDto - Settings DTO to update
   */
  private async processFaviconImage(
    file: Express.Multer.File,
    createSettingsDto: CreateSettingsDto,
  ): Promise<void> {
    const processedImage = await this.processImage(file.buffer, 'favicon');
    const { fullPath, urlPath } = this.generateFileName(file, 'favicon');

    this.saveImageFile(processedImage, fullPath);
    createSettingsDto.branding.favicon = urlPath;
  }

  /**
   * Process all uploaded files and update DTO
   * @param files - Uploaded files object
   * @param createSettingsDto - Settings DTO to update
   */
  private async processUploadedFiles(
    files: {
      siteLogo?: Express.Multer.File;
      adminLogo?: Express.Multer.File;
      favicon?: Express.Multer.File;
    },
    createSettingsDto: CreateSettingsDto,
  ): Promise<void> {
    const fileProcessingTasks: Promise<void>[] = [];

    if (files.siteLogo) {
      fileProcessingTasks.push(
        this.processSiteLogoImage(files.siteLogo, createSettingsDto),
      );
    }

    if (files.adminLogo) {
      fileProcessingTasks.push(
        this.processAdminLogoImage(files.adminLogo, createSettingsDto),
      );
    }

    if (files.favicon) {
      fileProcessingTasks.push(
        this.processFaviconImage(files.favicon, createSettingsDto),
      );
    }

    // Process all files concurrently for better performance
    if (fileProcessingTasks.length > 0) {
      await Promise.all(fileProcessingTasks);
    }
  }

  /**
   * Create initial site settings
   * @param createSettingsDto - Settings data to create
   * @param files - Optional uploaded files
   * @returns Created settings
   */
  async createSettings(
    createSettingsDto: CreateSettingsDto,
    files?: {
      siteLogo?: Express.Multer.File;
      adminLogo?: Express.Multer.File;
      favicon?: Express.Multer.File;
    },
  ): Promise<SiteSettings> {
    try {
      // Validate business rules
      await this.validateSettingsNotExists();

      // Process uploaded files if any
      if (files) {
        await this.processUploadedFiles(files, createSettingsDto);
      }

      // Create and return settings
      return await this.createSettingsInDatabase(createSettingsDto);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Create settings error: ${error.message}`);
      throw new InternalServerErrorException('Failed to create site settings');
    }
  }

  /**
   * Get current site settings
   * @returns Current settings
   */
  async getCurrentSettings(): Promise<SiteSettings> {
    try {
      const settings = await this.settingsRepository.findActive();
      if (!settings) {
        throw new NotFoundException('Site settings not found');
      }
      return settings;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Get settings error: ${error.message}`);
      throw new InternalServerErrorException('Failed to get site settings');
    }
  }
}
