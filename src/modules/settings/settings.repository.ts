import { Injectable } from '@nestjs/common';
import { MongoDbService } from '../common/database/database.service';
import { SiteSettings } from './entity/setting.entity';
import { ObjectId } from 'mongodb';
import { CollectionName } from '../common/database/enum/collection.enum';
import { Repository } from '../common/abstract/repository.abstract';

@Injectable()
export class SettingsRepository extends Repository<SiteSettings> {
  constructor(mongoDbService: MongoDbService) {
    super(
      mongoDbService.getCollection<SiteSettings>(CollectionName.siteSettings),
    );
  }

  /**
   * Get the active settings document
   * @returns Active settings or null if not found
   */
  async findActive(): Promise<SiteSettings | null> {
    return this.model.findOne({}, { sort: { createdAt: -1 } });
  }

  /**
   * Check if settings exist
   * @returns True if settings exist, false otherwise
   */
  async exists(): Promise<boolean> {
    const count = await this.model.countDocuments({});
    return count > 0;
  }
}
