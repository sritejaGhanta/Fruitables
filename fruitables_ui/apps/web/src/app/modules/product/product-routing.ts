import { Routes } from '@angular/router';
import { ProductComponent } from './product.component';
import { CartComponent } from './cart/cart.component';
import { OrderComponent } from './order/order.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';

export const PRODUCT_ROUTING: Routes = [
  {
    path: '',
    component: ProductComponent,
    children: [
      {
        path: 'list',
        component: ListComponent,
      },
      {
        path: ':id',
        component: DetailComponent,
      },
      {
        path: 'cart',
        component: CartComponent,
      },
      {
        path: 'order',
        component: OrderComponent,
      },
      {
        path: 'wishlist',
        component: WishlistComponent,
      },
      {
        path: '',
        component: ListComponent,
        pathMatch: 'full',
      },
    ],
  },
];
