import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { PageNotFoundComponent } from './components/404/page-not-found.component';
import { HomeComponent } from '../home/home.component';

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
        path: 'auth',
        loadChildren: () =>
          import('../auth/auth-routing').then((m) => m.AUTH_ROUTING),
      },
      {
        path: 'product',
        loadChildren: () =>
          import('../modules/product/product-routing').then(
            (m) => m.PRODUCT_ROUTING
          ),
      },
      {
        path: '',
        component: HomeComponent,
        pathMatch: 'full',
      },
      {
        path: '**',
        component: PageNotFoundComponent,
      },
    ],
  },
];
