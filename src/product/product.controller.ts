import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { IsAuth } from '../decorator/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from './dtos/get-query.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { MongoIdDto } from './dtos/mongo-id-param.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }


  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @IsAuth()
  createProduct(@Body() createProductDto: CreateProductDto, @UploadedFile("file", new ParseFilePipeBuilder().
    addFileTypeValidator({ fileType: /^image\/(jpeg|png|jpg)$/ }).
    addMaxSizeValidator({ maxSize: 5 * 1024 * 1024, message: "photo must be lower than 5Mb" })
    .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) img: Express.Multer.File) {
    return this.productService.createProduct(createProductDto, img)
  }

  @Get()
  findAll(@Query() { limit, page }: PaginationDto) {
    return this.productService.findAll(+limit, +page);
  }


  @Patch(":id")
  @IsAuth()
  update(@Param() { id }: MongoIdDto, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto)
  }

  @Delete(":id")
  @IsAuth()
  delete(@Param() { id }: MongoIdDto) {
    return this.productService.remove(id);
  }

  @Get(":id/status")
  @IsAuth()
  productStatus(@Param() { id }: MongoIdDto) {
    return this.productService.status(id)
  }
}
