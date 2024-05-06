import { ChangeDetectorRef, Injectable } from '@angular/core';
import { CommonHttpClintService } from '../common.http.clint';
import { Store } from '@ngrx/store';
import { UserApiActions } from '../../state/user/user.action';
import { UserService } from '../user/user.service';
import { LocalStorage } from '../../localStorage/localstorage.services';
import { Environment } from 'apps/web/src/environment/environment';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';

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
    private router: Router,
    private toast: NgToastService
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
      params
    );
  }

  dashBoardProducts() {
    return this.http.post(
      'f-product/api/gateway_product/dashboard-products',
      {}
    );
  }

  productReviewAdd(params: any = {}) {
    return this.http.post(
      'f-product/api/gateway_product/product-reviews-add',
      params,
      true
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
    let totalPrice = Number(qty.value * itemPrice);
    let number = totalPrice.toFixed(2);
    total_price.innerText = '$' + number.toLocaleString();
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
    let totalPrice = Number(qty.value * itemPrice);
    let number = totalPrice.toFixed(2);
    total_price.innerText = '$' + number.toLocaleString();
    cartSubtotal = Number(cartSubtotal - Number(itemPrice));
    let obj = {
      product_id: item.product_id,
      product_qty: -1,
      quantity: 'dec',
    };
    this.store.dispatch(UserApiActions.cartdata(obj));
    this.userService.cartItemAdd(obj).subscribe();
  }

  productAddToCart(productData: any = {}, qty: any = {}) {
    if ('id' in productData) {
      let resObj: any = {
        product_id: productData.id,
        product_image: productData.product_image,
        product_name: productData.product_name,
        product_price: productData.product_cost,
        product_qty: qty.product_qty || '',
        product_rating: productData.rating,
        method: 'AddtoCart',
      };
      let obj = {
        product_id: productData.id,
        product_qty: qty.product_qty,
      };
      let accessTokenData = this.ls.get(this.env.TOKEN_KEY);
      if (accessTokenData != undefined) {
        if (Math.ceil(Date.now() / 1000) < accessTokenData.exp) {
          this.userService.cartItemAdd(obj).subscribe((data: any) => {
            console.log(data.data);
            if (data.data.insert_id != '') {
              this.toast.success({
                detail: 'Success message',
                summary: 'Item added into Cart',
              });
              resObj['insert_id'] = data.data.insert_id;
              this.store.dispatch(UserApiActions.cartdata(resObj));
            }
          });
        } else {
          this.ls.remove(this.env.TOKEN_KEY);
          this.router.navigate(['/auth/login']);
        }
      } else {
        this.router.navigate(['/auth/login']);
      }
    }
  }

  productAddToWishlist(productData: any = {}) {
    if ('product_id' in productData.product || 'id' in productData.product) {
      let resObj: any = {
        product_id: productData.product.product_id || productData.product.id,
        product_image: productData.product.product_image,
        product_name: productData.product.product_name,
        product_price:
          productData.product.product_cost || productData.product.product_price,
        product_rating:
          productData.product.rating || productData.product.product_rating,
        method: productData.method,
      };
      let obj = {
        product_id: productData.product.product_id || productData.product.id,
      };
      let accessTokenData = this.ls.get(this.env.TOKEN_KEY);
      if (accessTokenData != undefined) {
        if (Math.ceil(Date.now() / 1000) < accessTokenData.exp) {
          this.userService.wishlistAddorRemove(obj).subscribe((data: any) => {
            this.toast.success({
              detail: 'Success message',
              summary: data?.settings?.message,
            });
            this.store.dispatch(UserApiActions.wishlistdata(resObj));
          });
        } else {
          this.ls.remove(this.env.TOKEN_KEY);
          this.router.navigate(['/auth/login']);
        }
      } else {
        this.router.navigate(['/auth/login']);
      }
    }
  }

  productAndReviewCount() {
    return this.http.get(
      `f-product/api/gateway_product/get-product-and-reviews-count`
    );
  }

  topRatingRewiews(params: any = {}) {
    return this.http.get(
      'f-product/api/gateway_product/get-top-ratings',
      params,
      true
    );
  }
}
