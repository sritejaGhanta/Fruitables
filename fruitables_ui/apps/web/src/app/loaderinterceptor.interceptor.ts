import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
} from '@angular/common/http';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { LoaderService } from './services/loader.service';
import { NgToastService } from 'ng-angular-popup';
import { Subjects } from './services/subjects/subjects';
import { Inject, inject } from '@angular/core';
import { LocalStorage } from './services/localStorage/localstorage.services';

export const EXCLUDED_ROUTES = [
  '/f-user/api/gateway_user/user-add',
  '/f-user/api/gateway_user/user-login',
  '/f-user/api/gateway_user/user-forgot-password',
  '/f-user/api/gateway_user/user-reset-password',
  '/f-product/api/gateway_product/product-category-list',
  '/f-product/api/gateway_product/dashboard-products',
  '/f-product/api/gateway_product/products-list',
  '/f-product/api/gateway_product/get-top-ratings',
  '/f-product/api/gateway_product/get-product-and-reviews-count',
  '/f-order/api/gateway_order/get-bestseller-products',
  '/f-product/api/gateway_product/products-details',
  '/f-product/api/gateway_product/product-review-list',
];

export const loaderinterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const subjectData = new Subjects();
  const data = inject(LocalStorage);
  let authToken: any = data.getToken('access_token');

  // subjectData.setToken?.subscribe((ele: string) => console.log(ele));

  let authReq: any;
  if (authToken != undefined) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }

  if (EXCLUDED_ROUTES.some((route: any) => req.url.includes(route))) {
    authReq = req;
  }

  const toast = new NgToastService();
  let loaderService = inject(LoaderService);
  loaderService.showLoader();

  return next(authReq).pipe(
    tap(async (event: any) => {
      // let route = req.url.split('/').pop();
      // if (route == 'user-login' && event.body != undefined) {
      //   await subjectData.setToken.next(event.body.data.access_token);
      // }
      event.type != 0;
    }),
    finalize((data1: void): any => {
      loaderService.hideLoader();
    }),
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse) {
        // Handle HTTP errors
        if (err.status === 401) {
          toast.error({
            detail: 'Error Message',
            summary: 'Please Check the all fields.',
          });
          console.error('Unauthorized request:', err);
          // You might trigger a re-authentication flow or redirect the user here
        } else {
          // Handle other HTTP error codes
          toast.error({
            detail: 'Error Message',
            summary: 'Network error.',
          });
          console.error('HTTP error:', err);
        }
      } else {
        // Handle non-HTTP errors
        console.error('An error occurred:', err);
      }

      // Re-throw the error to propagate it further
      return throwError(() => err);
    })
  );
};
