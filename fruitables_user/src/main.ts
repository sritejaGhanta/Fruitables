import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import 'winston-daily-rotate-file';
import * as compression from 'compression';
import * as express from 'express';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
dotenv.config();
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from './utilities/custom-logger';


async function bootstrap() {
  const app: any = await NestFactory.create(AppModule);
  
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use('/public', express.static('public'));
  app.use(compression());
  app.use(helmet());
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  
  const configService = app.get(ConfigService);
  const logger = new CustomLogger(configService);
  app.useLogger(logger);
  await app.listen(configService.get('app.apiPort'));
}
bootstrap();