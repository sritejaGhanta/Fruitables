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
  shipping = 100;
  constructor(
    private userService: UserService,
    private store: Store<any>,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.store.select('cart_data').subscribe((data: any) => {
      if (data != undefined && data != null) {
        if (Object.values(data) && Object.values(data).length > 0) {
          const filteredCartItems = Object.values(data).filter((item: any) => {
            if (typeof item !== 'string') {
              return item;
            }
          });
          this.cartData = filteredCartItems;
          const sum: any = filteredCartItems.reduce(
            (accumulator: any, currentValue: any) =>
              accumulator +
              currentValue.product_price * currentValue.product_qty,
            0
          );
          this.cartSubtotal = Number(sum.toFixed(2));
          this.cdr.detectChanges();
        }
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
    this.cartData = this.cartData.filter(
      (ele: any) => ele.product_id != item.product_id
    );
    let obj = {
      product_id: item.product_id.toString(),
      cart_iterm_id: item.cart_item_id,
    };
    this.userService.cartItemDelete(obj).subscribe();
    this.cdr.detectChanges();
  }

  checkoutOrder() {
    this.router.navigate(['/order']);
  }

  ngOnDestroy(): void {}
}
