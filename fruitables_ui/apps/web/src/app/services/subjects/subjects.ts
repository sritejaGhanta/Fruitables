import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Subjects {
  setToken = new BehaviorSubject('');

  // getSubjectToken() {
  //   console.log('===========');
  //   this.setToken.subscribe((token: any) => {
  //     console.log(token);
  //   });
  //   return this.setToken.asObservable();
  // }
}
