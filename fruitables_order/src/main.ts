import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { KafkaOptions, RmqOptions, Transport } from '@nestjs/microservices';
import 'winston-daily-rotate-file';
import * as compression from 'compression';
import * as express from 'express';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
dotenv.config();
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from './utilities/custom-logger';

import rabbitMq from './config/rabbitmq-config';
async function bootstrap() {
  const app: any = await NestFactory.create(AppModule);

  const rabbitMQOrderMicroConfig: RmqOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [...`${rabbitMq().rmq_host}`.split(',')],
      queue: 'order-queue',
      queueOptions: {
        durable: true,
      },
    },
  };
  app.connectMicroservice(rabbitMQOrderMicroConfig);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use('/public', express.static('public'));
  app.use(compression());
  app.use(helmet());
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  await app
    .startAllMicroservices()
    .then((ele) => console.log('all microservices started'));
  const configService = app.get(ConfigService);
  const logger = new CustomLogger(configService);
  app.useLogger(logger);
  await app.listen(configService.get('app.apiPort'));
}
bootstrap();
