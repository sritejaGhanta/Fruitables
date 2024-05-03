import { Injectable } from '@angular/core';
import { CommonHttpClintService } from '../common.http.clint';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: CommonHttpClintService) {}

  userAdd(data: any) {
    return this.http.post('f-user/api/gateway_user/user-add', data);
  }

  userLogin(data: any) {
    return this.http.post('f-user/api/gateway_user/user-login', data);
  }

  userForgotPassword(data: any) {
    return this.http.post('f-user/api/gateway_user/user-forgot-password', data);
  }

  userResetPassword(data: any) {
    return this.http.post('f-user/api/gateway_user/user-reset-password', data);
  }
}
