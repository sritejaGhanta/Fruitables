import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../../services/http/products/products.service';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-add-to-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './add-to-cart.component.html',
  styleUrl: './add-to-cart.component.scss',
})
export class AddToCartComponent implements OnInit {
  @Input('productData') productData: any;
  goCartActive: boolean = false;
  productDetail: any;
  productQtyDetail: any = 1;
  cartProductsDetailData: any;
  productCartItemDetial: any;
  constructor(
    private productsService: ProductsService,
    private activatedRoute: ActivatedRoute,
    private store: Store<any>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productDetail = this.productData;
    this.cdr.detectChanges();

    this.store.select('cart_data').subscribe(async (data: any) => {
      if (data != undefined && data != null) {
        if (Object.values(data) && Object.values(data).length > 0) {
          const filteredCartItems = Object.values(data).filter(
            (item: any) => typeof item !== 'string'
          );

          if (filteredCartItems.length) {
            this.cartProductsDetailData = filteredCartItems;
            // this.cartItemQuantityUpdate();
            let cartListProducts: any = [];
            filteredCartItems.map((ele: any) => {
              cartListProducts.push(ele.product_id);
              if (this.productData?.id == ele.product_id) {
                this.productQtyDetail = ele.product_qty;
              }
            });
            // this.cartProducts = cartListProducts;
            // this.cdr.detectChanges();
            if (cartListProducts.includes(Number(this.productData?.id))) {
              this.goCartActive = true;
              this.cdr.detectChanges();
            }
          }
        }
      }
    });
  }

  productAddtoCart(product: any) {
    let obj = {
      product_qty: 1,
    };
    this.productsService.productAddToCart(product, obj);
  }

  addQuantity(qty: any, item: any) {
    let quantity = Number(qty.value);
    // if (quantity == 0) {
    //   this.buttonDisable = false;
    // }
    qty.value = quantity + 1;

    this.productsService.productAddQuantity('', '', '', item, '');
  }

  removeQuantity(qty: any, item: any) {
    console.log(item);
    let quantity = Number(qty.value);
    // if (quantity == 1) {
    //   this.buttonDisable = true;
    // }
    qty.value = quantity - 1;
    console.log(qty.value);
    if (qty.value == 0) {
      this.goCartActive = false;
      this.cdr.detectChanges();
      let obj = {
        product_id: item.id.toString(),
      };
      this.cartItemQuantityUpdate(item.id);
      console.log(this.productCartItemDetial);
      this.productsService.productRemoveFromCart(
        this.productCartItemDetial,
        obj
      );
    } else if (qty.value > 0) {
      this.productsService.productRemoveQuantity('', '', '', item, '');
    }
  }

  cartItemQuantityUpdate(productId: any) {
    this.cartProductsDetailData.map((ele: any) => {
      if (Number(productId) === ele.product_id) {
        this.productQtyDetail = ele.product_qty;
        this.productCartItemDetial = ele;
        this.goCartActive = false;
        this.cdr.detectChanges();
      }
    });
  }
}
