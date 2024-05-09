import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { OwlOptions } from 'ngx-owl-carousel-o';
import {
  BrowserAnimationsModule,
  provideAnimations,
  provideNoopAnimations,
} from '@angular/platform-browser/animations';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../services/http/products/category.service';
import { ProductsService } from '../services/http/products/products.service';
import { OrderService } from '../services/http/order/order.service';
import { RattingComponentComponent } from '../genral-components/ratting-component/ratting-component.component';
import { Store } from '@ngrx/store';
import { AddToCartComponent } from '../modules/product/addToCart/add-to-cart.component';
import { filter } from 'rxjs';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    RouterModule,
    RattingComponentComponent,
    AddToCartComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [provideAnimations(), provideNoopAnimations()],
})
export class HomeComponent implements OnDestroy, OnInit {
  wishlistProduct: boolean = false;
  customOptions: OwlOptions = {
    autoplay: true,
    smartSpeed: 1500,
    center: false,
    dots: false,
    loop: true,
    margin: 25,
    nav: true,
    navText: [
      '<i class="bi bi-arrow-left"></i>',
      '<i class="bi bi-arrow-right"></i>',
    ],
    // responsiveClass: true,
    responsive: {
      0: {
        items: 1,
      },
      576: {
        items: 1,
      },
      768: {
        items: 2,
      },
      992: {
        items: 3,
      },
      1200: {
        items: 4,
      },
    },
  };

  clientSlider: OwlOptions = {
    autoplay: true,
    smartSpeed: 1500,
    center: false,
    dots: false,
    loop: true,
    margin: 60,
    nav: true,
    navText: [
      '<i class="bi bi-arrow-left"></i>',
      '<i class="bi bi-arrow-right"></i>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      700: {
        items: 2,
      },
    },
  };

  productCategorys: any[] = [];
  categoryWiseProducts: any = {};
  products: any[] = [];
  startIndexForVegitables: Number = 0;

  categorylistUnsubscribe: any;
  productlistUnsubscribe: any;
  dashboardProductsUnsubscribe: any;

  bestSellerProducts: any[] = [];
  productsReviewsCount: any = {};
  organicVegitables: any = [];
  topRatingsReviews: any[] = [];

  constructor(
    private categoryService: CategoryService,
    private productsService: ProductsService,
    private orderService: OrderService,
    private store: Store<any>,
    private cdr: ChangeDetectorRef
  ) {
    this.categorylistUnsubscribe = this.categoryService
      .list({ limit: 10000 })
      .subscribe((result: any) => {
        this.productCategorys = result.data;
        this.startIndexForVegitables = result.data[0]?.id;
      });
    this.dashboardProductsUnsubscribe = this.productsService
      .dashBoardProducts()
      .subscribe((result: any) => {
        result.data?.map((e: any) => {
          if (!this.categoryWiseProducts[e.product_category_id]) {
            this.categoryWiseProducts[e.product_category_id] = [];
          }
          this.categoryWiseProducts[e.product_category_id].push(e);
        });
      });
    this.productlistUnsubscribe = this.productsService
      .list({ limit: 10, filters: [{ key: 'product_category_id', value: 1 }] })
      .subscribe((result: any) => {
        this.products = result.data;
        let dashboardProducts: any = [];
        console.log(this.categoryWiseProducts);
        this.categoryWiseProducts?.['1'].map((ele: any) =>
          dashboardProducts.push(ele.id)
        );
        this.organicVegitables = result.data?.filter(
          (ele: any) => !dashboardProducts.includes(ele.id)
        );
      });
    this.productsService.productAndReviewCount().subscribe((data: any) => {
      this.productsReviewsCount = data.data;
    });
  }

  ngOnInit(): void {
    // this.categorylistUnsubscribe = this.categoryService
    //   .list({ limit: 10000 })
    //   .subscribe((result: any) => {
    //     this.productCategorys = result.data;
    //     this.startIndexForVegitables = result.data[0]?.id;
    //     this.cdr.detectChanges();
    //   });
    // this.dashboardProductsUnsubscribe = this.productsService
    //   .dashBoardProducts()
    //   .subscribe((result: any) => {
    //     // this.wishlistStoreData(result.data);
    //     result.data?.map((e: any) => {
    //       if (!this.categoryWiseProducts[e.product_category_id]) {
    //         this.categoryWiseProducts[e.product_category_id] = [];
    //       }
    //       this.categoryWiseProducts[e.product_category_id].push(e);
    //       this.cdr.detectChanges();
    //     });
    //   });
    // this.productlistUnsubscribe = this.productsService
    //   .list({ limit: 10, filters: [{ key: 'product_category_id', value: 1 }] })
    //   .subscribe((result: any) => {
    //     this.products = result.data;
    //     this.wishlistStoreData(result.data);
    //     this.cdr.detectChanges();
    //   });

    // this.productsService.productAndReviewCount().subscribe((data: any) => {
    //   this.productsReviewsCount = data.data;
    // });

    this.orderService.bestSellProducts().subscribe((data: any) => {
      this.bestSellerProducts = data.data.sort(
        (a: any, b: any) => b.rating - a.rating
      );
    });
    this.productsService.topRatingRewiews().subscribe((data: any) => {
      this.topRatingsReviews = data.data;
    });
  }

  // wishlistStoreData(products: any) {
  //   this.store.select('wishlist_data').subscribe((data: any) => {
  //     if (data != undefined && data != null) {
  //       if (Object.values(data) && Object.values(data).length > 0) {
  //         let filteredCartItems = Object.values(data).filter(
  //           (item: any) => typeof item !== 'string'
  //         );
  //         this.cdr.detectChanges();
  //         console.log(products);
  //         console.log(filteredCartItems);
  //         products.map((product_ele: any) => {
  //           filteredCartItems.map((in_ele: any) => {
  //             if (product_ele.id == in_ele.product_id) {
  //               this.wishlistProduct = true;
  //               let wishlistIcon: any = document.querySelector(
  //                 `.wishlist_${product_ele.id}`
  //               );
  //               console.log(wishlistIcon);
  //               wishlistIcon?.classList.remove('wishlist');
  //               wishlistIcon?.classList.add('filled');
  //               this.cdr.detectChanges();
  //             }
  //           });
  //         });
  //       }
  //     }
  //   });
  // }

  productAddtoCart(product: any) {
    let obj = {
      product_qty: 1,
    };
    this.productsService.productAddToCart(product, obj);
  }

  productAddtoWishlist(product: any) {
    let wishlistIcon: any = document.querySelector(`.wishlist_${product.id}`);
    console.log(wishlistIcon);
    if (wishlistIcon?.classList.contains('wishlist')) {
      this.wishlistProduct = true;
      wishlistIcon?.classList.remove('wishlist');
      wishlistIcon?.classList.add('filled');
    } else {
      this.wishlistProduct = false;
      wishlistIcon?.classList.remove('filled');
      wishlistIcon?.classList.add('wishlist');
    }
    let obj: any = {};
    if (this.wishlistProduct) {
      obj['product'] = product;
      obj['method'] = 'AddtoWishlist';
      this.productsService.productAddToWishlist(obj);
    } else {
      obj['product'] = product;
      obj['method'] = 'RemovetoWishlist';
      this.productsService.productAddToWishlist(obj);
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    // this.categorylistUnsubscribe.unsubsribe();
    // this.productlistUnsubscribe.unsubsribe();
    // this.dashboardProductsUnsubscribe.unsubsribe();
  }
}
