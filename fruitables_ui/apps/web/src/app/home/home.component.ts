import {
  AfterContentInit,
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
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    RouterModule,
    RattingComponentComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [provideAnimations(), provideNoopAnimations()],
})
export class HomeComponent implements OnDestroy, OnInit {
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

  bestSellerProducts: any = [];

  constructor(
    private categoryService: CategoryService,
    private productsService: ProductsService,
    private orderService: OrderService
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
      .list({ limit: 1000 })
      .subscribe((result: any) => {
        this.products = result.data;
      });
    this.orderService.bestSellProducts().subscribe((data: any) => {
      this.bestSellerProducts = data.data.sort(
        (a: any, b: any) => b.rating - a.rating
      );
    });
  }

  ngOnInit(): void {}

  productAddtoCart(id: any) {
    let obj = {
      product_id: id,
      product_qty: 1,
      method: 'AddtoCart',
    };

    this.productsService.productAddToCart(obj);
  }

  ngOnDestroy(): void {
    // this.categorylistUnsubscribe.unsubsribe();
    // this.productlistUnsubscribe.unsubsribe();
    // this.dashboardProductsUnsubscribe.unsubsribe();
  }
}
