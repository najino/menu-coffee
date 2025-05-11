import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./guard/auth.guard";
import { JwtModule } from "@nestjs/jwt";

@Global()
@Module({
    imports:[JwtModule.register({})],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        }
    ],
})
export class CommonModule { }