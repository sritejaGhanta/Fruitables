import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './layout/components/404/page-not-found.component';
import {
  // authCanActivateTeam,
  userCanActivateTeam,
  userLoginWithoutLogout,
} from './route-guards/router-guards';

export const APP_ROUTING: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('../app/layout/layout.route').then((m) => m.LAYOUT_ROUTING),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('../app/auth/auth-routing').then((m) => m.AUTH_ROUTING),
    canActivate: [userLoginWithoutLogout],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
