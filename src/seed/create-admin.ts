import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  try {
    await userService.createUser({
      username: 'admin',
      password: 'admin',
    });
    await app.close();
  } catch {}
  process.exit(1);
}

bootstrap();
