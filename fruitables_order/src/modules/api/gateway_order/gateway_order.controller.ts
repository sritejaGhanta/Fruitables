import {
  Controller,
  UseFilters,
  Post,
  Req,
  Request,
  Body,
  Param,
  Get,
  Query,
} from '@nestjs/common';

import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
import { CancelOrderService } from './services/cancel_order.service';
import { GetBestsellerProductsExtendedService } from './services/extended/get_bestseller_products.extended.service';
import { OrderAddExtendedService } from './services/extended/order_add.extended.service';
import { OrderDetailsExtendedService } from './services/extended/order_details.extended.service';
import { OrderListExtendedService } from './services/extended/order_list.extended.service';
import { CancelOrderDto, CancelOrderParamDto } from './dto/cancel_order.dto';
import { OrderAddDto } from './dto/order_add.dto';
import { OrderDetailsDto, OrderDetailsParamDto } from './dto/order_details.dto';
import { OrderListDto } from './dto/order_list.dto';

@Controller()
@UseFilters(HttpExceptionFilter)
export class GatewayOrderController {
  constructor(
    protected readonly general: CitGeneralLibrary,
    private cancelOrderService: CancelOrderService,
    private getBestsellerProductsService: GetBestsellerProductsExtendedService,
    private orderAddService: OrderAddExtendedService,
    private orderDetailsService: OrderDetailsExtendedService,
    private orderListService: OrderListExtendedService,
  ) {}

  @Post('cancel-order/:id')
  async cancelOrder(
    @Req() request: Request,
    @Param() param: CancelOrderParamDto,
    @Body() body: CancelOrderDto,
  ) {
    const params = { ...param, ...body };
    return await this.cancelOrderService.startCancelOrder(request, params);
  }

  @Get('get-bestseller-products')
  async getBestsellerProducts(@Req() request: Request, @Query() query) {
    const params = { ...query };
    return await this.getBestsellerProductsService.startGetBestsellerProducts(
      request,
      params,
    );
  }

  @Post('order-add')
  async orderAdd(@Req() request: Request, @Body() body: OrderAddDto) {
    const params = body;
    return await this.orderAddService.startOrderAdd(request, params);
  }

  @Post('order-details/:id')
  async orderDetails(
    @Req() request: Request,
    @Param() param: OrderDetailsParamDto,
    @Body() body: OrderDetailsDto,
  ) {
    const params = { ...param, ...body };
    return await this.orderDetailsService.startOrderDetails(request, params);
  }

  @Post('order-list')
  async orderList(@Req() request: Request, @Body() body: OrderListDto) {
    const params = body;
    return await this.orderListService.startOrderList(request, params);
  }
}
