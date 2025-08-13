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
import { createWriteStream, existsSync, rmSync } from 'fs';
import * as sharp from 'sharp';
import { Readable } from 'stream';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  private logger = new Logger(CategoryService.name);

  private genFileName(file: Express.Multer.File) {
    const ext = extname(file.originalname);
    const fileName = Math.floor(Math.random() * 1e7 * Date.now());
    const fullPath = join(process.cwd(), 'public', 'category', fileName + ext);

    return { fullPath, urlPath: `/public/category/${fileName}${ext}` };
  }

  private uploadFile(fileBuf: Buffer, fileName: string) {
    const writeStream = createWriteStream(fileName);
    Readable.from(fileBuf)
      .pipe(writeStream)
      .on('error', (err) => {
        this.logger.error(err);
        throw new BadRequestException('Error During Upload.');
      });
  }

  private removeFile(path: string) {
    if (!path) return;

    const fullPath = join(process.cwd(), path);

    if (existsSync(fullPath)) rmSync(fullPath);

    return;
  }

  private compressingImg(img: Buffer) {
    return sharp(img).resize(200, 200).toBuffer();
  }

  async create(categoryData: CreateCategoryDto, img?: Express.Multer.File) {
    const slug = this.slugify(categoryData.slug) || Date.now().toString();
    const category = await this.categoryRepository.findBySlug(slug);
    if (category) throw new BadRequestException('Category Is Exist Before.');

    try {
      let urlPath = "'";

      if (img) {
        // compressing Img
        const buf = await this.compressingImg(img.buffer);

        const { fullPath, urlPath: url } = this.genFileName(img);
        urlPath = url;
        this.uploadFile(buf, fullPath);
      }

      const result = await this.categoryRepository.create({
        ...categoryData,
        slug,
        image: urlPath,
      });

      return result.acknowledged;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async findAll() {
    return this.categoryRepository.findAll();
  }

  async findBySlug(slug: string) {
    const result = await this.categoryRepository.findBySlug(slug);
    if (!result) throw new NotFoundException('Category Not Found.');

    return result;
  }

  async update(
    id: string,
    categoryData: UpdateCategoryDto,
    img?: Express.Multer.File,
  ) {
    try {
      const category = await this.categoryRepository.findOne({
        _id: new ObjectId(id),
      });

      if (!category) throw new NotFoundException('Category Not Found');

      if (categoryData.slug)
        categoryData.slug = this.slugify(categoryData.slug);

      let payload: any = { ...categoryData };

      if (img) {
        // Remove old image if exists
        this.removeFile(category.image || '');

        // Upload new image
        const buf = await this.compressingImg(img.buffer);
        const { fullPath, urlPath } = this.genFileName(img);
        this.uploadFile(buf, fullPath);
        payload.image = urlPath;
      }

      return this.categoryRepository.update({ _id: new ObjectId(id) }, payload);
    } catch (err) {
      if (err instanceof HttpException) throw err;

      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({
      _id: new ObjectId(id),
    });

    if (!category) throw new NotFoundException('Category Not Found');

    // Remove image file if exists
    this.removeFile(category.image || '');

    return this.categoryRepository.delete({ _id: new ObjectId(id) });
  }

  private slugify(slug: string) {
    if (!slug) return;
    return slug.split(' ').join('-').trim();
  }

  async findById(id: string) {
    return this.categoryRepository.findOne({ _id: new ObjectId(id) });
  }
}
