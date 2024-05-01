import { AfterContentInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbPaginationModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from '../../../services/http/order/order.service';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-orders-list',
  standalone: true,
  imports: [CommonModule, NgbPaginationModule, FormsModule, RouterLink],
  templateUrl: './my-orders-list.component.html',
  styleUrls: ['./my-orders-list.component.scss'],
})
export class MyOrdersListComponent implements AfterContentInit {
  page: any = 1;
  limit = 5;
  totalOrdersCount = 100;

  userData: any = {};
  orderData: any = [];
  constructor(private orderService: OrderService, private store: Store) {
    // @ts-ignore
    this.store.select('user_data').subscribe((data: any) => {
      this.userData = data;
      this.getOrderList();
    });
  }

  ngAfterContentInit(): void {
   
  }


  getOrderList() {
    window.scroll(0,0)
    document.getElementById("scroller")?.scroll(0,0)
    if (this.userData.user_id || 1) {
      this.orderService
        .list({
          user_id: this.userData.user_id,
          page_index: this.page,
          limit: this.limit,
        })
        .subscribe((data: any) => {
          this.orderData = data.data;
          this.totalOrdersCount = data.settings.count;
          this.limit = data.settings.per_page;
          this.page = data.settings.curr_page;
        });
    }
  }

  countChange(e: any) {
    this.limit = Number(e);
    this.getOrderList();
  }

  paginationChange(e: any) {
    this.getOrderList();
  }
}
