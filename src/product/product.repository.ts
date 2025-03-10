import { Injectable } from '@nestjs/common';
import { Repository } from '../abstract/repository.abstract';
import { MongoDbService } from '../database/database.service';
import { Product } from './entity/product.entity';
import { CollectionName } from '../database/enum/collection.enum';

@Injectable()
export class ProductRepository extends Repository<Product> {
  constructor(mongoService: MongoDbService) {
    super(mongoService.getCollection<Product>(CollectionName.product));
  }
}
