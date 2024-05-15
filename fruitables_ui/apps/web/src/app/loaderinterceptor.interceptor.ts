import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
} from '@angular/common/http';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { LoaderService } from './services/loader.service';
import { NgToastService } from 'ng-angular-popup';
import { Subjects } from './services/subjects/subjects';
import { Inject } from '@angular/core';

export const loaderinterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  // const subjectData = Inject(Subjects);
  // console.log(subjectData.setToken, '==========');
  // subjectData.setToken?.subscribe((tocken: any) => {});

  // const authReq = req.clone({
  //   setHeaders: {
  //     Authorization: `Bearer ${authToken}`,
  //   },
  // });

  const toast = new NgToastService();
  let loaderService = new LoaderService();
  loaderService.showLoader();

  return next(req).pipe(
    tap((event: HttpEvent<any>) => {
      event.type != 0;
    }),
    finalize(() => {
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
