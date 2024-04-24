import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { LocalStorage } from '../../../services/localStorage/localstorage.services';
import { Environment } from 'apps/web/src/environment/environment';
import { Store } from '@ngrx/store';
import { UserApiActions } from '../../../services/state/user/user.action';
import { UserService } from '../../../services/http/user/user.service';
import { count } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgbPopoverModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  userData: any;
  userDataFound: boolean = false;
  cartCount: any = 0;
  userDataUnsubscribe: any;
  cartDataUnsubscribe: any;
  cartListUnsubscribe: any;
  constructor(
    private localStorage: LocalStorage,
    private env: Environment,
    private store: Store<any>,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    let userTokenData = this.localStorage.get(this.env.TOKEN_KEY);
    if (userTokenData != undefined) {
      if (Math.ceil(Date.now() / 1000) < userTokenData.exp) {
        this.userDataFound = true;
        this.cdr.detectChanges();

        if (userTokenData.cart_id != undefined && this.userDataFound == true) {
          let obj = {
            cart_id: userTokenData.cart_id,
          };
          this.userService
            .cartItemList(obj)
            .subscribe(async (res_data: any) => {
              console.log(res_data.data);
              if (res_data.data.length > 0) {
                this.cartCount = await res_data.data.length;
                this.cdr.detectChanges();
                this.store.dispatch(UserApiActions.cartdata(res_data.data));
                this.cdr.detectChanges();
              }
            });
        }
        this.store.dispatch(UserApiActions.userdata(userTokenData));
      }
    }

    this.store.select('cart_data').subscribe(async (data: any) => {
      if (data != undefined && data != null) {
        console.log(Object.values(data));
        if (Object.values(data) && Object.values(data).length > 0) {
          const filteredCartItems = Object.values(data).filter(
            (item: any) => typeof item !== 'string'
          );

          if (filteredCartItems.length > 0) {
            this.cartCount = filteredCartItems.length;
            this.cdr.detectChanges();
          }
        }
      }
    });
  }
  ngAfterViewInit(): void {}
  userLogout() {
    this.localStorage.clear();
    this.store.dispatch(UserApiActions.userdata({}));
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    // this.userDataUnsubscribe.unsubscribe();
    // this.cartDataUnsubscribe.unsubscribe();
    // this.cartListUnsubscribe.unsubscribe();
  }
}
