import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
// import * as path from 'path';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { UserAddComponent } from './user-add/user-add.component';
import { AboutUsComponent } from './about-us/about-us.component';

export const AUTH_ROUTING: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'forget-password', component: ForgotPasswordComponent },
      { path: 'set-password', component: SetPasswordComponent },
      { path: 'user-add', component: UserAddComponent },
      { path: 'about-us', component: AboutUsComponent },
      { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
    ],
  },
];
