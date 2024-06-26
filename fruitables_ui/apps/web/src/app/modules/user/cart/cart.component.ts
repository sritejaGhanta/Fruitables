import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/http/user/user.service';
import { Store } from '@ngrx/store';
import { Router, RouterLink } from '@angular/router';
import { UserApiActions } from '../../../services/state/user/user.action';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../services/http/products/products.service';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit, OnDestroy {
  cartData: any;
  cartSubtotal: any;
  shipping = 50;
  buttonDisable: boolean = false;
  cartEmptyStatus = false;
  constructor(
    private userService: UserService,
    private store: Store<any>,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private toast: NgToastService,
    private productsService: ProductsService
  ) {}

  ngAfterContentInit(): void {
    window.scroll(0, 0);
  }

  ngOnInit(): void {
    this.store.select('cart_data').subscribe((data: any) => {
      console.log(data);

      if (data != undefined && data != null) {
        if (Object.values(data) && Object.values(data).length > 0) {
          this.cartEmptyStatus = false;
          this.cdr.detectChanges();

          const filteredCartItems = Object.values(data).filter(
            (item: any) => typeof item !== 'string'
          );

          this.cartData = filteredCartItems;
          const sum: any = filteredCartItems.reduce(
            (accumulator: any, currentValue: any) =>
              accumulator +
              currentValue.product_price * currentValue.product_qty,
            0
          );
          this.cartSubtotal = Number(sum.toFixed(2));
          this.cdr.detectChanges();
        } else {
          this.cartData = [];
          this.cartEmptyStatus = true;
          this.cdr.detectChanges();
        }
      } else {
        this.cartData = [];
        this.cdr.detectChanges();
      }
    });
  }

  addQuantity(qty: any, price: any, total_price: any, item: any) {
    return this.productsService.productAddQuantity(
      qty,
      price,
      total_price,
      item,
      this.cartSubtotal
    );
  }
  removeQuantity(qty: any, price: any, total_price: any, item: any) {
    return this.productsService.productRemoveQuantity(
      qty,
      price,
      total_price,
      item,
      this.cartSubtotal
    );
  }

  deleteProductItem(item: any, total_price: any) {
    let productTotalPrice = total_price.innerText.replace('$', '');
    this.cartSubtotal = this.cartSubtotal - productTotalPrice;
    this.cartSubtotal = this.cartSubtotal;
    // this.cartData = this.cartData.filter(
    //   (ele: any) => ele.product_id != item.product_id
    // );
    console.log(item.insert_id);
    // let store_obj: any = {};
    if ('cart_item_id' in item || 'insert_id' in item) {
      // store_obj['detele_product'] = item.product_id;

      let obj = {
        product_id: item.product_id.toString(),
      };
      this.userService
        .cartItemDelete(item.cart_item_id || item.insert_id, obj)
        .subscribe((data: any) => {
          console.log(data);
          this.store.dispatch(
            UserApiActions.cartdata({
              detele_product: item.product_id,
            })
          );
        });
      this.cdr.detectChanges();
    }
  }

  checkoutOrder() {
    this.router.navigate(['/checkout']);
  }

  ngOnDestroy(): void {}
}
