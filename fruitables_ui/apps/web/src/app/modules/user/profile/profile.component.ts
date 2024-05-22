import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgToastService } from 'ng-angular-popup';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import intlTelInput from 'intl-tel-input';
import { UserService } from '../../../services/http/user/user.service';
import { UserApiActions } from '../../../services/state/user/user.action';
import { LocalStorage } from '../../../services/localStorage/localstorage.services';
import { Environment } from 'apps/web/src/environment/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  phoneInput: any;
  @ViewChild('dialPhoneNumber') dialPhoneNumber: ElementRef | any;
  @ViewChild('fileInput') fileInput: ElementRef | any;

  form: any;
  formValidate: boolean = true;
  userData: any = {};
  userDataFound: boolean = false;
  fileName: string = '';
  selectedFile: any;
  upload_image_url: any;
  dialCode: any;
  unsubscribe: any;
  profileImageData: any;
  preview = '';
  resetPassword: any;
  newPassword: any;
  confirmPassword: any;
  confirmPasswordValid = true;

  constructor(
    fb: FormBuilder,
    private userService: UserService,
    private store: Store<any>,
    private toast: NgToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', Validators.required],
      email: [''],
      profile_image: [null],
      phone_number: ['', [Validators.required]],
    });
    this.resetPassword = fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}$'
          ),
        ],
      ],
      new_password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}$'
          ),
        ],
      ],
      confirm_password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$'
          ),
        ],
      ],
    });
  }

  get userProfileValues() {
    return this.form.controls;
  }

  get resetPass() {
    return this.resetPassword.controls;
  }

  ngAfterContentInit(): void {
    window.scroll(0, 0);
  }
  ngOnInit(): void {
    this.store.select('user_data').subscribe((res: any) => {
      this.userData = res;
      this.userDataFound = true;
      this.dialCode = res.dial_code;
      let userObj: any = {
        first_name: res.first_name,
        last_name: res.last_name,
        email: res.email,
        phone_number: res.phone_number,
        profile_image_name: res.profile_image_name,
      };

      this.profileImageData = {
        image: res.profile_image,
        alt_name: res.profile_image_name,
      };

      this.form.patchValue(userObj);

      setTimeout(() => {
        const phoneElement: any = this.dialPhoneNumber.nativeElement;
        this.phoneInput = intlTelInput(phoneElement, {
          showSelectedDialCode: true,
        });

        if (res.phone_number != undefined && res.dial_code != undefined) {
          this.phoneInput.setNumber(res.dial_code.concat(res.phone_number));
          this.cdr.detectChanges();
        }
      }, 100);
    });
    this.cdr.detectChanges();
  }

  uploadProfile(event: any) {
    this.preview = '';
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.preview = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  priviewImageCancel(profile: any) {
    this.preview = '';
    this.selectedFile = '';
    profile.value = '';
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
              formValues.profile_image = data.data.profile_image;
              formValues.profile_image_name = data.data.profile_image_name;
              formValues.dial_code = this.dialCode;
              this.store.dispatch(UserApiActions.userdata(formValues));
              this.getUserDataUpdate(formValues);
              this.preview = '';

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

  getUserDataUpdate(data: any) {
    let userObj: any = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone_number: data.phone_number,
    };
    if (data.profile_image != null) {
      this.profileImageData = {
        image: data.profile_image,
        alt_name: this.userData.profile_image_name,
      };
    }

    this.form.patchValue(userObj);
    this.cdr.detectChanges();
    console.log(this.form.value);

    setTimeout(() => {
      const phoneElement: any = this.dialPhoneNumber.nativeElement;
      this.phoneInput = intlTelInput(phoneElement, {
        showSelectedDialCode: true,
      });

      this.phoneInput.setNumber(data.dial_code.concat(data.phone_number));
      this.cdr.detectChanges();
    }, 100);
  }

  checkConfirmPassword() {
    if (this.newPassword === this.confirmPassword) {
      this.confirmPasswordValid = true;
    } else {
      this.confirmPasswordValid = false;
    }
  }

  ngOnDestroy(): void {}

  resetPasswordSubmite() {
    console.log(this.resetPassword.value, this.resetPassword.valid);
    if (this.resetPassword.valid) {
      this.userService
        .changePassword(this.resetPassword.value)
        .subscribe((data: any) => {
          if (data.settings.success === 1) {
            this.toast.success({
              detail: 'Success message',
              summary: data.settings.message,
            });
            this.resetPassword.reset();
          } else {
            this.toast.error({
              detail: 'Error message',
              summary: data.settings.message,
            });
          }
        });
    } else {
      Object.values(this.resetPassword.controls).forEach((control: any) => {
        control.markAsTouched();
      });
    }
  }
}
