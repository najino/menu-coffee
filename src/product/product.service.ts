import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dtos/create-product.dto';
import { extname, join } from 'path';
import { createWriteStream } from 'fs';
import Decimal from 'decimal.js';

@Injectable()
export class ProductService {
    constructor(private readonly productRepository: ProductRepository) { }


    private logger = new Logger(ProductService.name);

    private uploadFile(file: Express.Multer.File) {
        // create FileName
        const ext = extname(file.originalname);
        const fileName = Math.floor(Math.random() * 1e7 * Date.now())
        const filePath = join(process.cwd(), "public", "product", fileName + ext);
        // create WriteStream
        const writeStram = createWriteStream(filePath);

        // write image into Directory
        writeStram.write(file.buffer, (err) => {
            if (err) {
                this.logger.error(err)
                throw new BadRequestException("unknows Error During Upload.")
            }
        })

        return `/public/product/${fileName}${ext}`

    }

    async createProduct(createProductDto: CreateProductDto, img: Express.Multer.File) {
        try {
            const { description, models, name, price, status } = createProductDto;
            // uplaod Image
            const imgPath = this.uploadFile(img)

            // convert price to Decimal 
            const decimalPrice = new Decimal(price).valueOf();

            const { insertedId } = await this.productRepository.create({
                description,
                img: imgPath,
                model: models,
                name,
                price: decimalPrice.valueOf(),
                status: status === '1' ? true : false
            })

            return await this.productRepository.findOne({ _id: insertedId })
        } catch (err) {
            this.logger.error(err)
            throw new InternalServerErrorException(err)
        }
    }



    findAll() { }


    update(id: number) { }


    remove(id: number) { }


    status(id: number) { }
}
