import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
// import { PageNotFoundComponent } from './components/404/page-not-found.component';
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
    ],
  },
];
