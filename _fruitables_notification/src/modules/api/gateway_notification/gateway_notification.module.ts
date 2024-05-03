import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalModule } from 'src/modules/global/global.module';
import { GatewayNotificationController } from './gateway_notification.controller';

import { GatewayNotificationEmailService } from './services/gateway_notification_email.service';

import { GatewayNotificationEntity } from 'src/entities/gateway-notification.entity';

@Module({
  imports: [
    GlobalModule,
    TypeOrmModule.forFeature([
      GatewayNotificationEntity,
    ])
  ],
  controllers: [GatewayNotificationController],
  providers: [
    GatewayNotificationEmailService,
  ]
})
export default class GatewayNotificationModule {}
