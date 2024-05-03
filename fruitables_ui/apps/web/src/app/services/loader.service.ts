import { ChangeDetectorRef, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  constructor() {}
  name: any = 'jagadeesh';

  showLoader() {
    console.log('============here');
    alert('assa');
    this.isLoadingSubject.next(true);
  }

  hideLoader() {
    this.isLoadingSubject.next(false);
  }

  observable = new Observable((obs: any) => {
    obs.next(this.name);
    obs.complete();
    obs.error('some thing went wrong.');
  });
}
