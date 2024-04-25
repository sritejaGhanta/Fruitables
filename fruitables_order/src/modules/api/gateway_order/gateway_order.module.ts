import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalModule } from 'src/modules/global/global.module';
import { GatewayOrderController } from './gateway_order.controller';

import { CancelOrderService } from './services/cancel_order.service';
import { OrderAddExtendedService } from './services/extended/order_add.extended.service';
import { OrderDetailsExtendedService } from './services/extended/order_details.extended.service';
import { OrderListExtendedService } from './services/extended/order_list.extended.service';

import { OrdersEntity } from 'src/entities/orders.entity';
import { OrderItemEntity } from 'src/entities/order-item.entity';

@Module({
  imports: [
    GlobalModule,
    TypeOrmModule.forFeature([
      OrdersEntity,
      OrderItemEntity,
    ])
  ],
  controllers: [GatewayOrderController],
  providers: [
    CancelOrderService,
    OrderAddExtendedService,
    OrderDetailsExtendedService,
    OrderListExtendedService,
  ]
})
export default class GatewayOrderModule {}
