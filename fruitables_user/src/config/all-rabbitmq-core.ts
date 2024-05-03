import { Transport, RmqOptions } from '@nestjs/microservices';
import rabbitMq from './rabbitmq-config';

export const rabbitmqProductConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [rabbitMq().rmq_host],
    queue: 'product-queue',
    queueOptions: {
      durable: true,
    },
  },
};
