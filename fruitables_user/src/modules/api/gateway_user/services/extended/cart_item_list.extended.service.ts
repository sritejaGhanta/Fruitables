import { Injectable } from '@nestjs/common';

// import { rabbitmqProductConfig } from 'src/config/all-rabbitmq-core';
// import { Client, ClientProxy } from '@nestjs/microservices';
// import * as _ from 'lodash';

import { CartItemListService } from '../cart_item_list.service';

@Injectable()
export class CartItemListExtendedService extends CartItemListService {

  prepareData(inputParams){
    return {
      ids : inputParams.get_cart_item_list.map(e => e.ci_product_id)
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