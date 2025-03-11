import { Injectable } from '@nestjs/common';
import { MongoDbService } from '../database/database.service';
import { User } from './entity/user.entity';
import { CollectionName } from '../database/enum/collection.enum';
import { Repository } from '../abstract/repository.abstract';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(mongoService: MongoDbService) {
    super(mongoService.getCollection<User>(CollectionName.user));
  }
}
