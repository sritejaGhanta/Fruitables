import { Injectable } from '@nestjs/common';

import { OrderListService } from '../order_list.service';

@Injectable()
export class OrderListExtendedService extends OrderListService {
  prepareData(inputParams) {
    return {
      a_ids: inputParams.get_order_list?.map((e) => e.o_user_address_id),
    };
  }

  prepareOutputData(inputParams) {
    let address = {};
    let products = {};

    inputParams.get_product_list?.map((e) => {
      products[e.id] = e;
    });

    inputParams.external_api?.map((e) => {
      address[e.id] = e;
    });

    inputParams.get_order_list?.map((e, k) => {
      let p = address[e.o_user_address_id];
      e.a_land_mark = p.land_mark;
      e.a_address = p.address;
      e.a_state_name = p.state_name;
      e.a_country_name = p.country_name;
      e.a_c_name = p.first_name + ' ' + p.last_name;
      e.a_c_phone_number = p.dial_code + ' ' + p.phone_number;
      e.product_ids =
        e.product_ids?.map((ee, k) => {
          return {
            ...products[ee],
            order_qty: e.quantity[k],
          };
        }) || [];
      e.product_ids = e.product_ids.reverse();
      inputParams.get_order_list[k] = e;
    });
  }

  prepareProductIds(inputParams) {
    let ids = [];

    inputParams.get_order_list.map((e) => {
      ids.push(...e.product_ids);
    });
    return {
      p_ids: [...new Set(ids)],
    };
  }
}
