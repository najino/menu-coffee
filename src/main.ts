import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
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


  app.setGlobalPrefix(process.env.PREFIX);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: process.env.VERSION
  });


  app.enableCors({
    origin: "*",
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-type', 'Authorization'],
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const documentFactory = swaggerCreator(app);
  SwaggerModule.setup('doc', app, documentFactory);

  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public/' });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    logger.log(`server listening on http://localhost:${port}/${process.env.PREFIX}`);
    logger.log(`OPENAPI on http://localhost:${port}/doc`);
  });
}
bootstrap();
