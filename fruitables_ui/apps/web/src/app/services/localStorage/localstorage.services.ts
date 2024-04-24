import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class LocalStorage {
  constructor(private router: Router) {}

  set(data: { key: string; value: string }) {
    return localStorage.setItem(data.key, data.value);
  }

  get(key: string): any {
    let encryptToken = localStorage.getItem(key);
    if (encryptToken != null && encryptToken !== undefined) {
      return jwtDecode(encryptToken);
    }
  }
  getToken(key: string): any {
    let encryptToken = localStorage.getItem(key);
    if (encryptToken != null && encryptToken !== undefined) {
      let accessTokenData: any = jwtDecode(encryptToken);
      if (Math.ceil(Date.now() / 1000) < accessTokenData.exp) {
        return encryptToken;
      }
    }
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }
}
