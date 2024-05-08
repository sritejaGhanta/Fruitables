import { AfterContentInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../services/http/order/order.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent implements OnInit, AfterContentInit {
  orderId = 0;

  orderDetails: any = {};
  orderAddress: any = {};
  orderItems: any[] = [];
  userData: any = {};

  constructor(
    private orderService: OrderService,
    private art: ActivatedRoute,
    private store: Store,
    private toast: NgToastService
  ) {
    this.orderId = Number(art.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    // @ts-ignore
    this.store.select('user_data').subscribe((data: any) => {
      this.userData = data;
      this.getDetails();
    });
  }
  ngAfterContentInit(): void {
    window.scroll(0, 0);
  }

  getDetails() {
    this.orderService
      .detials(this.orderId, { user_id: this.userData.user_id })
      .subscribe((data: any) => {
        console.log(data);
        this.orderAddress = data.data.address;
        this.orderItems = data.data.get_order_item_details;
        this.orderDetails = data.data.get_order_details;
      });
  }

  cancelOrder() {
    this.orderService
      .cancel(this.orderId, { user_id: this.userData.user_id })
      .subscribe((data: any) => {
        if (data.settings.success) {
          this.orderDetails.order_status = 'CANCELLED';
          let date =
            new Date()
              .toLocaleString()
              .split(', ')[0]
              .split('/')
              ?.reverse()
              .join('-') + ' ';
          this.orderDetails.updatedAt =
            date +
            new Date().toLocaleTimeString('en-US', {
              hour12: true,
              hour: 'numeric',
              minute: 'numeric',
            });
          this.toast.success({
            detail: 'Success message',
            summary: data.settings.message,
          });
        } else {
          this.toast.error({
            detail: 'Error message',
            summary: data.settings.message,
          });
        }
      });
  }
}
