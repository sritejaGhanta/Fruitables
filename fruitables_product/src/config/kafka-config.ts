import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
  kafka_host: process.env.KAFKA_HOST,//'',
  kafka_connection_timeout: 3000,
}));