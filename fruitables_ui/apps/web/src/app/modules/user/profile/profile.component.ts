import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import intlTelInput from 'intl-tel-input';
import { NgToastService } from 'ng-angular-popup';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/http/user/user.service';
import { Store } from '@ngrx/store';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  phoneInput: any;
  @ViewChild('dialPhoneNumber') dialPhoneNumber: ElementRef | any;
  @ViewChild('fileInput') fileInput: any;
  form: any;
  formValidate: boolean = true;
  userData: any = {};
  userDataFound: boolean = false;
  fileName: string = '';
  selectedFile: any;
  upload_image_url: any;
  dialCode: any;
  unsubscribe: any;
  constructor(
    fb: FormBuilder,
    private userService: UserService,
    private store: Store<any>,
    private toast: NgToastService,
    private cdr: ChangeDetectorRef
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
      email: [''],
      profile_image: [''],
      phone_number: ['', [Validators.required]],
    });
  }

  get userProfileValues() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.store.select('user_data').subscribe((data: any) => {
      if ('user_id' in data && data.user_id !== '') {
        this.getUserData(data.user_id);
        console.log('here');
        this.cdr.detectChanges();
      }
    });
  }

  phoneNumberChange1() {
    // console.log('this.phoneInput.getSelectedCountryData()?.dialCode');
    // this.dialCode = '+' + this.phoneInput.getSelectedCountryData()?.dialCode;
    // this.phoneInput.destroy();
  }

  uploadProfile(event: any) {
    if (event.target.files.length > 0) {
      let render = new FileReader();
      render.readAsDataURL(event.target.files[0]);
      this.selectedFile = event.target.files[0];
      render.onload = (e: any) => {
        this.upload_image_url = e.target.result;
      };
    }
  }
  userProfileUpdate() {
    try {
      if (this.form.status === 'VALID') {
        this.dialCode =
          '+' + this.phoneInput.getSelectedCountryData()?.dialCode;
        const formData = new FormData();
        const formValues: any = this.form.value;
        formData.append('first_name', formValues.first_name);
        formData.append('last_name', formValues.last_name);
        formData.append('email', formValues.email);
        if (this.selectedFile && this.selectedFile !== undefined) {
          formData.append('profile_image', this.selectedFile);
        } else {
          formData.append('profile_image', this.userData.profile_image_name);
        }
        formData.append('phone_number', formValues.phone_number);
        formData.append('dial_code', this.dialCode);

        this.userService
          .update(formData, this.userData.user_id)
          .subscribe((data: any) => {
            if (data.settings.success === 1) {
              this.phoneInput.setNumber('');
              this.cdr.detectChanges();
              this.getUserData(this.userData.user_id);
              this.toast.success({
                detail: 'Success message',
                summary: data.settings.message,
              });
            } else {
              this.toast.error({
                detail: 'Error message',
                summary: data.settings.message,
              });
            }
            this.form.reset();
          });
      } else {
        this.toast.error({
          detail: 'Error message',
          summary: 'something went wrong.',
        });
      }
    } catch (err) {
      console.log('>>>ERROR IN User Profile >>>');
    }
  }

  getUserData(user_id: any) {
    this.unsubscribe = this.userService
      .details(user_id)
      .subscribe((res: any) => {
        this.userData = res.data;
        this.userDataFound = true;
        this.dialCode = res.data.dial_code;
        console.log(res.data);
        let userObj: any = {
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          email: res.data.email,
          phone_number: res.data.phone_number,
          profile_image_name: res.data.profile_image_name,
        };
        console.log(res.data.dial_code);
        this.form.patchValue(userObj);

        setTimeout(() => {
          const phoneElement: any = this.dialPhoneNumber.nativeElement;
          this.phoneInput = intlTelInput(phoneElement, {
            showSelectedDialCode: true,
          });

          this.phoneInput.setNumber(
            res.data.dial_code.concat(res.data.phone_number)
          );
          this.cdr.detectChanges();
        }, 100);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe.destroy();
  }
}
