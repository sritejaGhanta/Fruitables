import { Transport, RmqOptions } from '@nestjs/microservices';
import rabbitMq from './rabbitmq-config';

export const rabbitmqProductConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [rabbitMq().rmq_host],
    queue: rabbitMq().user_queue,
    queueOptions: {
      durable: true
    },
  },
};