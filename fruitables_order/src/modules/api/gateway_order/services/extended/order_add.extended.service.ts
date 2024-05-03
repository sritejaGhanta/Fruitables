import { Injectable } from '@nestjs/common';

import { OrderAddService } from '../order_add.service';

@Injectable()
export class OrderAddExtendedService extends OrderAddService {


  prepareOrder(inputParams){
    let shipping_const = 50;
    let total_products_const = 0;
    inputParams.get_cart_items_list?.map(e => {
      total_products_const += (Number(e.product_qty) * Number(e.product_price))
    })
    return { shipping_const, total_products_const, total_cost: shipping_const + total_products_const};
  }
}