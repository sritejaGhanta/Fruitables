import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subjects } from '../../services/subjects/subjects';
import { Router, RouterLink } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import intlTelInput from 'intl-tel-input';
import { AuthService } from '../../services/http/auth/auth.service';
import { LocalStorage } from '../../services/localStorage/localstorage.services';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  dialCode: any;
  @ViewChild('dialPhoneNumber') dialPhoneNumber: ElementRef | any;
  phoneInput: any;
  container: any;
  signUppageActive: boolean = true;
  signupForm: any;
  signinForm: any;
  forgotPasswordForm: any;
  resetPasswordForm: any;
  signupPassword: any = '';
  resetPassword: any = '';
  signupConfirmedPassword: any = '';
  resetConfirmedPassword: any = '';
  confirmPasswordValid: boolean = true;
  resetconfirmPasswordValid: boolean = true;
  match: any;
  forgotPasswordPageActive: boolean = false;
  resetPasswordPageActive: boolean = false;
  resetPasswordEmail: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ls: LocalStorage,
    private authService: AuthService,
    private toast: NgToastService,
    private subjects: Subjects
  ) {
    this.signupForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', Validators.required],
      signup_email: ['', [Validators.required, Validators.email]],
      signup_password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}$'
          ),
        ],
      ],
      signup_confirm_password: ['', [Validators.required]],
      phone_number: ['', [Validators.required]],
    });
    this.signinForm = fb.group({
      signin_email: ['', [Validators.required, Validators.email]],
      signin_password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$'
          ),
        ],
      ],
    });

    this.forgotPasswordForm = fb.group({
      forgotPassword_email: ['', [Validators.required, Validators.email]],
    });
    this.resetPasswordForm = fb.group({
      reset_password_form_otp: ['', [Validators.required]],
      reset_password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$'
          ),
        ],
      ],
      reset_confirm_password: ['', [Validators.required]],
    });
  }

  get signUpformValues() {
    return this.signupForm.controls;
  }

  get signInformValues() {
    return this.signinForm.controls;
  }

  get forgotPasswordValues() {
    return this.forgotPasswordForm.controls;
  }

  get resetPasswordValues() {
    return this.resetPasswordForm.controls;
  }

  checkConfirmPassword() {
    this.confirmPasswordValid =
      this.signupPassword === this.signupConfirmedPassword ? true : false;

    this.resetconfirmPasswordValid =
      this.resetPassword === this.resetConfirmedPassword ? true : false;
  }

  ngOnInit(): void {
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
  signInPage() {
    this.signupForm.reset();
    this.forgotPasswordPageActive = false;
    this.container = document.querySelector('.container');
    this.signUppageActive = true;
    this.container?.classList.remove('right-panel-active');
  }
  signUpPage() {
    this.signinForm.reset();
    this.forgotPasswordPageActive = false;
    this.container = document.querySelector('.container');
    this.signUppageActive = false;
    this.container?.classList.add('right-panel-active');
  }

  userSignUpSubmit() {
    try {
      if (
        this.signupForm.status == 'VALID' &&
        this.confirmPasswordValid == true
      ) {
        let formValues: any = this.signupForm.value;
        let resObj = {
          first_name: formValues.first_name,
          last_name: formValues.last_name,
          email: formValues.signup_email,
          password: formValues.signup_password,
          phone_number: formValues.phone_number,
          dial_code: this.dialCode,
        };

        this.authService.userAdd(resObj).subscribe((data: any) => {
          if (data.settings.success === 1) {
            this.signUppageActive = true;
            this.container?.classList.remove('right-panel-active');
            this.forgotPasswordPageActive = false;
            this.toast.success({
              detail: 'Success message',
              summary: data.settings.message,
            });
            this.signupForm.reset();
            this.cdr.detectChanges();
          } else {
            this.toast.error({
              detail: 'Error message',
              summary: data.settings.message,
            });
          }
        });
      } else {
        this.container?.classList.add('right-panel-active');
        Object.values(this.signupForm.controls).forEach((control: any) => {
          control.markAsTouched();
        });
      }
    } catch (err) {
      console.log('>>>Error In User Add >>');
    }
  }

  userSignInSubmit() {
    try {
      if (this.signinForm.status === 'VALID') {
        let formValues: any = this.signinForm.value;
        let resObj = {
          email: formValues.signin_email,
          password: formValues.signin_password,
        };
        this.authService.userLogin(resObj).subscribe((data: any) => {
          if (data.settings.success === 1) {
            let params: any = {
              key: 'access_token',
              value: data.data.access_token,
            };
            this.forgotPasswordPageActive = false;
            this.ls.set(params);
            this.signinForm.reset();
            this.toast.success({
              detail: 'Success message',
              summary: data.settings.message,
            });
            this.subjects.setTocken.next(data.data.access_token);
            this.router.navigateByUrl('/home');
            this.cdr.detectChanges();
          } else {
            this.toast.error({
              detail: 'Error message',
              summary: data.settings.message,
            });
          }
        });
      } else {
        Object.values(this.signinForm.controls).forEach((control: any) => {
          control.markAsTouched();
        });
      }
    } catch (err) {
      console.log('>>>Error In User Login >>');
    }
  }

  forgotPasswordSubmit() {
    try {
      if (this.forgotPasswordForm.status === 'VALID') {
        let formValues: any = this.forgotPasswordForm.value;
        let resObj = {
          email: formValues.forgotPassword_email,
        };
        this.resetPasswordEmail = resObj.email;

        this.authService.userForgotPassword(resObj).subscribe((data: any) => {
          if (data.settings.success === 1) {
            this.container = document.querySelector('.container');
            this.container?.classList.add('right-panel-active');
            this.resetPasswordPageActive = true;
            this.toast.success({
              detail: 'Success message',
              summary: data.settings.message,
            });
            this.forgotPasswordForm.reset();
          } else {
            this.toast.error({
              detail: 'Error message',
              summary: data.settings.message,
            });
          }
        });
      } else {
        Object.values(this.forgotPasswordForm.controls).forEach(
          (control: any) => {
            control.markAsTouched();
          }
        );
      }
    } catch (err) {
      console.log('>>>Error In Forgot Password >>');
    }
  }

  resetPasswordPageCancel() {
    this.container = document.querySelector('.container');
    this.container?.classList.remove('right-panel-active');
    this.resetPasswordForm.reset();
    this.signUppageActive = true;
    this.resetPasswordPageActive = false;
    this.forgotPasswordPageActive = false;
  }

  forgotPasswordPageCancel() {
    this.forgotPasswordForm.reset();
    this.signUppageActive = true;
    this.resetPasswordPageActive = false;
    this.forgotPasswordPageActive = false;
  }

  resetPasswordFormSubmit() {
    try {
      if (this.resetPasswordForm.status === 'VALID') {
        let formValues: any = this.resetPasswordForm.value;
        let resObj = {
          otp: Number(formValues.reset_password_form_otp),
          password: formValues.reset_password,
          email: this.resetPasswordEmail,
        };

        this.authService.userResetPassword(resObj).subscribe((data: any) => {
          if (data.settings.success === 1) {
            this.container = document.querySelector('.container');
            this.container?.classList.remove('right-panel-active');
            this.resetPasswordForm.reset();
            this.signUppageActive = true;
            this.resetPasswordPageActive = false;
            this.forgotPasswordPageActive = false;
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
        Object.values(this.resetPasswordForm.controls).forEach(
          (control: any) => {
            control.markAsTouched();
          }
        );
      }
    } catch (err) {
      console.log('>>>Error In Forgot Password >>');
    }
  }
}
