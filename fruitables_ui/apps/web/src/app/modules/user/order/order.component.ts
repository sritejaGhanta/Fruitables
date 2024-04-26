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
import { OrderService } from '../../../services/http/order/order.service';
import { Store } from '@ngrx/store';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface UserAddress {
  insert_id?: number;
  id: number;
  land_mark: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: number;
  company_name: string;
  address: string;
  state_name: string;
  country_name: string;
  pin_code: number;
  status: string;
  dial_code ?: string 
}
@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent implements OnInit {
  @ViewChild('dialPhoneNumber') dialPhoneNumber: ElementRef | any;

  userData:any = {};
  cartData: any;
  cartSubtotal: any;
  shipping = 50;
  placeOrderForm: any;
  addressFrom: any;
  phoneInput: any;
  dialCode: any;

  userAddressList!: UserAddress[];
  showAddressDetails = false;
  showAddressBtn = 'Add Address';
  showAddressBtnMode = 'Add';

  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private store: Store<any>,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,

  ) {
    this.addressFrom = fb.group({
      first_name: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(3),
        ],
      ],
      last_name: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(3),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      company_name: [''],
      land_mark: ['', [Validators.required]],
      address: ['', [Validators.required]],
      state_name: ['', [Validators.required]],
      country_name: ['', [Validators.required]],
      pin_code: ['', [Validators.required]],
      phone_number: ['', [Validators.required]],
      id: ['', []],
    });

    this.placeOrderForm = fb.group({
      address_id: ['', [Validators.required]],
    });
  }

  get userOrderAddress() {
    return this.addressFrom.controls;
  }
  
  get selectedOrderAddress() {
    return this.placeOrderForm.controls;
  }

  ngOnInit(): void {

    // getting cart iterm data
    this.store.select('cart_data').subscribe((data: any) => {
      if (Object.values(data) && Object.values(data).length > 0) {
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

     // getting user data
    this.store.select('user_data').subscribe((data: any) => {
     this.userData = data;
    });

    setTimeout(() => {
      const phoneElement: any = this.dialPhoneNumber.nativeElement;
      this.phoneInput = intlTelInput(phoneElement, {
        showSelectedDialCode: true,
      });
      this.phoneInput.setCountry('IN');
    }, 1000);

    this.userService.addressList({}).subscribe((result: any) => {
      this.userAddressList = result.data;
    });
  }

  phoneNumberChange() {
    this.dialCode = '+' + this.phoneInput.getSelectedCountryData()?.dialCode;
  }



  addressAdd() {
    try {
      if (this.addressFrom.valid) {
        this.phoneNumberChange();
        let formValues: any = this.addressFrom.value;
        let resObj = {
          first_name: formValues.first_name,
          last_name: formValues.last_name,
          email: formValues.email,
          company_name: formValues.company_name,
          phone_number: formValues.phone_number,
          land_mark: formValues.land_mark,
          address: formValues.address,
          state_name: formValues.state_name,
          country_name: formValues.country_name,
          pin_code: formValues.pin_code,
          dial_code: this.dialCode,
        };
        if (this.showAddressBtnMode == 'update') {
          this.userService
            .addressUpdate(formValues.id, resObj)
            .subscribe((result: any) => {
              let obj:any = []
               this.userAddressList.map((e: UserAddress) => {
                if (e.id == formValues.id) {
                  obj.push({ ...resObj, id: formValues.id })
                } else {
                  obj.push(e)
                }
              });
              this.userAddressList = obj;
            });
        } else {
          this.userService.addressAdd(resObj).subscribe((result: any) => {
            this.userAddressList.push(result.data);
          });
        }
        this.closeAddressDetail(0);
      } else {
        Object.values(this.addressFrom.controls).forEach((control: any) => {
          control.markAsTouched();
        });
      }
    } catch (err) {
      console.log('>>>Error In Order Address Add >>');
    }
    // this.addressFrom.reset();
  }
  
  addOrder(){
    if(this.placeOrderForm.valid){
      let pay_load = {
        address_id: Number(this.placeOrderForm.value.address_id),
        user_id: this.userData.user_id
      }
      this.orderService.add(pay_load).subscribe((data:any) => {
        console.log(data)
        if(data?.setting?.success){
          
        }
      })
    }
  }

  editAddress(id: number) {
    let address = this.userAddressList.filter(
      (e: UserAddress) => e.id == id
    )[0];
    this.phoneInput.setNumber(address.dial_code + ' ' + address.phone_number)
    this.addressFrom.patchValue(address);

    this.showAddressBtnMode = 'update';
    this.closeAddressDetail(1);
  }

  deleteAddres(id: number) {
    this.userService.addressDelete(id).subscribe((result: any) => {
      this.userAddressList = this.userAddressList.filter(
        (e: UserAddress) => e.id != id
      );
    });
  }

  showAddressComp() {
    this.showAddressDetails = this.showAddressDetails ? false : true;
    this.showAddressBtn = this.showAddressDetails ? 'Close' : 'Add Address';
    if (!this.showAddressDetails) {
      this.closeAddressDetail(0);
    }
  }
  closeAddressDetail(is_open = 0) {
    if (is_open === 1) {
      if (!this.showAddressDetails) {
        document.getElementById('add-address-btn')?.click();

        this.showAddressBtn = 'Close';
      }
    } else if (this.showAddressDetails === true) {
      document.getElementById('add-address-btn')?.click();
    }

    if (is_open == 0) {
      setTimeout(() => {
        this.addressFrom.reset();
        this.phoneInput.setCountry('IN');
        this.showAddressBtnMode = 'add';
      }, 200);
    }
  }
}
