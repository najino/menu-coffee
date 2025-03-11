import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Db, Document, MongoClient } from 'mongodb';
import { IEnv } from 'src/interface/env.interface';
import { CollectionName } from './enum/collection.enum';

@Injectable()
export class MongoDbService implements OnModuleInit {
  private logger = new Logger(MongoDbService.name);

  private client: MongoClient;
  private db: Db;

  constructor(private readonly configService: ConfigService<IEnv>) {
    // get MongoDB URI From ENV
    const uri = this.configService.getOrThrow('MONGO_URI');
    this.client = new MongoClient(uri);
    this.db = this.client.db(this.configService.getOrThrow('DB_NAME'));
  }

  async onModuleInit() {
    try {
      this.logger.warn('trying to Connect DB');
      this.client = await this.client.connect();
      this.logger.log('connected successfully');
    } catch (err) {
      this.logger.error('fail to connect db');
      process.exit(1);
    }
  }

  getCollection<T extends Document>(collectionName: CollectionName) {
    return this.db.collection<T>(collectionName as unknown as string);
  }
}
