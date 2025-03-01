import { Module } from "@nestjs/common";
import { ProductModule } from "./product/product.module";
import { UserModule } from "./user/user.module";
import { DatabaseModule } from "./database/database.module";
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: `${process.cwd()}/.env`,
			isGlobal: true,
			cache: true,
		}),
		ProductModule,
		UserModule,
		DatabaseModule,
	],
})
export class AppModule {}
