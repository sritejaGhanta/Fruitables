import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductReviewComponent } from '../product-review/product-review.component';
import { FaqComponent } from '../faq/faq.component';
import { ProductsService } from '../../../services/http/products/products.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, ProductReviewComponent, FaqComponent],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
})
export class DetailComponent implements OnInit {
  productDetail: any;
  productReviews: any;
  buttonDisable: boolean = false;
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
