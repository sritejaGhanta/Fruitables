import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Environment {
  BASE_API_URL: string = 'http://localhost:3067/';
  TOKEN_KEY = 'access_token';
}
