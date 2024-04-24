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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CarouselModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [provideAnimations(), provideNoopAnimations()],
})
export class HomeComponent implements OnDestroy, OnInit {
  customOptions: OwlOptions = {
    autoplay: true,
    smartSpeed: 1500,
    center: false,
    dots: true,
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

  productCategorys: any[] = [];
  categoryWiseProducts: any = {};
  products: any[] = [];
  startIndexForVegitables: Number = 0;

  categorylistUnsubscribe: any;
  productlistUnsubscribe: any;
  dashboardProductsUnsubscribe: any;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductsService
  ) {
    this.categorylistUnsubscribe = this.categoryService
      .list({ limit: 10000 })
      .subscribe((result: any) => {
        this.productCategorys = result.data;
        this.startIndexForVegitables = result.data[0]?.id;
      });

    this.dashboardProductsUnsubscribe = this.productService
      .dashBoardProducts()
      .subscribe((result: any) => {
        result.data?.map((e: any) => {
          if (!this.categoryWiseProducts[e.product_category_id]) {
            this.categoryWiseProducts[e.product_category_id] = [];
          }
          this.categoryWiseProducts[e.product_category_id].push(e);
        });
      });
    this.productlistUnsubscribe = this.productService
      .list({ limit: 1000 })
      .subscribe((result: any) => {
        this.products = result.data;
      });
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {
    // this.categorylistUnsubscribe.unsubsribe();
    // this.productlistUnsubscribe.unsubsribe();
    // this.dashboardProductsUnsubscribe.unsubsribe();
  }
}
