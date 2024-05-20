import { AfterContentInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbPaginationModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from '../../../services/http/order/order.service';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-my-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    NgbPaginationModule,
    FormsModule,
    RouterLink,
    NgSelectModule,
  ],
  templateUrl: './my-orders-list.component.html',
  styleUrls: ['./my-orders-list.component.scss'],
})
export class MyOrdersListComponent implements OnInit {
  page: any = 1;
  limit = 5;
  totalOrdersCount = 100;

  userData: any = {};
  orderData: any = [];
  orderStatusInfo: any = {
    PLACED: 'PLACED',
    DISPATHED: 'DISPATHED',
    OUTOFDELIVERY: 'OUT OF DELIVERY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
  };

  cars = [
    { id: 5, name: '5' },
    { id: 10, name: '10' },
    { id: 20, name: '20' },
    { id: 30, name: '30' },
    { id: 50, name: '50' },
    { id: 100, name: '100' },
  ];
  selectedCar = 5;
  constructor(private orderService: OrderService, private store: Store) {}

  ngOnInit(): void {
    // @ts-ignore
    this.store.select('user_data').subscribe((data: any) => {
      this.userData = data;
      this.getOrderList();
    });
  }

  async getOrderList() {
    window.scroll(0, 0);
    document.getElementById('scroller')?.scroll(0, 0);
    if (this.userData.user_id != undefined) {
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

  countChange() {
    if (this.selectedCar) {
      this.limit = Number(this.selectedCar);
      this.getOrderList();
    }
  }

  paginationChange(e: any) {
    this.getOrderList();
  }
}
