// import * as fs from 'node:fs';
import { config } from 'dotenv';
config();

process.on('uncaughtException', (err) => {
  console.log('uncaughtException');
  console.log(err);
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './common/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('vscripts.online/cdn')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableShutdownHooks();
  app.enableCors({ origin: '*' });

  await app.listen(parseInt(PORT), '0.0.0.0');
  // fs.writeFileSync('document.json', JSON.stringify(document, null, 2));
}
bootstrap();
