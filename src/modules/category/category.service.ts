import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ObjectId } from 'mongodb';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { extname, join } from 'path';
import { writeFileSync, existsSync, rmSync } from 'fs';
import * as sharp from 'sharp';
import { Category } from './entity/category.entity';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  private logger = new Logger(CategoryService.name);

  /**
   * Generate unique filename for uploaded image
   * @param file - Uploaded file object
   * @returns Object containing full path and URL path
   */
  private generateFileName(file: Express.Multer.File) {
    const fileExtension = extname(file.originalname);
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const fullPath = join(
      process.cwd(),
      'public',
      'category',
      `${uniqueFileName}${fileExtension}`,
    );
    const urlPath = `/public/category/${uniqueFileName}${fileExtension}`;

    return { fullPath, urlPath };
  }

  /**
   * Save image file to local storage using writeFileSync
   * @param fileBuffer - Compressed image buffer
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
   * Compress and resize image to 200x200 pixels
   * @param imageBuffer - Original image buffer
   * @returns Compressed image buffer
   */
  private async compressImage(imageBuffer: Buffer): Promise<Buffer> {
    return sharp(imageBuffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  async create(categoryData: CreateCategoryDto, image?: Express.Multer.File) {
    // Generate slug from name or use timestamp if not provided
    const slug = this.slugify(categoryData.slug) || Date.now().toString();

    // Check if category with same slug already exists
    const existingCategory = await this.categoryRepository.findBySlug(slug);
    if (existingCategory) {
      throw new BadRequestException('Category already exists with this slug');
    }

    try {
      let imageUrl = '';

      // Process image if provided
      if (image) {
        const compressedImage = await this.compressImage(image.buffer);
        const { fullPath, urlPath } = this.generateFileName(image);

        this.saveImageFile(compressedImage, fullPath);
        imageUrl = urlPath;
      }

      // Create category in database
      const result = await this.categoryRepository.create({
        ...categoryData,
        slug,
        image: imageUrl,
      });

      return result.acknowledged;
    } catch (error) {
      this.logger.error(`Create category error: ${error.message}`);
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async findAll() {
    return this.categoryRepository.findAll();
  }

  async findBySlug(slug: string) {
    const result = await this.categoryRepository.findBySlug(slug);
    if (!result) {
      throw new NotFoundException('Category not found');
    }

    return result;
  }

  async update(
    id: string,
    categoryData: UpdateCategoryDto,
    image?: Express.Multer.File,
  ) {
    try {
      // Check if category exists
      const existingCategory = await this.categoryRepository.findOne({
        _id: new ObjectId(id),
      });
      if (!existingCategory) {
        throw new NotFoundException('Category not found');
      }

      // Prepare update payload
      const updatePayload: Partial<Category> = { ...categoryData };

      // Process slug if provided
      if (categoryData.slug) {
        const existingCategoryWithSameSlug =
          await this.categoryRepository.findBySlug(
            this.slugify(categoryData.slug),
          );
        if (existingCategoryWithSameSlug) {
          throw new BadRequestException(
            'Category already exists with this slug',
          );
        }

        updatePayload.slug = this.slugify(categoryData.slug);
      }

      // Handle image update if provided
      if (image) {
        // Remove old image if exists
        this.removeImageFile(existingCategory.image || '');

        // Process and save new image
        const compressedImage = await this.compressImage(image.buffer);
        const { fullPath, urlPath } = this.generateFileName(image);

        this.saveImageFile(compressedImage, fullPath);
        updatePayload.image = urlPath;
      }

      // Update category in database
      return this.categoryRepository.update(
        { _id: new ObjectId(id) },
        updatePayload,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Update category error: ${error.message}`);
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({
      _id: new ObjectId(id),
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Remove associated image file
    this.removeImageFile(category.image || '');

    return this.categoryRepository.delete({ _id: new ObjectId(id) });
  }

  /**
   * Convert text to URL-friendly slug
   * @param text - Text to convert to slug
   * @returns URL-friendly slug
   */
  private slugify(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  async findById(id: string) {
    return this.categoryRepository.findOne({ _id: new ObjectId(id) });
  }
}
