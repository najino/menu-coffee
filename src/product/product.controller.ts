import {
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
import { IsAuth } from '../decorator/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from './dtos/get-query.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { MongoIdDto } from './dtos/mongo-id-param.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiResponseProperty,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { HttpExceptionDto } from '../dtos/http-exception.dto';
import { ProductDto } from './dtos/product.dto';
import { FilePipeBuilder } from './pipes/file-builder.pipe';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiTags('Admin')
  @ApiExtraModels(CreateProductDto)
  @ApiBearerAuth('JWT-AUTH')
  @ApiCreatedResponse({
    type: ProductDto,
  })
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(CreateProductDto) },
        {
          properties: {
            file: {
              type: 'string',
              format: 'binary',
              description: '5MB Default',
            },
          },
        },
      ],
    },
  })
  @ApiResponseProperty({ type: HttpExceptionDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @IsAuth()
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile('file', FilePipeBuilder()) img: Express.Multer.File,
  ) {
    console.log('i am in controller');
    return this.productService.createProduct(createProductDto, img);
  }

  @Get()
  @ApiOkResponse({ description: 'Products fetched successfully' })
  @ApiQuery({
    name: 'limit',
    description: 'limit Of Product You want to fetched By Default(10)',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'page you want to see Default(1)',
    required: false,
  })
  findAll(@Query() { limit, page }: PaginationDto) {
    return this.productService.findAll(+limit, +page);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-AUTH')
  @ApiExtraModels(UpdateProductDto)
  @ApiParam({ name: 'id', description: 'Product Id (Mongo ObjectId)' })
  @ApiOkResponse({
    description: 'product updated successfully',
    type: ProductDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
    type: HttpExceptionDto,
  })
  @ApiTags('Admin')
  @ApiBody({
    schema: {
      allOf: [
        {
          $ref: getSchemaPath(UpdateProductDto),
        },
        {
          properties: {
            file: {
              type: 'string',
              format: 'binary',
              required: undefined,
            },
          },
        },
      ],
    },
  })
  @ApiConsumes('multipart/form-data')
  @IsAuth()
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param() { id }: MongoIdDto,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile('file', FilePipeBuilder(false)) img?: Express.Multer.File,
  ) {
    return this.productService.update(id, updateProductDto, img);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-AUTH')
  @ApiTags('Admin')
  @ApiParam({ name: 'id', description: 'Product Id' })
  @ApiOkResponse({
    description: 'Product remove successfully',
    type: ProductDto,
  })
  @ApiNotFoundResponse({
    description: 'Product Not found',
    type: HttpExceptionDto,
  })
  @IsAuth()
  delete(@Param() { id }: MongoIdDto) {
    return this.productService.remove(id);
  }

  @Get(':id/status')
  @ApiParam({ name: 'id', description: 'Product Id' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        status: { description: 'Product status', type: 'boolean' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
    type: HttpExceptionDto,
  })
  productStatus(@Param() { id }: MongoIdDto) {
    return this.productService.status(id);
  }
}
