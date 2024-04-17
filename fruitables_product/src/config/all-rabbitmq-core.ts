import { Transport, RmqOptions } from '@nestjs/microservices';
import rabbitMq from './rabbitmq-config';

export const rabbitmqUserConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [rabbitMq().rmq_host],
    queue: rabbitMq().product_queue,
    queueOptions: {
      durable: true
    },
  },
};