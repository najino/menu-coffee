import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import { sessionOption } from './config/session.config';

async function bootstrap() {
  // init Application
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;

  // setup session config
  app.use(
    session(sessionOption),
  );

  // lestening to Project
  await app.listen(port, () => {
    console.log(`server listening on http://localhost:${port}`);
  });
}
bootstrap();
