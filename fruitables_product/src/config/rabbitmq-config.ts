import { registerAs } from '@nestjs/config';

export default registerAs('rabbitMq', () => ({
  rmq_host: process.env.RABBITMQ_HOST,//'localhost:5432',
  rmq_connection_timeout: 3000,
  product_queue: 'product-queue',
}));