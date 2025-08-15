import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
    @UploadedFile('file', FilePipeBuilder()) img?: Express.Multer.File,
  ) {
    return this.productService.createProduct(createProductDto, img);
  }

  @Get()
  findAll(@Query() { limit, page }: PaginationDto) {
    return this.productService.findAll(+limit, +page);
  }

  @Get(':id')
  findOne(@Param() { id }: MongoIdDto) {
    return this.productService.getProductById(id);
  }
  @Put(':id')
  @IsAuth()
  @UseInterceptors(FileInterceptor('file'))
  replaceProduct(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile('file', FilePipeBuilder(false)) img?: Express.Multer.File,
  ) {
    return this.productService.replaceProduct(id, updateProductDto, img);
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
