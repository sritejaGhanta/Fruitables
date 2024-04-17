import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class LocalStorage {
    set(data:{key:string, value: string}) {
        return localStorage.setItem(data.key, data.value);
    }

    get(key:string) {
        return localStorage.getItem(key);
    }

    remove(key:string) {
        localStorage.removeItem(key);
    } 

    clear() {
        localStorage.clear();
    }
} 