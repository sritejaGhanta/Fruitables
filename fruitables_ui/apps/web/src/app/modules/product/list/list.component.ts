import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ProductsService } from '../../../services/http/products/products.service';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { CategoryService } from '../../../services/http/products/category.service';
import { UserService } from '../../../services/http/user/user.service';
import { LocalStorage } from '../../../services/localStorage/localstorage.services';
import { Environment } from 'apps/web/src/environment/environment';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { UserApiActions } from '../../../services/state/user/user.action';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, NgFor, NgbPaginationModule, RouterLink],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent implements OnInit {
  constructor(
    private productsService: ProductsService,
    private cdr: ChangeDetectorRef,
    private categoryService: CategoryService,
    private userService: UserService,
    private ls: LocalStorage,
    private env: Environment,
    private router: Router,
    private store: Store<any>
  ) {}

  productCategorys: any;
  startIndexForVegitables: Number = 0;
  filters: any = [];
  keyword: any = '';
  pagelimit: any = 9;
  productData: any;
  productSettingData: any;
  sort: any = [];
  ngOnInit(): void {
    this.categoryService.list({ limit: 10000 }).subscribe((result: any) => {
      this.productCategorys = result.data;
      this.startIndexForVegitables = result.data[0]?.id;
    });

    let obj = {
      filters: [{ key: '', value: '' }],
      keyword: '',
      limit: this.pagelimit,
      page: 1,
      sort: [{ prop: '', dir: '' }],
    };
    this.productList(obj);
  }

  productList(obj: any) {
    this.productsService.list(obj).subscribe((data: any) => {
      this.productData = data;
    });
  }

  paginationEvent(data: any) {
    // console.log(this.product_dress_type, '===========this.product_dress_type');
    // let obj = {
    //   type: this.categoryType,
    //   page: data.page,
    //   product_dress_type: this.product_dress_type,
    // };
    // console.log(obj);
    let obj = {
      filters: [{ key: '', value: '' }],
      keyword: '',
      limit: this.pagelimit,
      page: data.page,
      sort: [{ prop: '', dir: '' }],
    };
    // if (
    //   (obj.type == '' || obj.type == undefined) &&
    //   (obj.product_dress_type == '' || obj.product_dress_type == undefined)
    // ) {
    //   obj['type'] = 'men';
    // }
    this.productList(obj);
  }

  productAddtoCart(id: any) {
    let obj = {
      product_id: id,
      product_qty: 1,
      method: 'AddtoCart',
    };

    this.productsService.productAddToCart(obj);
  }
}
