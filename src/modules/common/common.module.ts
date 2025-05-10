import { Global, Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { MongoDbService } from "./database/database.service";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./guard/auth.guard";

@Global()
@Module({
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        }
    ],
    imports: [DatabaseModule],
    exports: [MongoDbService]
})
export class CommonModule { }