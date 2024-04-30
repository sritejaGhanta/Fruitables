import { Injectable } from '@angular/core';
import { CommonHttpClintService } from '../common.http.clint';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: CommonHttpClintService) {}

  add(params: any = {}) {
    return this.http.post('f-order/api/gateway_order/order-add', params, true);
  }
  list(params: any = {}) {
    return this.http.post('f-order/api/gateway_order/order-list', params, true);
  }
  detials(id: number, params: any = {}) {
    return this.http.post(
      'f-order/api/gateway_order/order-details/' + id,
      params,
      true
    );
  }

  cancel(id: number, params: any = {}) {
    return this.http.post(
      'f-order/api/gateway_order/cancel-order/' + id,
      params,
      true
    );
  }

  bestSellProducts(id: number, params: any = {}) {
    return this.http.get(
      'f-order/api/gateway_order/get-bestseller-products',
      params,
      true
    );
  }
}
