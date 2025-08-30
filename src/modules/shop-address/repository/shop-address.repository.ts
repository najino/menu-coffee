import { Injectable } from '@nestjs/common';
import { ShopAddress } from '../entity/shop-address.entity';
import { Repository } from '../../common/abstract/repository.abstract';
import { MongoDbService } from '../../common/database/database.service';
import { CollectionName } from '../../common/database/enum/collection.enum';

@Injectable()
export class ShopAddressRepository extends Repository<ShopAddress> {
  constructor(mongoService: MongoDbService) {
    super(mongoService.getCollection<ShopAddress>(CollectionName.shopAddress));
  }
}
