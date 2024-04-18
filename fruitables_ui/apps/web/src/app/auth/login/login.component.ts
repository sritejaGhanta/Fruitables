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
import { CustomValidators } from './customValidators';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/http/auth/auth.service';
import intlTelInput from 'intl-tel-input';
import { LocalStorage } from '../../services/localStorage/localstorage.services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, AfterViewInit {
  dialCode: any;
  @ViewChild('dialPhoneNumber') dialPhoneNumber: ElementRef | any;
  phoneInput: any;
  container: any;
  signUppageActive: boolean = true;
  signupForm: any;
  signinForm: any;
  signupPassword: any = '';
  signupConfirmedPassword: any = '';
  confirmPasswordValid: boolean = true;
  confirmPasswordValidFlag: boolean = false;
  match: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ls: LocalStorage,
    private authService: AuthService
  ) {
    this.signupForm = this.fb.group(
      {
        first_name: ['', [Validators.required]],
        last_name: ['', [Validators.required]],
        signup_email: ['', [Validators.required, Validators.email]],
        signup_password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$'
            ),
          ],
        ],
        signup_confirm_password: ['', [Validators.required]],

        phone_number: ['', [Validators.required]],
      }
      // { validator: this.passwordMatchValidator }
    );
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
  }

  // passwordMatchValidator(formGroup: FormGroup) {
  //   const password = formGroup.get('signup_password')?.value;
  //   const confirmPassword = formGroup.get('signup_confirm_password')?.value;
  //   const match: any = password === confirmPassword;

  //   return match ? null : { mismatch: true };
  // }

  get signUpformValues() {
    return this.signupForm.controls;
  }

  get signInformValues() {
    return this.signinForm.controls;
  }
  checkConfirmPassword() {
    if (this.signupPassword === this.signupConfirmedPassword) {
      this.confirmPasswordValid = true;
    } else {
      this.confirmPasswordValid = false;
    }
  }

  ngOnInit(): void {
    this.container = document.querySelector('.container');
    setTimeout(() => {
      const phoneElement: any = this.dialPhoneNumber.nativeElement;
      this.phoneInput = intlTelInput(phoneElement, {
        showSelectedDialCode: true,
      });
      this.phoneInput.setCountry('IN');
    }, 100);
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   const phoneElement: any = this.dialPhoneNumber.nativeElement;
    //   this.phoneInput = intlTelInput(phoneElement, {
    //     showSelectedDialCode: true,
    //   });
    //   this.phoneInput.setCountry('IN');
    //   this.phoneInput.setNumber(this.dialCode || '+91');
    // }, 100);
  }
  phoneNumberChange() {
    this.dialCode = '+' + this.phoneInput.getSelectedCountryData()?.dialCode;
  }
  signInPage() {
    this.signUppageActive = true;
    this.container?.classList.remove('right-panel-active');
  }
  signUpPage() {
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
            this.signupForm.reset();
            this.cdr.detectChanges();
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
            console.log(data.data.access_token);
            let params: any = {
              key: 'access_token',
              value: data.data.access_token,
            };
            this.ls.set(params);
            this.signinForm.reset();
            this.router.navigate(['/home']);
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
}
