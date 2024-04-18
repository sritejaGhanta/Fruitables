import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { LocalStorage } from '../../../services/localStorage/localstorage.services';
import { Environment } from 'apps/web/src/environment/environment';
import { Store } from '@ngrx/store';
import { UserApiActions } from '../../../services/state/user/user.action';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgbPopoverModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, AfterViewInit {
  userData: any = {};
  userDataFound: boolean = false;
  constructor(
    private localStorage: LocalStorage,
    private env: Environment,
    private store: Store<any>,
    private router: Router
  ) {}
  ngOnInit(): void {
    let userTokenData = this.localStorage.get(this.env.TOKEN_KEY);
    if (userTokenData != undefined) {
      if (Math.ceil(Date.now() / 1000) < userTokenData.exp) {
        this.store.dispatch(UserApiActions.userdata(userTokenData));
      }
    }
    this.store.select('user_data').subscribe((data: any) => {
      if (data.first_name) {
        this.userData = data;
        this.userDataFound = true;
      }
    });
  }
  ngAfterViewInit(): void {}
  userLogout() {
    this.localStorage.clear();
    this.store.dispatch(UserApiActions.userdata({}));
    this.router.navigate(['/auth/login']);
  }
}
