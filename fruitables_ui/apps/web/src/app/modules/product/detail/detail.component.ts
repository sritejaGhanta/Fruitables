import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { FaqComponent } from '../faq/faq.component';
import { ProductReviewComponent } from '../product-review/product-review.component';
import { ProductsService } from '../../../services/http/products/products.service';
@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    ProductReviewComponent,
    CarouselModule,
    FaqComponent,
    RouterModule,
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
})
export class DetailComponent implements OnInit {
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
  constructor(
    private productsService: ProductsService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    let productId = this.activatedRoute.snapshot.params['id'];

    this.productsService.productDetails(productId).subscribe((ele: any) => {
      this.productDetail = ele.data;
      this.cdr.detectChanges();
    });

    this.productlist = this.productsService
      .list({ limit: 1000 })
      .subscribe((result: any) => {
        this.products = result.data;
      });

    let reqObj = { product_id: Number(productId) };

    // this.productsService.productReview(reqObj).subscribe((ele: any) => {
    //   this.productReviews = ele.data;
    //   console.log(this.productReviews, '========');
    //   this.cdr.detectChanges();
    // });
  }

  productAddtoCart(id: any, qty: any) {
    let obj = {
      product_id: id,
      product_qty: Number(qty.value),
      method: 'AddtoCart',
    };
    this.productsService.productAddToCart(obj);
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
}
