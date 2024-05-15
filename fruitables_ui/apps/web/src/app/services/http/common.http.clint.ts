import { HttpClient } from '@angular/common/http';
import { LocalStorage } from '../localStorage/localstorage.services';
import { Injectable } from '@angular/core';
import { Subject, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Environment } from 'apps/web/src/environment/environment';
import { Subjects } from '../subjects/subjects';

@Injectable({
  providedIn: 'root',
})
export class CommonHttpClintService {
  baseUrl: any;
  access_token!: any;
  // baseUrlTeja: any;
  constructor(
    private http: HttpClient,
    private env: Environment,
    private lg: LocalStorage,
    private router: Router,
    private subject: Subjects
  ) {
    this.baseUrl = env.BASE_API_URL;
    // this.baseUrlTeja = env.BASE_API_URL_TEJA_USER;
    this.access_token = this.lg.getToken(env.TOKEN_KEY);

    // set token when login time, because this component is loded before login
    this.subject.setToken.subscribe((token: any) => {
      this.access_token = token;
    });
  }

  //if token is expired then automatically logged out
  handleApiError(error: any) {
    if (error.settings?.status === 401) {
      // Redirect to login page or any other action you want
      this.router.navigate(['/login']);
    }
    return throwError(error);
  }

  get(
    url: string,
    payLoad: any = {},
    token: boolean = false,
    headers: any = {}
  ) {
    if (token) {
      if (this.access_token) {
        headers.Authorization = `Bearer ${this.access_token}`;
      }
    }
    return this.http
      .get(this.baseUrl + url, { params: payLoad, headers: headers })
      .pipe(catchError(this.handleApiError.bind(this)));
  }

  post(
    url: string,
    payLoad: any = {},
    token: boolean = false,
    headers: any = {}
  ) {
    if (token) {
      if (this.access_token) {
        headers.Authorization = `Bearer ${this.access_token}`;
      }
    }

    console.log();
    return this.http
      .post(this.baseUrl + url, payLoad, { headers: headers })
      .pipe(catchError(this.handleApiError.bind(this)));
  }

  // postTeja(
  //   url: string,
  //   payLoad: any = {},
  //   token: boolean = false,
  //   headers: any = {}
  // ) {
  //   if (token) {
  //     if (this.access_token) {
  //       headers.Authorization = `Bearer ${this.access_token}`;
  //     }
  //   }

  //   return this.http
  //     .post(this.baseUrlTeja + url, payLoad, { headers: headers })
  //     .pipe(catchError(this.handleApiError.bind(this)));
  // }

  put(
    url: string,
    payLoad: any = {},
    token: boolean = false,
    headers: any = {}
  ) {
    if (token) {
      if (this.access_token) {
        headers.Authorization = `Bearer ${this.access_token}`;
      }
    }
    return this.http
      .put(this.baseUrl + url, payLoad, { headers: headers })
      .pipe(catchError(this.handleApiError.bind(this)));
  }

  delete(
    url: string,
    payLoad: any = {},
    token: boolean = false,
    headers: any = {}
  ) {
    if (token) {
      if (this.access_token) {
        headers.Authorization = `Bearer ${this.access_token}`;
      }
    }
    return this.http
      .delete(this.baseUrl + url, { body: payLoad, headers: headers })
      .pipe(catchError(this.handleApiError.bind(this)));
  }
}
