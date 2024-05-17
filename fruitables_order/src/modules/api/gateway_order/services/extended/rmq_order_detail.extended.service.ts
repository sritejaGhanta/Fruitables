import { Injectable } from '@nestjs/common';

import { RmqOrderDetailService } from '../rmq_order_detail.service';

@Injectable()
export class RmqOrderDetailExtendedService extends RmqOrderDetailService {

  getProductIds(inputParams){
   let productIds = [];
      productIds = inputParams.get_orders_item_details.map(
        (ele: any) => ele.oi_product_id,
      );
  
      return { ids: productIds };
  }
}