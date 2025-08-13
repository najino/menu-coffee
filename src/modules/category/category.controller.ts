import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { IsAuth } from '../common/decorator/auth.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryService } from './category.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MongoIdPipe } from '../common/pipes/mongoId.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryFilePipeBuilder } from './pipes/file-builder.pipe';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @IsAuth()
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile('file', CategoryFilePipeBuilder())
    image?: Express.Multer.File,
  ) {
    await this.categoryService.create(createCategoryDto, image);

    return {
      msg: 'Category Saved Successfully',
    };
  }

  @Get(':slug')
  getCategoryBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Get()
  getCategories() {
    return this.categoryService.findAll();
  }

  @Patch(':id')
  @IsAuth()
  @UseInterceptors(FileInterceptor('file'))
  updateCategory(
    @Param('id', MongoIdPipe) categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile('file', CategoryFilePipeBuilder(false))
    image?: Express.Multer.File,
  ) {
    return this.categoryService.update(categoryId, updateCategoryDto, image);
  }

  @Delete(':id')
  @IsAuth()
  deleteCategory(@Param('id', MongoIdPipe) categoryId: string) {
    return this.categoryService.remove(categoryId);
  }
}
