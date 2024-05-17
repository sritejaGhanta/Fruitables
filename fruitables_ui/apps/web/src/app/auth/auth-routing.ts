import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { AboutUsComponent } from './about-us/about-us.component';

export const AUTH_ROUTING: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'about-us', component: AboutUsComponent },
      { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
    ],
  },
];
