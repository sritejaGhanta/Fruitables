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
  wishlistData: any;
  userDataFound: boolean = false;
  cartCount: any = 0;
  wishlistCount: any = 0;
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
        this.cdr.detectChanges();

        if (userTokenData.cart_id != undefined && this.userDataFound == true) {
          let obj = {
            cart_id: userTokenData.cart_id,
          };
          this.userService
            .cartItemList(obj)
            .subscribe(async (res_data: any) => {
              if (res_data.data.length > 0) {
                this.cartCount = res_data.data.length;
                this.cdr.detectChanges();
                this.store.dispatch(UserApiActions.cartdata(res_data.data));
                this.cdr.detectChanges();
              }
            });
        }

        // this.store.dispatch(UserApiActions.wishlistdata(resObj));

        // this.store.dispatch(UserApiActions.userdata(userTokenData));
        if ('user_id' in userTokenData && userTokenData.user_id !== '') {
          this.userService
            .details(userTokenData.user_id)
            .subscribe((res: any) => {
              this.userData = res.data;
              this.userDataFound = true;
              this.store.dispatch(UserApiActions.userdata(res.data));
              this.cdr.detectChanges();
            });
          this.userService.wishlistData().subscribe((res: any) => {
            this.wishlistCount = res.data.length;
            this.cdr.detectChanges();

            // this.userDataFound = true;
            this.store.dispatch(UserApiActions.wishlistdata(res.data));
            this.cdr.detectChanges();
          });
        }
      }
    }

    this.store.select('cart_data').subscribe(async (data: any) => {
      if (data != undefined && data != null) {
        if (Object.values(data) && Object.values(data).length > 0) {
          const filteredCartItems = Object.values(data).filter(
            (item: any) => typeof item !== 'string'
          );

          if (filteredCartItems.length) {
            this.cartCount = filteredCartItems.length;
            this.cdr.detectChanges();
          }
        } else {
          this.cartCount = 0;
          this.cdr.detectChanges();
        }
      } else {
        this.cartCount = 0;
      }
    });

    this.store.select('wishlist_data').subscribe(async (data: any) => {
      if (data != undefined && data != null) {
        if (Object.values(data) && Object.values(data).length > 0) {
          const filteredCartItems = Object.values(data).filter(
            (item: any) => typeof item !== 'string'
          );

          if (filteredCartItems.length) {
            this.wishlistCount = filteredCartItems.length;
            this.cdr.detectChanges();
          }
        } else {
          this.wishlistCount = 0;
          this.cdr.detectChanges();
        }
      } else {
        this.wishlistCount = 0;
      }
    });

    this.store.select('user_data').subscribe((data: any) => {
      if ('user_id' in data && data.user_id !== '') {
        this.userData = data;
      }
    });
  }
  ngAfterViewInit(): void {}
  userLogout() {
    this.store.dispatch(UserApiActions.cartdata([]));
    this.store.dispatch(UserApiActions.userdata({}));
    this.localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    // this.userDataUnsubscribe.unsubscribe();
    // this.cartDataUnsubscribe.unsubscribe();
    // this.cartListUnsubscribe.unsubscribe();
  }
}
