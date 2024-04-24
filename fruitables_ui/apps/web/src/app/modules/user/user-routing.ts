import { Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { ProfileComponent } from './profile/profile.component';
import { CartComponent } from './cart/cart.component';
import { OrderComponent } from './order/order.component';
import { WishlistComponent } from './wishlist/wishlist.component';

export const USER_ROUTING: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      {
        path: 'profile',
        component: ProfileComponent,
        data: { breadcrumb: 'Profile' },
      },
      // {
      //   path: 'cart',
      //   component: CartComponent,
      // },
      // {
      //   path: 'orders',
      //   component: OrderComponent,
      // },
      // {
      //   path: 'wishlist',
      //   component: WishlistComponent,
      // },
    ],
  },
];
