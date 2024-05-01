import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { FaqComponent } from '../faq/faq.component';
import { ProductReviewComponent } from '../product-review/product-review.component';
import { ProductsService } from '../../../services/http/products/products.service';
import { Store } from '@ngrx/store';
import { CategoryService } from '../../../services/http/products/category.service';
import { ProductApiActions } from '../../../services/state/product/product.action';
import { NgxStarRatingModule } from 'ngx-star-rating';
import { FormsModule } from '@angular/forms';
import { RattingComponentComponent } from '../../../genral-components/ratting-component/ratting-component.component';
@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    ProductReviewComponent,
    CarouselModule,
    FaqComponent,
    RouterModule,
    NgxStarRatingModule,
    FormsModule,
    RattingComponentComponent,
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent implements OnInit {
  wishlistProduct: boolean = false;

  totalProductRating: any;
  rating3: number = 3;
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
  products: any[] = [];
  productDetail: any;
  productReviews: any;
  buttonDisable: boolean = false;
  productlist: any;
  productCategorys: any;
  constructor(
    private productsService: ProductsService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private store: Store<any>
  ) {
    this.totalProductRating = 3;
  }
  ngOnInit(): void {
    let productId = this.activatedRoute.snapshot.params['id'];
    this.cdr.detectChanges();
    this.getProductDetail(productId);
    this.productlist = this.productsService
      .list({ limit: 1000 })
      .subscribe((result: any) => {
        this.products = result.data;
      });

    let reqObj = { product_id: Number(productId) };

    this.productsService.productReview(reqObj).subscribe((ele: any) => {
      if (ele.data) {
        this.productReviews = ele.data;
        this.cdr.detectChanges();
      }
    });

    this.store.select('wishlist_data').subscribe((data: any) => {
      if (data != undefined && data != null) {
        if (Object.values(data) && Object.values(data).length > 0) {
          const filteredCartItems = Object.values(data).filter(
            (item: any) => typeof item !== 'string'
          );
          filteredCartItems.map((ele: any) => {
            if (productId == ele.product_id) {
              this.wishlistProduct = true;
            }
          });
          this.cdr.detectChanges();
        }
      }
    });
  }

  getProductDetail(productId: any) {
    this.productsService.productDetails(productId).subscribe((ele: any) => {
      if (ele.data) {
        this.productDetail = ele.data;
        this.rating3 = 5;
        this.cdr.detectChanges();
      }
    });
  }

  getCategoryProducts(categoryId: any) {
    let obj = {
      key: 'product_category_id',
      value: categoryId,
      component: 'detailComponet',
    };
    this.store.dispatch(ProductApiActions.productListData(obj));
  }

  productAddtoCart(product: any, qty: any) {
    console.log(product);
    let obj = {
      product_qty: Number(qty.value),
    };
    this.productsService.productAddToCart(product, obj);
  }

  addQuantity(qty: any) {
    let quantity = Number(qty.value);
    if (quantity == 0) {
      this.buttonDisable = false;
    }
    qty.value = quantity + 1;
  }

  removeQuantity(qty: any) {
    let quantity = Number(qty.value);
    if (quantity == 1) {
      this.buttonDisable = true;
    }
    qty.value = quantity - 1;
  }

  productAddtoWishlist(product: any) {
    this.wishlistProduct = !this.wishlistProduct;
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
}
