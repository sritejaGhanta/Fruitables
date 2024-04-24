import { ChangeDetectorRef, Injectable } from '@angular/core';
import { CommonHttpClintService } from '../common.http.clint';
import { Store } from '@ngrx/store';
import { UserApiActions } from '../../state/user/user.action';
import { UserService } from '../user/user.service';
import { LocalStorage } from '../../localStorage/localstorage.services';
import { Environment } from 'apps/web/src/environment/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(
    private http: CommonHttpClintService,
    private store: Store<any>,
    private userService: UserService,
    private ls: LocalStorage,
    private env: Environment,
    private router: Router
  ) {}

  list(params: any = {}) {
    return this.http.post(
      'f-product/api/gateway_product/products-list',
      params
    );
  }

  productDetails(id: any) {
    return this.http.get(
      `f-product/api/gateway_product/products-details/${id}`
    );
  }

  productReview(params: any = {}) {
    return this.http.post(
      'f-product/api/gateway_product/product-review-list',
      params,
      true
    );
  }

  dashBoardProducts() {
    return this.http.post(
      'f-product/api/gateway_product/dashboard-products',
      {}
    );
  }

  productAddQuantity(
    qty: any,
    price: any,
    total_price: any,
    item: any,
    cartSubtotal: any
  ) {
    let quantity = Number(qty.value);
    qty.value = quantity + 1;
    let itemPrice = price.innerText.replace('$', '');
    let totalPrice = qty.value * itemPrice;

    total_price.innerText = '$' + Number(totalPrice.toFixed(2));
    cartSubtotal = Number(cartSubtotal) + Number(itemPrice);
    let obj = {
      product_id: item.product_id,
      product_qty: 1,
      quantity: 'inc',
    };

    this.store.dispatch(UserApiActions.cartdata(obj));
    this.userService.cartItemAdd(obj).subscribe();
  }

  productRemoveQuantity(
    qty: any,
    price: any,
    total_price: any,
    item: any,
    cartSubtotal: any
  ) {
    let quantity = Number(qty.value);
    qty.value = quantity - 1;
    let itemPrice = price.innerText.replace('$', '');
    let totalPrice = qty.value * itemPrice;
    total_price.innerText = '$' + Number(totalPrice.toFixed(2));

    cartSubtotal = Number(cartSubtotal - Number(itemPrice));
    let obj = {
      product_id: item.product_id,
      product_qty: -1,
      quantity: 'dec',
    };
    this.store.dispatch(UserApiActions.cartdata(obj));
    this.userService.cartItemAdd(obj).subscribe();
  }

  productAddToCart(obj: any = {}) {
    this.productDetails(obj.product_id).subscribe((ele: any) => {
      if ('id' in ele.data) {
        let productData = ele.data;
        let resObj = {
          product_id: productData.id,
          product_image: productData.product_image,
          product_name: productData.product_name,
          product_price: productData.product_cost,
          product_qty: obj.product_qty,
          product_rating: productData.rating,
          method: 'AddtoCart',
        };
        let accessTokenData = this.ls.get(this.env.TOKEN_KEY);
        if (accessTokenData != undefined) {
          if (Math.ceil(Date.now() / 1000) < accessTokenData.exp) {
            this.store.dispatch(UserApiActions.cartdata(resObj));
            this.userService.cartItemAdd(obj).subscribe();
          } else {
            this.ls.remove(this.env.TOKEN_KEY);
            this.router.navigate(['/auth/login']);
          }
        } else {
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }
}