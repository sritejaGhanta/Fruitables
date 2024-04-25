import { Injectable } from '@nestjs/common';

import { OrderListService } from '../order_list.service';

@Injectable()
export class OrderListExtendedService extends OrderListService {


  prepareData(inputParams){
    return {
      a_ids : inputParams.get_order_list?.map(e => e.o_user_address_id)
    }
  }

  prepareOutputData(inputParams) {
    let address = {};
    inputParams.external_api?.map((e) => {
      address[e.id] = e;
    });
    inputParams.get_order_list?.map((e) => {
      let p = address[e.o_user_address_id];
      e.a_land_mark = p.land_mark;
      e.a_address = p.address;
      e.a_state_name = p.state_name;
      e.a_countr_name = p.countr_name;
      e.a_pin_code = p.pin_code;
    });
  }
}