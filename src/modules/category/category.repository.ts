import { Injectable } from '@nestjs/common';
import { Repository } from '../common/abstract/repository.abstract';
import { MongoDbService } from '../common/database/database.service';
import { CollectionName } from '../common/database/enum/collection.enum';
import { Category } from './entity/category.entity';

@Injectable()
export class CategoryRepository extends Repository<Category> {
    constructor(mongoService: MongoDbService) {
        super(mongoService.getCollection<Category>(CollectionName.category));
    }


    async findBySlug(slug: string) {
        const result = await this.model.findOne({ slug });
        if (!result)
            return null

        return result
    }
}

