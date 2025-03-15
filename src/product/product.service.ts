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
import { createWriteStream, existsSync, rmSync } from 'fs';
import Decimal from 'decimal.js';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ObjectId } from 'mongodb';
import { Product } from './entity/product.entity';
import * as sharp from 'sharp';
import { Readable } from 'stream';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) { }

  private logger = new Logger(ProductService.name);

  private genFileName(file: Express.Multer.File) {
    const ext = extname(file.originalname);
    const fileName = Math.floor(Math.random() * 1e7 * Date.now());
    const fullPath = join(process.cwd(), 'public', 'product', fileName + ext);

    return { fullPath, urlPath: `/public/product/${fileName}${ext}` };
  }

  private uploadFile(fileBuf: Buffer, fileName: string) {
    const writeStream = createWriteStream(fileName);
    Readable.from(fileBuf).pipe(writeStream).on('error', (err) => {
      this.logger.error(err)
      throw new BadRequestException("Error During Upload.")
    })
  }

  private removeFile(path: string) {
    const fullPath = join(process.cwd(), path);

    if (existsSync(fullPath)) rmSync(fullPath);

    return;
  }

  async createProduct(
    createProductDto: CreateProductDto,
    img: Express.Multer.File,
  ) {
    try {
      const { description, models, name, price, status } = createProductDto;
      // convert price to Decimal
      const decimalPrice = new Decimal(price).valueOf();

      // compressing Img
      const buf = await this.compressingImg(img.buffer);

      const { fullPath, urlPath } = this.genFileName(img)
      this.uploadFile(buf, fullPath)

      const { insertedId } = await this.productRepository.create({
        description,
        img: urlPath,
        models: models,
        name,
        price: decimalPrice.valueOf(),
        status: status === '1' ? true : false,
      });

      // Store Image Into Storage If Product Saved Successful
      return this.productRepository.findOne({ _id: insertedId });
    } catch (err) {
      if (err instanceof HttpException) throw err;

      this.logger.error(err.message);
      throw new InternalServerErrorException(err);
    }
  }

  async findAll(limit?: number, page?: number) {
    limit = limit || 10;
    page = page || 1;
    const skip = (page - 1) * limit;

    const result = await this.productRepository.findAll({}, { limit, skip });

    return result;
  }

  async update(
    id: ObjectId,
    updateProductDto: UpdateProductDto,
    img?: Express.Multer.File,
  ) {
    let payload: Partial<Product> = {};

    for (const prop in updateProductDto) {
      if (updateProductDto[prop] && prop === 'status') {
        payload[prop] = updateProductDto[prop] === '1' ? true : false;
      } else if (updateProductDto[prop] && prop === 'price') {
        // use DecimalJs to prevent Floating Point
        payload[prop] = new Decimal(updateProductDto[prop]).valueOf();
      } else if (updateProductDto[prop]) {
        payload[prop] = updateProductDto[prop];
      }
    }

    try {
      const product = await this.productRepository.findOne({
        _id: new ObjectId(id),
      });

      if (!product) throw new NotFoundException('Product not found.');

      if (img) {
        this.removeFile(product.img);

        const { fullPath, urlPath } = this.genFileName(img)
        this.uploadFile(await this.compressingImg(img.buffer), fullPath);
        payload['img'] = urlPath;
      }

      // get Product and Update them
      const result = await this.productRepository.update(
        { _id: new ObjectId(id) },
        payload,
      );

      return result;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error(err.message);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: ObjectId) {
    const product = await this.productRepository.delete({
      _id: new ObjectId(id),
    });

    if (!product) throw new NotFoundException('Product not found.');

    this.removeFile(product.img);

    return product;
  }

  async status(id: ObjectId) {
    const product = await this.productRepository.findOne({
      _id: new ObjectId(id),
    });

    if (!product) throw new NotFoundException('Product not found.');

    return {
      status: product.status,
    };
  }


  private compressingImg(img: Buffer) {
    return sharp(img)
      .resize(200, 200)
      .toBuffer()
  }
}
