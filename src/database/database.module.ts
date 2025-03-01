import { Module } from "@nestjs/common";
import { MongoDbService } from "./database.service";

@Module({
	exports: [MongoDbService],
	providers: [MongoDbService],
})
export class DatabaseModule {}
