import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class LocalStorage {
  set(data: { key: string; value: string }) {
    return localStorage.setItem(data.key, data.value);
  }

  get(key: string): any {
    let encryptToken = localStorage.getItem(key);
    if (encryptToken != null && encryptToken !== undefined) {
      return jwtDecode(encryptToken);
    }
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }
}
