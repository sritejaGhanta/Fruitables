import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import intlTelInput from 'intl-tel-input';

import { UserService } from '../../../services/http/user/user.service';
import { Store } from '@ngrx/store';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent implements OnInit {
  cartData: any;
  cartSubtotal: any;
  shipping = 100;
  form: any;
  @ViewChild('dialPhoneNumber') dialPhoneNumber: ElementRef | any;
  phoneInput: any;
  dialCode: any;
  constructor(
    private userService: UserService,
    private store: Store<any>,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.form = fb.group({
      first_name: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(3),
        ],
      ],
      last_name: [''],
      email: ['', [Validators.required, Validators.email]],
      company_name: [''],
      land_mark: ['', [Validators.required]],
      address: ['', [Validators.required]],
      state_name: ['', [Validators.required]],
      countr_name: ['', [Validators.required]],
      pin_code: ['', [Validators.required]],
      phone_number: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    // this.store.select('user_data').subscribe((data: any) => {
    //   if (data && data.cart_id != undefined) {
    //     let obj = {
    //       cart_id: data.cart_id,
    //     };
    //     this.userService.cartItemList(obj).subscribe((res_data: any) => {
    //       if (res_data.data.length > 0) {
    //         this.cartData = res_data.data;

    //         const sum = res_data.data.reduce(
    //           (accumulator: any, currentValue: any) =>
    //             accumulator +
    //             currentValue.product_price * currentValue.product_qty,
    //           0
    //         );
    //         this.cartSubtotal = Number(sum.toFixed(2));
    //       }
    //     });
    //   }
    // });

    this.store.select('cart_data').subscribe((data: any) => {
      if (Object.values(data) && Object.values(data).length > 0) {
        console.log(this.cartData);
        const filteredCartItems = Object.values(data).filter(
          (item: any) => typeof item !== 'string'
        );
        this.cartData = filteredCartItems;
        const sum: any = filteredCartItems.reduce(
          (accumulator: any, currentValue: any) =>
            accumulator + currentValue.product_price * currentValue.product_qty,
          0
        );
        this.cartSubtotal = Number(sum.toFixed(2));
        this.cdr.detectChanges();
      }
    });

    setTimeout(() => {
      const phoneElement: any = this.dialPhoneNumber.nativeElement;
      this.phoneInput = intlTelInput(phoneElement, {
        showSelectedDialCode: true,
      });
      this.phoneInput.setCountry('IN');
    }, 100);
  }

  phoneNumberChange() {
    this.dialCode = '+' + this.phoneInput.getSelectedCountryData()?.dialCode;
  }
  get userOrderAddress() {
    return this.form.controls;
  }

  userPlaceOrder() {
    try {
      console.log(this.form.value);
      if (this.form.status == 'VALID' && this.userOrderAddress == true) {
        let formValues: any = this.form.value;
        let resObj = {
          first_name: formValues.first_name,
          last_name: formValues.last_name,
          email: formValues.email,
          company_name: formValues.company_name,
          phone_number: formValues.phone_number,
          land_mark: formValues.land_mark,
          address: formValues.address,
          state_name: formValues.state_name,
          countr_name: formValues.countr_name,
          pin_code: formValues.pin_code,
          dial_code: this.dialCode,
        };
        // this.authService.userAdd(resObj).subscribe((data: any) => {
        //   if (data.settings.success === 1) {
        //     this.signUppageActive = true;
        //     this.container?.classList.remove('right-panel-active');
        //     this.toast.success({
        //       detail: 'Success message',
        //       summary: data.settings.message,
        //     });
        //     this.signupForm.reset();
        //     this.cdr.detectChanges();
        //   } else {
        //     this.toast.error({
        //       detail: 'Error message',
        //       summary: data.settings.message,
        //     });
        //   }
        // });
      } else {
      }
    } catch (err) {
      console.log('>>>Error In Order Address Add >>');
    }
  }
}
