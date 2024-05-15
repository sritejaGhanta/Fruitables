// import { Injectable } from '@angular/core';
// import {
//   HttpEvent,
//   HttpInterceptor,
//   HttpHandler,
//   HttpRequest,
//   HttpErrorResponse,
//   HttpInterceptorFn,
//   HttpHandlerFn,
// } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError, finalize, tap } from 'rxjs/operators';
// import { LoaderService } from './loader.service';
// import { NgToastService } from 'ng-angular-popup';

// @Injectable()
// export class LoaderCallInterceptor implements HttpInterceptor {
//   constructor(
//     private loaderService: LoaderService,
//     private toast: NgToastService
//   ) {
//     console.log('==============intercept');
//   }

//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     console.log('Outgoing HTTP request');
//     const authReq = req.clone({
//       headers: req.headers.set(
//         'Authorization',
//         'Bearer ' + localStorage.getItem('access_token')
//       ),
//     });

//     this.loaderService.showLoader();
//     return next.handle(authReq).pipe(
//       tap((event: HttpEvent<any>) => {
//         event.type != 0 && console.log('Incoming HTTP response', event);
//       }),
//       finalize(() => {
//         this.loaderService.hideLoader();
//       }),
//       catchError((err: any) => {
//         if (err instanceof HttpErrorResponse) {
//           if (err.status === 401) {
//             this.toast.error({
//               detail: 'Error Message',
//               summary: 'Please Check the all fields.',
//             });
//             console.error('Unauthorized request:', err);
//           } else {
//             this.toast.error({
//               detail: 'Error Message',
//               summary: 'Network error.',
//             });
//             console.error('HTTP error:', err);
//           }
//         } else {
//           console.error('An error occurred:', err);
//         }
//         return throwError(() => err);
//       })
//     );
//   }
// }

import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class LoaderCallInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('===============her');
    // Intercept and modify the request here
    return next.handle(req);
  }
}
