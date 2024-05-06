import { Injectable } from '@nestjs/common';

import { GatewayNotificationEmailService } from '../gateway_notification_email.service';

@Injectable()
export class GatewayNotificationEmailExtendedService extends GatewayNotificationEmailService {
  getProductDetails(inputParams) {
    let products = [];
    inputParams.get_rmq_product_details.map((ele: any, index: any) => {
      inputParams.get_orders_item_details.map((order_ele: any) => {
        if (order_ele.oi_product_id == ele.product_id) {
          let res = `<tr style="border:1px solid black;border-collapse: collapse;"><td style="text-align: center;">${
            index + 1
          }</td><td style="border:1px solid black;border-collapse: collapse;">${
            ele.product_name
          }</td><td style="border:1px solid black;border-collapse: collapse;text-align: center;">$ ${order_ele.oi_price.toFixed(
            2,
          )}</td><td style="border:1px solid black;border-collapse: collapse;text-align: center;">${
            order_ele.oi_order_qty
          }</td><td style="border:1px solid black;border-collapse: collapse;">$ ${order_ele.oi_total_price.toFixed(
            2,
          )}</td></tr>`;

          // <td style="border:1px solid black;border-collapse: collapse"><img width="200px" src="http://localhost:3069/public/upload/product_images/banana.jpg"/></td>

          products.push(res);
        }
      });
    });
    let res_product_data = products.join('');
    let res_data = `<table style="border:1px solid black;border-collapse: collapse;width:650px"><thead style="border:1px solid black;border-collapse: collapse;"><tr><th>S.NO.</th><th style="border:1px solid black;border-collapse: collapse">Product Name</th><th style="border:1px solid black;border-collapse: collapse">Product Price</th><th style="border:1px solid black;border-collapse: collapse">Product Quantity</th><th style="border:1px solid black;border-collapse: collapse">Total Cost</th></tr ></thead><tbody>${res_product_data}<tr style="border:1px solid black;border-collapse: collapse;"><td colspan="4">Shipping Cost: </td><td style="border:1px solid black;border-collapse: collapse;">$ 50.00</td></tr><tr style="border:1px solid black;border-collapse: collapse;"><td colspan="4" >Total Amount: </td><td style="border:1px solid black;border-collapse: collapse;">$ ${inputParams.get_user_order_details.order_total_cost.toFixed(
      2,
    )}</td></tr></tbody></table>`;

    // <th style="border:1px solid black;border-collapse: collapse">Product Image</th>

    return { product_data: res_data };
  }

  getUserAddress(inputParams) {
    let resAddress = '';
    let userAddress = inputParams.get_order_details.get_user_address;

    let res_obj = {
      land_mark: userAddress.land_mark,
      address: userAddress.address,
      first_name: userAddress.first_name,
      last_name: userAddress.last_name,
      email: userAddress.email,
      company_name: userAddress.company_name,
      phone_number: userAddress.dial_code + '-' + userAddress.phone_number,
      state_name: userAddress.state_name,
      countr_name: userAddress.countr_name,
      pin_code: userAddress.pin_code,
    };
    resAddress = Object.values(res_obj).join(' ');

    return { user_address: resAddress };
  }

  getEmailDetails(inputparams) {
    let obj = {};

    obj['email_sent_email'] = inputparams.get_rmq_user_details.email;
    obj['email_customer_name'] =
      inputparams.get_rmq_user_details.first_name +
      ' ' +
      inputparams.get_rmq_user_details.last_name;
    obj['email_order_id'] = inputparams.get_user_order_details.order_id;
    obj['email_order_date'] =
      inputparams.get_user_order_details.order_createdAt;
    obj['email_amount'] = inputparams.get_user_order_details.order_total_cost;
    obj['email_table_data'] = inputparams.product_data;
    obj['email_address'] = inputparams.user_address;
    obj['email_compnay_name'] = 'Fruitables';
    obj['email_order_status'] = inputparams.get_user_order_details.order_status;

    return obj;
  }
}
