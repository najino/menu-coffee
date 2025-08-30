import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerCreator(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Coffee')
    .setDescription('The API for Coffee Landing')
    .setVersion('1.0')
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-AUTH',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  return documentFactory;
}
