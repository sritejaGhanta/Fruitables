import { Routes } from '@angular/router';
import { ProductComponent } from './product.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';

export const PRODUCT_ROUTING: Routes = [
  {
    path: '',
    component: ProductComponent,
    children: [
      {
        path: '',
        component: ListComponent,
      },
      {
        path: ':id',
        component: DetailComponent,
      },

      // {
      //   path: '',
      //   component: ListComponent,
      //   pathMatch: 'full',
      // },
    ],
  },
];
