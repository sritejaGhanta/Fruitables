import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterModule,
} from '@angular/router';
import { NgToastModule } from 'ng-angular-popup';
import { LoaderService } from './services/loader.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
// import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
  standalone: true,
  imports: [RouterModule, NgToastModule, CommonModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'web';
  showLoader!: Observable<boolean>;
  hideLoader!: Observable<boolean>;
  isLoading: any = false;
  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isLoading = false;
      }
    });

    this.loaderService.isLoading$.subscribe((isLoading: any) => {
      this.isLoading = isLoading;
      this.cdr.detectChanges();
    });
  }
}
