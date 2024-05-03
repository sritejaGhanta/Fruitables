import { registerAs } from '@nestjs/config';

export default registerAs('rabbitMq', () => ({
  rmq_host: process.env.RABBITMQ_HOST, //'localhost:5432',
  rmq_connection_timeout: 3000,
  notification_queue: 'notification-queue',
  product_queue: 'product-queue',
  order_queue: 'order-queue',
}));
