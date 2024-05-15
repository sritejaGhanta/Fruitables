import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { Subjects } from './services/subjects/subjects';
import { LoaderService } from './services/loader.service';
import { NgToastService } from 'ng-angular-popup';

export const loaderinterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const subjectData = Inject(Subjects);
  let authToken = subjectData.setTocken?.subscribe((data: any) => data);
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const toast = new NgToastService();
  let loaderService = new LoaderService();
  loaderService.showLoader();

  return next(authReq).pipe(
    tap((event: HttpEvent<any>) => {
      event.type != 0 && console.log('Incoming HTTP response', event);
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

// import { Injectable } from '@angular/core';
// import {
//   HttpEvent,
//   HttpInterceptor,
//   HttpHandler,
//   HttpRequest,
// } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable()
// export class LoaderCallInterceptor implements HttpInterceptor {
//   constructor() {
//     console.log('===============her');
//   }

//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     // Intercept and modify the request here
//     return next.handle(req);
//   }
// }
