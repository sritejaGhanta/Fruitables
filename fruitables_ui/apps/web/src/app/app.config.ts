import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { APP_ROUTING } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
import { provideStore, provideState } from '@ngrx/store';
import { locaReducer } from './services/state/local.store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimations } from '@angular/platform-browser/animations';

import {
  cartReducer,
  userReducer,
  wishlistReducer,
} from './services/state/user/user.reducer';
import { LoaderInterceptor } from './services/intercetor';
import {
  productCategoriesReducer,
  productListReducer,
} from './services/state/product/product.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTING),
    //http client
    provideRouter(APP_ROUTING),
    //provide global http client
    provideHttpClient(withFetch()),

    //proivd angular animations
    provideAnimations(),

    // interceptors
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    // set local state management
    provideStore(),
    // provideState({ name: 'local', reducer: locaReducer }),

    provideState({ name: 'user_data', reducer: userReducer }),
    provideState({ name: 'cart_data', reducer: cartReducer }),
    provideState({
      name: 'wishlist_data',
      reducer: wishlistReducer,
    }),

    provideState({
      name: 'product_category_data',
      reducer: productCategoriesReducer,
    }),
    provideState({
      name: 'product_list_data',
      reducer: productListReducer,
    }),
  ],
};
