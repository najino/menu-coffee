import { Module } from "@nestjs/common";
import { ProductModule } from "./product/product.module";
import { UserModule } from "./user/user.module";
import { DatabaseModule } from "./database/database.module";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./guard/auth.guard";

@Module({
	imports: [
		DatabaseModule,
		ConfigModule.forRoot({
			envFilePath: `${process.cwd()}/.env`,
			isGlobal: true,
			cache: true,
		}),
		ProductModule,
		UserModule,
		DatabaseModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: AuthGuard
		}
	]
})
export class AppModule { }
