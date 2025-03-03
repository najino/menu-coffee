import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const session = require('express-session');
import { ValidationPipe } from '@nestjs/common';
import { CreateSession } from './config/session.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express'
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // init Application
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT ?? 3000;

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  // setup session config
  CreateSession(app)
  // lestening to Project

  const config = new DocumentBuilder()
    .setTitle('Cofee')
    .setDescription('The API for Cofee Landing')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: "/public/" })

  await app.listen(port, () => {

    console.log(`server listening on http://localhost:${port}`);
    console.log(`OPENAPI on http://localhost:${port}/api`);
  });
}
bootstrap();
