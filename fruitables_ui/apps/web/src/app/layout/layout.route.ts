import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { HomeComponent } from '../home/home.component';
import {
  userCanActivateTeam,
  productResolver,
} from '../route-guards/router-guards';
import { CartComponent } from '../modules/user/cart/cart.component';
import { CheckoutComponent } from '../modules/user/checkout/checkout.component';
import { MyOrdersListComponent } from '../modules/user/my-orders-list/my-orders-list.component';
import { WishlistComponent } from '../modules/user/wishlist/wishlist.component';
import { OrderDetailsComponent } from '../modules/user/order-details/order-details.component';

export const LAYOUT_ROUTING: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
        resolve: [productResolver],
      },
      {
        path: 'cart',
        component: CartComponent,
        canActivate: [userCanActivateTeam],
        resolve: [productResolver],
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        canActivate: [userCanActivateTeam],
      },
      {
        path: 'my-orders',
        component: MyOrdersListComponent,
        canActivate: [userCanActivateTeam],
      },
      {
        path: 'order/:id',
        component: OrderDetailsComponent,
        canActivate: [userCanActivateTeam],
      },
      {
        path: 'wishlist',
        component: WishlistComponent,
        canActivate: [userCanActivateTeam],
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
