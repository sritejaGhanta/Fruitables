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
    return this.http.post(
      'f-user/api/gateway_user/cart-item-add',
      params,
      true
    );
    // return this.http.postTeja('api/gateway_user/cart-item-add', params, true);
  }

  cartItemList(params: any = {}) {
    return this.http.post(
      'f-user/api/gateway_user/cart-item-list',
      params,
      true
    );

    // return this.http.postTeja('api/gateway_user/cart-item-list', params, true);
  }

  cartItemDelete(id: number, params: any = {}) {
    return this.http.delete(
      `f-user/api/gateway_user/cart-item-delete/` + id,
      params,
      true
    );
  }

  addressAdd(params: any = {}) {
    return this.http.post(
      `f-user/api/gateway_user/user-address-add`,
      params,
      true
    );
  }

  addressUpdate(id: number, params: any = {}) {
    return this.http.put(
      `f-user/api/gateway_user/user-address-update/` + id,
      params,
      true
    );
  }

  addressDelete(id: number, params: any = {}) {
    return this.http.delete(
      `f-user/api/gateway_user/user-address-delete/` + id,
      params,
      true
    );
  }

  addressList(params: any = {}) {
    return this.http.post(
      `f-user/api/gateway_user/user-address-list`,
      params,
      true
    );
  }

  wishlistAddorRemove(params: any = {}) {
    return this.http.post(`f-user/api/gateway_user/wishlist`, params, true);
  }

  wishlistData() {
    return this.http.post(`f-user/api/gateway_user/wishlist-list`, {}, true);
  }
}
