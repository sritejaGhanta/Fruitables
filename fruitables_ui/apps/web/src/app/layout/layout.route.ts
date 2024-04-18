import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { HomeComponent } from '../home/home.component';
import { userCanActivateTeam } from '../route-guards/router-guards';

export const LAYOUT_ROUTING: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'products',
        loadChildren: () =>
          import('../modules/product/product-routing').then(
            (m) => m.PRODUCT_ROUTING
          ),
      },
      {
        path: 'user',
        loadChildren: () =>
          import('../modules/user/user-routing').then((m) => m.USER_ROUTING),
        canActivate: [userCanActivateTeam],
      },
      {
        path: '',
        component: HomeComponent,
        pathMatch: 'full',
      },
    ],
  },
];
