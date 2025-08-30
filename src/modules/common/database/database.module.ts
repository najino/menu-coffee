import { Global, Module } from '@nestjs/common';
import { MongoDbService } from './database.service';

@Global()
@Module({
  exports: [MongoDbService],
  providers: [MongoDbService],
})
export class DatabaseModule { }
