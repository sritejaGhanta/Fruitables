import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  ResolveFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { LocalStorage } from '../services/localStorage/localstorage.services';
import { Environment } from '../../environment/environment';
import { CategoryService } from '../services/http/products/category.service';
import { UserService } from '../services/http/user/user.service';

export const userCanActivateTeam: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const ls = inject(LocalStorage);
  const env = inject(Environment);
  const router = inject(Router);

  let accessTokenData = ls.get(env.TOKEN_KEY);
  let result = false;

  if (accessTokenData != undefined) {
    if (Math.ceil(Date.now() / 1000) < accessTokenData.exp) {
      if (state.url == '/user') {
        router.navigate(['/user/profile']);
      }
      result = true;
    } else {
      ls.remove(env.TOKEN_KEY);
      router.navigate(['/auth/login']);
      result = false;
    }
  } else {
    router.navigateByUrl('/auth/login');
    result = false;
  }
  return result;
};

// export const authCanActivateTeam: CanActivateFn = (
//   route: ActivatedRouteSnapshot,
//   state: RouterStateSnapshot
// ) => {
//   // const ls = inject(LocalStorage);
//   // const env = inject(Environment);
//   // const router = inject(Router);
//   // let accessTokenData = ls.get(env.TOKEN_KEY);

//   return true;
// };

export const userLoginWithoutLogout: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const ls: any = inject(LocalStorage);
  const router = inject(Router);
  const env = inject(Environment);

  let tokenKey = ls.get(env.TOKEN_KEY);
  let result = true;
  if (tokenKey == null || tokenKey == undefined) {
    result = true;
  } else if (
    tokenKey !== null &&
    'exp' in tokenKey &&
    tokenKey.exp > Math.ceil(Date.now() / 1000)
  ) {
    router.navigate(['/home']);
    result = false;
  }
  return result;
};

export const productResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(CategoryService).list({ limit: 10000 });
};

export const cartResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const ls = inject(LocalStorage);
  const env = inject(Environment);
  const router = inject(Router);

  let accessTokenData: any = ls.get(env.TOKEN_KEY);
  // if (Math.ceil(Date.now() / 1000) < accessTokenData.exp) {
  return inject(UserService).cartItemList({
    cart_id: accessTokenData.cart_id,
  });
  // }
};
