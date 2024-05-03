import { Transport, RmqOptions } from '@nestjs/microservices';
import rabbitMq from './rabbitmq-config';

export const rabbitmqNotificationConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [rabbitMq().rmq_host],
    queue: rabbitMq().notification_queue,
    queueOptions: {
      durable: true,
    },
  },
};
export const rabbitmqProductConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [rabbitMq().rmq_host],
    queue: rabbitMq().product_queue,
    queueOptions: {
      durable: true,
    },
  },
};
export const rabbitmqUserConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [rabbitMq().rmq_host],
    queue: rabbitMq().user_queue,
    queueOptions: {
      durable: true,
    },
  },
};
