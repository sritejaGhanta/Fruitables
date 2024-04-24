import { Injectable } from '@angular/core';
import { CommonHttpClintService } from '../common.http.clint';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: CommonHttpClintService) {}

  details(id: any) {
    return this.http.get(`f-user/api/gateway_user/user-details/${id}`);
  }
  update(params: any = {}, id: any) {
    return this.http.put(
      `f-user/api/gateway_user/user-update/${id}`,
      params,
      true
    );
  }

  cartItemAdd(params: any = {}) {
    return this.http.postTeja('api/gateway_user/cart-item-add', params, true);
  }

  cartItemList(params: any = {}) {
    return this.http.postTeja('api/gateway_user/cart-item-list', params, true);
  }

  cartItemDelete(params: any = {}) {
    console.log(params);
    return this.http.deleteTeja(
      `f-user/api/gateway_user/cart-item-delete/${params.cart_iterm_id}`,
      params,
      true
    );
  }
}
