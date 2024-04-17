import { Injectable, inject } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class Environment {
    BASE_API_URL:string = 'http://192.168.20.131:3067/';
}