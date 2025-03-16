import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import logger from './logger/logger';
import { swaggerCreator } from './swagger/swagger-creator';

async function bootstrap() {
  // init Application
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });

  app.enableCors({
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-type', 'Authorization'],
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const documentFactory = swaggerCreator(app);
  SwaggerModule.setup('api', app, documentFactory);

  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public/' });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    logger.log(`server listening on http://localhost:${port}`);
    logger.log(`OPENAPI on http://localhost:${port}/api`);
  });
}
bootstrap();
