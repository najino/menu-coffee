import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dtos/create-product.dto';

@Injectable()
export class ProductService {
    constructor(private readonly productRepository: ProductRepository) { }

    createProduct(createProductDto: CreateProductDto) {

    }



    findAll() { }


    update(id: number) { }


    remove(id: number) { }


    status(id: number) { }
}
