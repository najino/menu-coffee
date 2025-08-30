import { Injectable } from '@nestjs/common';
import { Product } from './entity/product.entity';
import { Repository } from '../common/abstract/repository.abstract';
import { MongoDbService } from '../common/database/database.service';
import { CollectionName } from '../common/database/enum/collection.enum';

@Injectable()
export class ProductRepository extends Repository<Product> {
  constructor(mongoService: MongoDbService) {
    super(mongoService.getCollection<Product>(CollectionName.product));
  }
}
