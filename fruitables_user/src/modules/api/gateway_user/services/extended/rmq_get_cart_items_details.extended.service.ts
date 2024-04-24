import { Injectable } from '@nestjs/common';

import { RmqGetCartItemsDetailsService } from '../rmq_get_cart_items_details.service';

@Injectable()
export class RmqGetCartItemsDetailsExtendedService extends RmqGetCartItemsDetailsService {

  prepareData(inputParams){
    return {
      p_ids : inputParams.get_cart_item_list.map(e => e.ci_product_id)
    }
  }

  prepareOutputData(inputParams) {
    let products = {};
    inputParams.call_product_list?.map((e) => {
      products[e.id] = e;
    });

    inputParams.get_cart_item_list.map((e) => {
      let p = products[e.ci_product_id];
      e.p_product_name = p.product_name;
      e.product_price = p.product_cost;
      e.p_product_image = p.product_image;
      e.product_rating = p.rating;
    });

  }
}