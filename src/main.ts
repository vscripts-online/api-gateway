import * as fs from 'node:fs';
import { config } from 'dotenv';
config();

process.on('uncaughtException', (err) => {
  console.log('uncaughtException');
  console.log(err);
});

import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PORT } from './common/config';
import { UploadBodyRequestDTO } from './modules/upload/upload.request.dto';
import { GrpcExceptionsFilter } from './filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GrpcExceptionsFilter(httpAdapter));

  const config = new DocumentBuilder()
    .setTitle('vscripts.online/cdn')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [UploadBodyRequestDTO],
  });
  SwaggerModule.setup('api', app, document);

  app.enableShutdownHooks();
  app.enableCors({ origin: '*' });

  await app.listen(parseInt(PORT), '0.0.0.0');
  fs.writeFileSync('document.json', JSON.stringify(document, null, 2));
}
bootstrap();
