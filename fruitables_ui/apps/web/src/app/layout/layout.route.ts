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
import { OrderDetailsComponent } from '../modules/user/order-details/order-details.component';
import { WishlistComponent } from '../modules/user/wishlist/wishlist.component';
import { ContactUsComponent } from '../auth/contact-us/contact-us.component';
import { PrivacyComponent } from '../auth/privacy/privacy.component';
import { TermsConditionsComponent } from '../auth/terms-conditions/terms-conditions.component';

export const LAYOUT_ROUTING: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
        // resolve: [productResolver],
        resolve: { hero: productResolver },
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
        path: 'orders',
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
        path: 'contact-us',
        component: ContactUsComponent,
      },
      {
        path: 'privacy-legal',
        component: PrivacyComponent,
      },
      {
        path: 'terms-conditions',
        component: TermsConditionsComponent,
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
