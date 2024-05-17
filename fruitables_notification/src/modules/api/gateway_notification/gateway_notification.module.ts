import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalModule } from 'src/modules/global/global.module';
import { GatewayNotificationController } from './gateway_notification.controller';

import { GatewayNotificationEmailExtendedService } from './services/extended/gateway_notification_email.extended.service';

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
    GatewayNotificationEmailExtendedService,
  ]
})
export default class GatewayNotificationModule {}
