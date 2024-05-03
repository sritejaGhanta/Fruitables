import { Transport, RmqOptions } from '@nestjs/microservices';
import rabbitMq from './rabbitmq-config';

export const rabbitmqProductConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [rabbitMq().rmq_host],
    queue: rabbitMq().product_queue,
    queueOptions: {
      durable: true
    },
  },
};
export const rabbitmqOrderConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [rabbitMq().rmq_host],
    queue: rabbitMq().order_queue,
    queueOptions: {
      durable: true
    },
  },
};
export const rabbitmqUserConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [rabbitMq().rmq_host],
    queue: rabbitMq().user_queue,
    queueOptions: {
      durable: true
    },
  },
};