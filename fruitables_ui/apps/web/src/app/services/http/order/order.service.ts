import { Injectable } from '@angular/core';
import { CommonHttpClintService } from '../common.http.clint';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: CommonHttpClintService) {}

  add(params: any = {}) {
    return this.http.post(
      'f-order/api/gateway_order/order-add',
      params,
      true
    );
  }
}
