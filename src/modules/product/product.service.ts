import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dtos/create-product.dto';
import { extname, join } from 'path';
import { writeFileSync, existsSync, rmSync } from 'fs';
import Decimal from 'decimal.js';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ObjectId } from 'mongodb';
import { Product } from './entity/product.entity';
import * as sharp from 'sharp';
import { CategoryService } from '../category/category.service';
import { AddDiscountDto } from './dtos/discount.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryService: CategoryService,
  ) {}

  private logger = new Logger(ProductService.name);

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
      'product',
      `${uniqueFileName}${fileExtension}`,
    );
    const urlPath = `/public/product/${uniqueFileName}${fileExtension}`;

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

  /**
   * Get total count of products
   * @returns Total number of products
   */
  async getProductCount(): Promise<number> {
    try {
      const products = await this.productRepository.findAll();
      return products.length;
    } catch (error) {
      this.logger.error(`Failed to get product count: ${error.message}`);
      return 0;
    }
  }

  async getProductById(id: ObjectId) {
    const result = await this.productRepository.findOne({
      _id: new ObjectId(id),
    });
    if (!result) throw new NotFoundException('Product not found');

    return this.serializeProduct(result);
  }

  async createProduct(
    createProductDto: CreateProductDto,
    image?: Express.Multer.File,
  ) {
    try {
      const { categoryId, description, models, name, price, status } =
        createProductDto;

      // Validate category exists
      const category = await this.categoryService.findById(categoryId);
      if (!category) throw new NotFoundException('Category Not Found.');

      // Convert price to Decimal for precision
      const decimalPrice = new Decimal(price).valueOf();

      let imageUrl = '';

      // Process image if provided
      if (image) {
        const compressedImage = await this.compressImage(image.buffer);
        const { fullPath, urlPath } = this.generateFileName(image);

        this.saveImageFile(compressedImage, fullPath);
        imageUrl = urlPath;
      }

      // Create product in database
      const { insertedId } = await this.productRepository.create({
        description,
        img: imageUrl,
        models,
        name,
        price: decimalPrice.valueOf(),
        category,
        status: status === '1',
      });

      // Return created product
      const res = await this.productRepository.findOne({ _id: insertedId });

      return this.serializeProduct(res!);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Create product error: ${error.message}`);
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findAll(limit?: number, page?: number) {
    const itemsPerPage = limit || 10;
    const currentPage = page || 1;
    const skip = (currentPage - 1) * itemsPerPage;

    const products = await this.productRepository.findAll(
      {},
      { limit: itemsPerPage, skip },
    );

    return products.map((product) => this.serializeProduct(product));
  }

  async update(
    id: ObjectId,
    updateProductDto: UpdateProductDto,
    image?: Express.Multer.File,
  ) {
    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findOne({
        _id: new ObjectId(id),
      });
      if (!existingProduct) throw new NotFoundException('Product not found.');

      // Prepare update payload
      const updatePayload: Partial<Product> = {};

      // Process each field from DTO
      for (const [key, value] of Object.entries(updateProductDto)) {
        if (value !== undefined && value !== null) {
          if (key === 'status') {
            updatePayload[key] = value === '1';
          } else if (key === 'price') {
            updatePayload[key] = new Decimal(value).valueOf();
          } else {
            updatePayload[key] = value;
          }
        }
      }

      // Handle image update if provided
      if (image) {
        // Remove old image
        this.removeImageFile(existingProduct.img || '');

        // Process and save new image
        const compressedImage = await this.compressImage(image.buffer);
        const { fullPath, urlPath } = this.generateFileName(image);

        this.saveImageFile(compressedImage, fullPath);
        updatePayload.img = urlPath;
      }

      // Update product in database
      return this.productRepository.update(
        { _id: new ObjectId(id) },
        updatePayload,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Update product error: ${error.message}`);
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async remove(id: ObjectId) {
    const product = await this.productRepository.delete({
      _id: new ObjectId(id),
    });

    if (!product) throw new NotFoundException('Product not found.');

    // Remove associated image file
    this.removeImageFile(product.img || '');

    return product;
  }

  async status(id: ObjectId) {
    const product = await this.productRepository.findOne({
      _id: new ObjectId(id),
    });

    if (!product) throw new NotFoundException('Product not found.');

    return { status: product.status };
  }

  /**
   * Update only the status of a product
   * @param id - Product ID
   * @param status - New status value
   * @returns Updated product
   */
  async updateStatus(id: string, status: boolean) {
    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findOne({
        _id: new ObjectId(id),
      });
      if (!existingProduct) {
        throw new NotFoundException('Product not found.');
      }

      // Update only the status field
      const result = await this.productRepository.update(
        { _id: new ObjectId(id) },
        { status: status },
      );

      if (!result) {
        throw new InternalServerErrorException(
          'Failed to update product status',
        );
      }

      // Return updated product
      const res = await this.productRepository.findOne({
        _id: new ObjectId(id),
      });

      return this.serializeProduct(res!);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Update product status error: ${error.message}`);
      throw new InternalServerErrorException('Failed to update product status');
    }
  }

  /**
   * Replace entire product data (PUT operation)
   * @param id - Product ID
   * @param productData - Complete product data to replace
   * @param image - Optional new image file
   * @returns Replaced product
   */
  async replaceProduct(
    id: string,
    productData: UpdateProductDto,
    image?: Express.Multer.File,
  ) {
    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findOne({
        _id: new ObjectId(id),
      });
      if (!existingProduct) {
        throw new NotFoundException('Product not found.');
      }

      // Validate category if provided
      if (productData.categoryId) {
        const category = await this.categoryService.findById(
          productData.categoryId,
        );
        if (!category) {
          throw new NotFoundException('Category not found.');
        }
      }

      // Prepare complete replacement payload
      const replacementPayload: Partial<Product> = {
        name: productData.name,
        description: productData.description,
        price: productData.price
          ? new Decimal(productData.price).valueOf()
          : existingProduct.price,
        models: productData.models || existingProduct.models,
        status:
          productData.status !== undefined
            ? productData.status === '1'
            : existingProduct.status,
        category: productData.categoryId
          ? (await this.categoryService.findById(productData.categoryId)) ||
            existingProduct.category
          : existingProduct.category,
      };

      // Handle image replacement if provided
      if (image) {
        // Remove old image
        this.removeImageFile(existingProduct.img || '');

        // Process and save new image
        const compressedImage = await this.compressImage(image.buffer);
        const { fullPath, urlPath } = this.generateFileName(image);

        this.saveImageFile(compressedImage, fullPath);
        replacementPayload.img = urlPath;
      } else {
        // Keep existing image if no new image provided
        replacementPayload.img = existingProduct.img;
      }

      // Replace product in database
      const result = await this.productRepository.update(
        { _id: new ObjectId(id) },
        replacementPayload,
      );

      if (!result) {
        throw new InternalServerErrorException('Failed to replace product');
      }

      // Return replaced product
      return this.productRepository.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Replace product error: ${error.message}`);
      throw new InternalServerErrorException('Failed to replace product');
    }
  }

  /**
   * Add discount to a product
   * @param productId - Product ID
   * @param discountDto - Discount data
   * @returns Updated product with discount
   */
  async addDiscount(productId: string, discountDto: AddDiscountDto) {
    try {
      const product = await this.getProductById(new ObjectId(productId));

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Update product with discount
      const updatedProduct = await this.productRepository.update(
        { _id: new ObjectId(productId) },
        {
          discount: {
            type: discountDto.type,
            value: discountDto.value,
            isActive: discountDto.isActive ?? true,
          },
        },
      );

      if (!updatedProduct) {
        throw new InternalServerErrorException(
          'Failed to update product discount',
        );
      }

      return this.serializeProduct(updatedProduct);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Failed to add discount: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to add discount to product',
      );
    }
  }

  /**
   * Remove discount from a product
   * @param productId - Product ID
   * @param removeDiscountDto - Options for removing discount
   * @returns Updated product without discount
   */
  async removeDiscount(productId: string) {
    try {
      const product = await this.getProductById(new ObjectId(productId));

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (!product.discount || !product.discount.isActive) {
        throw new BadRequestException(
          'Product has no active discount to remove',
        );
      }

      const updatedProduct = await this.productRepository.unset(
        { _id: new ObjectId(productId) },
        { discount: product.discount },
      );

      if (!updatedProduct) {
        throw new InternalServerErrorException(
          'Failed to remove product discount',
        );
      }

      return 'Discount removed successfully';
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Failed to remove discount: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to remove discount from product',
      );
    }
  }

  private calculateProductPrice(product: Product) {
    if (!product.discount || !product.discount.isActive) return product.price;

    if (product.discount.type === 'flat') {
      return +product.price - +product.discount.value;
    }

    if (product.discount.type === 'percentage') {
      return +product.price - (+product.price * +product.discount.value) / 100;
    }
  }

  private serializeProduct(product: Product) {
    return {
      ...product,
      price: +product.price,
      priceWithDiscount:
        product.discount && product.discount.isActive
          ? this.calculateProductPrice(product)
          : null,
    };
  }
}
