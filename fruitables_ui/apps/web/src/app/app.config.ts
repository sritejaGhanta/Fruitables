import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { APP_ROUTING } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptors,
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

import { productReviewListReducer } from './services/state/product/product.reducer';
import { provideClientHydration } from '@angular/platform-browser';
import { loaderinterceptorInterceptor } from './loaderinterceptor.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    //proivd angular animations
    provideAnimations(),
    //provide global http client
    provideHttpClient(withFetch()),
    //global routes
    provideRouter(APP_ROUTING),
    provideClientHydration(),
    // interceptors

    provideHttpClient(withInterceptors([loaderinterceptorInterceptor])),

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
      name: 'product_review_list',
      reducer: productReviewListReducer,
    }),
  ],
};
