import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  container: any;
  signUppageActive: boolean = true;
  signupForm: any;
  signinForm: any;
  signupPassword: any = '';
  signupConfirmedPassword: any = '';
  confirmPasswordValid: boolean = true;
  match: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
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
    console.log(this.signupPassword);
    if (this.signupPassword === this.signupConfirmedPassword) {
      this.confirmPasswordValid = true;
    } else {
      this.confirmPasswordValid = false;
    }
  }

  ngOnInit(): void {
    this.container = document.querySelector('.container');
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
    if (this.signupForm.status === 'VALID') {
      this.confirmPasswordValid = true;
      this.signUppageActive = true;
      this.container?.classList.remove('right-panel-active');
      this.signupForm.reset();
      this.cdr.detectChanges();
    } else {
      Object.values(this.signupForm.controls).forEach((control: any) => {
        control.markAsTouched();
      });
    }
  }

  userSignInSubmit() {
    if (this.signinForm.status === 'VALID') {
      this.signinForm.reset();
      this.router.navigate(['/home']);
    } else {
      Object.values(this.signinForm.controls).forEach((control: any) => {
        control.markAsTouched();
      });
    }
  }
}
