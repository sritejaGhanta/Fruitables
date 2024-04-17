import { registerAs } from '@nestjs/config';

export default registerAs('rabbitMq', () => ({
  rmq_host: process.env.RABBITMQ_HOST,//'amqp://admin:admin@192.168.20.131:5672',
  rmq_connection_timeout: 3000,
  user_queue: 'user-queue',
}));