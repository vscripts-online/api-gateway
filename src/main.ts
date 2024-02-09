import { config } from 'dotenv';
config();

process.on('uncaughtException', (err) => {
  console.log('uncaughtException');
  console.log(err);
  console.log(err.stack);
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './common/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableShutdownHooks();
  app.enableCors({ origin: '*' });

  await app.listen(parseInt(PORT), '0.0.0.0');
}
bootstrap();
