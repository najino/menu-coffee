import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { IsAuth } from '../decorator/auth.decorator';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }


  @Post()
  @IsAuth()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto)
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }


  @Patch(":id")
  @IsAuth()
  update(@Param("id", ParseIntPipe) id: number) {
    return this.productService.update(id)
  }

  @Delete(":id")
  @IsAuth()
  delete(@Param("id", ParseIntPipe) id: number) {
    this.productService.remove(id);
  }

  @Post(":id")
  @IsAuth()
  productStatus(@Param("id", ParseIntPipe) id: number) {
    return this.productService.status(id)
  }
}
