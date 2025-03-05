import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // init Application
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT ?? 3000;

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  // listening to Project
  const config = new DocumentBuilder()
    .setTitle('Coffee')
    .setDescription('The API for Coffee Landing')
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
