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
    inputParams.external_api?.map((e) => {
      address[e.id] = e;
    });
    inputParams.get_order_list?.map((e) => {
      let p = address[e.o_user_address_id];
      e.a_land_mark = p.land_mark;
      e.a_address = p.address;
      e.a_state_name = p.state_name;
      e.a_country_name = p.country_name;
      e.a_c_name = p.first_name + ' ' + p.last_name;
      e.a_c_email = p.email;
      e.a_c_phone_number = p.dial_code + ' ' + p.phone_number;
      e.a_c_company_name = p.company_name;
    });
  }
}
