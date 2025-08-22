import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
  UploadedFiles,
  Res,
  HttpStatus,
  Header,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { IsAuth } from '../common/decorator/auth.decorator';
import {
  HeroBannerFilePipe,
  LogoFilePipe,
  FaviconFilePipe,
} from '../common/pipes/file-upload.pipe';

@Controller('site-settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Create initial site settings (Admin only)
   * POST /site-settings
   */
  @Post()
  @IsAuth()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'heroImage', maxCount: 1 },
      { name: 'siteLogo', maxCount: 1 },
      { name: 'adminLogo', maxCount: 1 },
      { name: 'favicon', maxCount: 1 },
    ]),
  )
  async createSettings(
    @Body() createSettingsDto: CreateSettingsDto,
    @UploadedFiles()
    files: {
      heroImage?: Express.Multer.File[];
      siteLogo?: Express.Multer.File[];
      adminLogo?: Express.Multer.File[];
      favicon?: Express.Multer.File[];
    },
  ) {
    console.log('createSettingsDto is :', createSettingsDto);
    // Validate required files for heroImage, siteLogo, and adminLogo
    if (!files.heroImage || files.heroImage.length === 0) {
      throw new BadRequestException('Hero image is required.');
    }
    if (!files.siteLogo || files.siteLogo.length === 0) {
      throw new BadRequestException('Site logo is required.');
    }
    if (!files.adminLogo || files.adminLogo.length === 0) {
      throw new BadRequestException('Admin logo is required.');
    }

    const fileData = {
      heroImage: files.heroImage?.[0],
      siteLogo: files.siteLogo?.[0],
      adminLogo: files.adminLogo?.[0],
      favicon: files.favicon?.[0],
    };

    const settings = await this.settingsService.createSettings(
      {
        ...createSettingsDto,
        branding: {
          siteLogo: '',
          adminLogo: '',
          favicon: '',
          logoAltText: '',
        },
      },
      fileData,
    );

    return {
      message: 'Site settings created successfully',
      data: settings,
    };
  }

  /**
   * Get current site settings (Admin only)
   * GET /site-settings
   */
  @Get()
  @IsAuth()
  async getSettings() {
    const settings = await this.settingsService.getCurrentSettings();
    return {
      message: 'Site settings retrieved successfully',
      data: settings,
    };
  }

  /**
   * Update site settings (Admin only)
   * PUT /site-settings
   */
  @Put()
  @IsAuth()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'heroImage', maxCount: 1 },
      { name: 'siteLogo', maxCount: 1 },
      { name: 'adminLogo', maxCount: 1 },
      { name: 'favicon', maxCount: 1 },
    ]),
  )
  async updateSettings(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @UploadedFiles()
    files: {
      heroImage?: Express.Multer.File[];
      siteLogo?: Express.Multer.File[];
      adminLogo?: Express.Multer.File[];
      favicon?: Express.Multer.File[];
    },
  ) {
    const fileData = {
      heroImage: files.heroImage?.[0],
      siteLogo: files.siteLogo?.[0],
      adminLogo: files.adminLogo?.[0],
      favicon: files.favicon?.[0],
    };

    const settings = await this.settingsService.updateSettings(
      updateSettingsDto,
      fileData,
    );

    return {
      message: 'Site settings updated successfully',
      data: settings,
    };
  }

  /**
   * Get public site data (Public endpoint)
   * GET /site-settings/public
   */
  @Get('public')
  async getPublicSiteData() {
    const siteData = await this.settingsService.getPublicSiteData();
    return {
      message: 'Public site data retrieved successfully',
      data: siteData,
    };
  }

  /**
   * Get theme CSS variables (Public endpoint)
   * GET /site-settings/theme.css
   */
  @Get('theme.css')
  @Header('Content-Type', 'text/css')
  async getThemeCSS(@Res() res: Response) {
    try {
      const css = await this.settingsService.getThemeCSS();
      res.status(HttpStatus.OK).send(css);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('/* Error loading theme CSS */');
    }
  }

  /**
   * Delete site settings (Admin only)
   * DELETE /site-settings/:id
   */
  @Delete(':id')
  @IsAuth()
  async deleteSettings(@Param('id') id: string) {
    const result = await this.settingsService.deleteSettings(id);

    if (result) {
      return {
        message: 'Site settings deleted successfully',
      };
    } else {
      return {
        message: 'Failed to delete site settings',
      };
    }
  }

  /**
   * Health check endpoint
   * GET /site-settings/health
   */
  @Get('health')
  async healthCheck() {
    try {
      await this.settingsService.getCurrentSettings();
      return {
        status: 'healthy',
        message: 'Site settings service is running',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Site settings service is not available',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
