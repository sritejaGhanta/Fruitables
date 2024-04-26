import { HttpClient } from '@angular/common/http';
import { LocalStorage } from '../localStorage/localstorage.services';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Environment } from 'apps/web/src/environment/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonHttpClintService {
  baseUrl: any;
  access_tocken!: any;
  baseUrlTeja: any;
  constructor(
    private http: HttpClient,
    private env: Environment,
    private lg: LocalStorage,
    private router: Router
  ) {
    this.baseUrl = env.BASE_API_URL;
    this.baseUrlTeja = env.BASE_API_URL_TEJA_USER;
    this.access_tocken = this.lg.getToken(env.TOKEN_KEY);
  }

  //if tocken is expired then automatically logged out
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
    tocken: boolean = false,
    headers: any = {}
  ) {
    if (tocken) {
      if (this.access_tocken) {
        headers.Authorization = `Bearer ${this.access_tocken}`;
      }
    }
    return this.http
      .get(this.baseUrl + url, { params: payLoad, headers: headers })
      .pipe(catchError(this.handleApiError.bind(this)));
  }

  post(
    url: string,
    payLoad: any = {},
    tocken: boolean = false,
    headers: any = {}
  ) {
    if (tocken) {
      if (this.access_tocken) {
        headers.Authorization = `Bearer ${this.access_tocken}`;
      }
    }

    return this.http
      .post(this.baseUrl + url, payLoad, { headers: headers })
      .pipe(catchError(this.handleApiError.bind(this)));
  }

  postTeja(
    url: string,
    payLoad: any = {},
    tocken: boolean = false,
    headers: any = {}
  ) {
    if (tocken) {
      if (this.access_tocken) {
        headers.Authorization = `Bearer ${this.access_tocken}`;
      }
    }

    return this.http
      .post(this.baseUrlTeja + url, payLoad, { headers: headers })
      .pipe(catchError(this.handleApiError.bind(this)));
  }

  put(
    url: string,
    payLoad: any = {},
    tocken: boolean = false,
    headers: any = {}
  ) {
    if (tocken) {
      if (this.access_tocken) {
        headers.Authorization = `Bearer ${this.access_tocken}`;
      }
    }
    return this.http
      .put(this.baseUrl + url, payLoad, { headers: headers })
      .pipe(catchError(this.handleApiError.bind(this)));
  }

  delete(
    url: string,
    payLoad: any = {},
    tocken: boolean = false,
    headers: any = {}
  ) {
    if (tocken) {
      if (this.access_tocken) {
        headers.Authorization = `Bearer ${this.access_tocken}`;
      }
    }
    return this.http
      .delete(this.baseUrl + url, { body: payLoad, headers: headers })
      .pipe(catchError(this.handleApiError.bind(this)));
  }
}
