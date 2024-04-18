import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { APP_ROUTING } from './app.routes';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { provideStore, provideState } from '@ngrx/store';
import { locaReducer } from './services/state/local.store';
import { userReducer } from './services/state/user/user.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTING),
    //http client
    provideRouter(APP_ROUTING),
    //provide global http client
    provideHttpClient(withFetch()),

    // set local state management
    provideStore(),
    provideState({ name: 'local', reducer: locaReducer }),
    provideState({ name: 'user_data', reducer: userReducer }),
  ],
};
