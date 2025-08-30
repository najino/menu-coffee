import { Injectable } from '@nestjs/common';
import { User } from './entity/user.entity';
import { Repository } from '../common/abstract/repository.abstract';
import { MongoDbService } from '../common/database/database.service';
import { CollectionName } from '../common/database/enum/collection.enum';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(mongoService: MongoDbService) {
    super(mongoService.getCollection<User>(CollectionName.user));
  }
}
