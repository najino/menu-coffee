import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from './dtos/get-query.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { MongoIdDto } from './dtos/mongo-id-param.dto';
import { FilePipeBuilder } from './pipes/file-builder.pipe';
import { IsAuth } from '../common/decorator/auth.decorator';
import { MongoIdPipe } from '../common/pipes/mongoId.pipe';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @IsAuth()
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile('file', FilePipeBuilder()) image?: Express.Multer.File,
  ) {
    return this.productService.createProduct(createProductDto, image);
  }

  @Get()
  findAll(@Query() { limit, page }: PaginationDto) {
    return this.productService.findAll(+limit, +page);
  }

  @Get(':id')
  findOne(@Param() { id }: MongoIdDto) {
    return this.productService.getProductById(id);
  }

  @Patch(':id')
  @IsAuth()
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param() { id }: MongoIdDto,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile('file', FilePipeBuilder(false)) image?: Express.Multer.File,
  ) {
    return this.productService.update(id, updateProductDto, image);
  }

  @Patch(':id/status')
  @IsAuth()
  updateStatus(
    @Param('id', MongoIdPipe) id: string,
    @Body() body: { status: boolean },
  ) {
    if (body.status === undefined) {
      throw new BadRequestException('Status is required');
    }

    return this.productService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @IsAuth()
  delete(@Param() { id }: MongoIdDto) {
    return this.productService.remove(id);
  }

  @Get(':id/status')
  productStatus(@Param() { id }: MongoIdDto) {
    return this.productService.status(id);
  }
}
