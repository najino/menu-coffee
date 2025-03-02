import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const session = require('express-session');
import { ValidationPipe } from '@nestjs/common';
import { CreateSession } from './config/session.config';

async function bootstrap() {
  // init Application
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  // setup session config
  CreateSession(app)
  // lestening to Project
  await app.listen(port, () => {
    console.log(`server listening on http://localhost:${port}`);
  });
}
bootstrap();
