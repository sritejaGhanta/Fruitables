import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { LocalStorage } from '../../../services/localStorage/localstorage.services';
import { Environment } from 'apps/web/src/environment/environment';
import { ProductsService } from '../../../services/http/products/products.service';
import { NgToastService } from 'ng-angular-popup';
import { ProductApiActions } from '../../../services/state/product/product.action';
import { Store } from '@ngrx/store';
@Component({
  selector: 'app-product-review',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbRatingModule],
  templateUrl: './product-review.component.html',
  styleUrl: './product-review.component.scss',
})
export class ProductReviewComponent implements OnChanges, OnInit {
  commentForm: any;
  formStatus: boolean = true;
  userData: any;
  userFound: boolean = false;
  userGivenReview: boolean = false;
  userFullName: any;
  @Input() productId: any;
  @Input() userReviewDetails: any;
  rating: any;
  data: any = Date.now();
  constructor(
    private fb: FormBuilder,
    private ls: LocalStorage,
    private env: Environment,
    private productsService: ProductsService,
    private toast: NgToastService,
    private store: Store<any>,
    private cdr: ChangeDetectorRef
  ) {
    let tokenData = this.ls.get(this.env.TOKEN_KEY);
    if (tokenData != undefined || tokenData != null) {
      if (Math.ceil(Date.now() / 1000) < tokenData.exp) {
        this.userFound = true;
        this.userData = tokenData;
        this.userFullName = this.userData?.first_name.concat(
          ' ',
          this.userData?.last_name
        );
      }
    }
    this.commentForm = this.fb.group({
      review: [''],
      rating: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    this.formStatus = true;
    this.commentForm.reset();
    if (this.userReviewDetails != undefined) {
      let productReview = {
        review: this.userReviewDetails?.review,
        rating: this.userReviewDetails?.rating,
      };
      this.rating = productReview.rating;
      this.userGivenReview = true;
      this.commentForm.patchValue(productReview);
      this.cdr.detectChanges();
    } else {
      let productReview = {
        review: '',
        rating: null,
      };
      this.userGivenReview = false;
      this.rating = 0;
      this.commentForm.setValue(productReview);
      this.cdr.detectChanges();
    }
  }

  get commentFormValues() {
    return this.commentForm.controls;
  }

  submitReview() {
    try {
      if (this.commentForm.status == 'VALID') {
        this.formStatus = true;
        let productRating = this.commentForm.value.rating;
        let paramObj: any = {
          product_id: this.productId,
          review: this.commentForm.value.review,
          rating: productRating.toString(),
          user_id: this.userData.user_id,
        };
        var currentDate = new Date();

        // Get hours in 12-hour format
        var hours = currentDate.getHours();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 12-hour clock format

        // Format the date and time
        var formattedDate =
          currentDate.getFullYear() +
          '-' +
          ('0' + (currentDate.getMonth() + 1)).slice(-2) +
          '-' +
          ('0' + currentDate.getDate()).slice(-2) +
          ' ' +
          ('0' + hours).slice(-2) +
          ':' +
          ('0' + currentDate.getMinutes()).slice(-2) +
          ' ' +
          ampm;

        this.productsService
          .productReviewAdd(paramObj)
          .subscribe((data: any) => {
            if (data.settings.success == 1) {
              paramObj['user_name'] = this.userFullName;
              paramObj['user_profile_image'] = this.userData.profile_image;
              paramObj['created_at'] = formattedDate;
              this.store.dispatch(
                ProductApiActions.productReviewListData(paramObj)
              );

              this.toast.success({
                detail: 'Success message',
                summary: data.settings.message,
              });
              this.userGivenReview = true;
            } else {
              this.userGivenReview = false;
              this.toast.error({
                detail: 'Error message',
                summary: data.settings.message,
              });
            }
          });
      } else {
        this.formStatus = false;
        this.userGivenReview = false;
      }
    } catch (err) {
      console.log('>>> Error in review add >>>');
    }
  }
}
