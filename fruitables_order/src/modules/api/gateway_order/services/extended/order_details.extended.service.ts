import { Injectable } from '@nestjs/common';

import { OrderDetailsService } from '../order_details.service';

@Injectable()
export class OrderDetailsExtendedService extends OrderDetailsService {

  prepareData(inputParams){
    return {
      p_ids : [...new Set(inputParams.get_order_item_details.map(e => e.oi_product_id))]
    }
  }

  prepareOutputData(inputParams) {
    let products = {};
    inputParams.call_product_list?.map((e) => {
      products[e.id] = e;
    });

    inputParams.get_order_item_details.map((e) => {
      let p = products[e.oi_product_id];
      e.p_product_name = p.product_name;
      e.product_price = p.product_cost;
      e.p_product_image = p.product_image;
      e.product_rating = p.rating;
    });

  }
}
