import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ProductsService } from '../../../services/http/products/products.service';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { CategoryService } from '../../../services/http/products/category.service';
import { UserService } from '../../../services/http/user/user.service';
import { LocalStorage } from '../../../services/localStorage/localstorage.services';
import { Environment } from 'apps/web/src/environment/environment';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { UserApiActions } from '../../../services/state/user/user.action';
import { FormsModule } from '@angular/forms';
import { ProductApiActions } from '../../../services/state/product/product.action';
import { RattingComponentComponent } from '../../../genral-components/ratting-component/ratting-component.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NgbPaginationModule,
    RouterLink,
    FormsModule,
    RattingComponentComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit, AfterContentInit {
  constructor(
    private productsService: ProductsService,
    private cdr: ChangeDetectorRef,
    private categoryService: CategoryService,
    private userService: UserService,
    private ls: LocalStorage,
    private env: Environment,
    private router: Router,
    private store: Store<any>,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}
  productkeyword: any = '';
  productPriceRange: any = '';
  productCategorys: any;
  startIndexForVegitables: Number = 0;
  filtersArr: any = [];
  keyword: any = '';
  pagelimit: any = 9;
  pageNumber: any = 1;
  productData: any;
  featuredproductData: any;
  productSettingData: any;
  settingsData: any;
  sort: any = [];
  fitersArray: any = [{ key: '', value: '' }];
  productCategoryId: any;
  progresBar = 0;
  wishlistProduct: boolean = false;
  wishlistProductsData: any;

  paramsObj: any = {
    filters: this.fitersArray,
    keyword: this.productkeyword,
    limit: this.pagelimit,
    page: this.pageNumber,
    sort: [{ prop: '', dir: '' }],
    review_products: 'yes',
  };

  storeProductList: boolean = false;

  ngOnInit(): void {
    this.categoryService.list({ limit: 10000 }).subscribe((result: any) => {
      this.productCategorys = result.data;
      this.startIndexForVegitables = result.data[0]?.id;
    });
    this.productList(this.paramsObj);
  }

  ngAfterContentInit(): void {
    window.scroll(0, 0);
  }

  productSearch() {
    console.log(this.productkeyword);
    this.paramsObj = {
      ...this.paramsObj,
      keyword: this.productkeyword,
      page: 1,
    };
    this.productList(this.paramsObj);
  }

  priceChange(ele: any) {
    let obj = { key: 'product_cost', value: ele.innerText };
    this.filterArrayFunction(obj);
    this.paramsObj = { ...this.paramsObj, filters: this.fitersArray, page: 1 };
    this.productList(this.paramsObj);
  }
  productList(obj: any) {
    this.productsService.list(obj).subscribe((ele: any) => {
      this.productData = ele.data?.get_products_list || [];
      this.cdr.detectChanges();
      this.store.select('wishlist_data').subscribe((data: any) => {
        if (data != undefined && data != null) {
          if (Object.values(data) && Object.values(data).length > 0) {
            let filteredCartItems = Object.values(data).filter(
              (item: any) => typeof item !== 'string'
            );
            this.cdr.detectChanges();

            this.productData.map((product_ele: any) => {
              filteredCartItems.map((in_ele: any) => {
                if (product_ele.id == in_ele.product_id) {
                  this.wishlistProduct = true;
                  let wishlistIcon: any = document.querySelector(
                    `.wishlist_${product_ele.id}`
                  );
                  console.log(in_ele);
                  wishlistIcon?.classList.remove('wishlist');
                  wishlistIcon?.classList.add('filled');
                  this.cdr.detectChanges();
                }
              });
            });
          }
        }
      });
      this.settingsData = ele.settings;
      this.featuredproductData = ele.data?.reviewproductslist || [];
      window.scroll(0, 0);
    });
  }

  getCategoryProducts(categoryId: any) {
    this.productCategoryId = categoryId;
    let obj = { key: 'product_category_id', value: categoryId };
    this.filterArrayFunction(obj);
    this.paramsObj = { ...this.paramsObj, filters: this.fitersArray, page: 1 };
    this.productList(this.paramsObj);
  }

  viewallFeaturedProducts() {
    let obj = { key: 'rating', value: '> 3.9' };
    this.filterArrayFunction(obj);
    this.paramsObj = { ...this.paramsObj, filters: this.fitersArray, page: 1 };
    this.productList(this.paramsObj);
  }

  filterArrayFunction(obj: any) {
    if (
      this.fitersArray.length == 1 &&
      'key' in this.fitersArray[0] &&
      this.fitersArray[0].key == ''
    ) {
      this.filtersArr.push(obj);
      this.fitersArray = this.filtersArr;
    } else {
      let keyFound = false;
      this.fitersArray.map((ele: any, index: any): any => {
        if (ele.key === obj.key) {
          this.fitersArray.splice(index, 1); //.splice(index, 1,obj);
          this.fitersArray.push(obj);
          keyFound = true;
          return true;
        }
      });
      if (!keyFound) {
        this.fitersArray.push(obj);
      }
    }
  }
  clearFilter() {
    this.productCategoryId = 0;
    this.progresBar = 0;
    this.productkeyword = '';
    // @ts-ignore
    document.getElementById('rangeInput').value = 0;
    // @ts-ignore
    document.getElementById('amount').innerHTML = 0;
    this.fitersArray = [];
    this.paramsObj = {
      filters: [{ key: '', value: '' }],
      keyword: '',
      limit: 9,
      page: 1,
      sort: [{ prop: '', dir: '' }],
      review_products: 'yes',
    };
    this.productList(this.paramsObj);
  }

  paginationEvent(data: any) {
    this.paramsObj = { ...this.paramsObj, page: data };
    this.productList(this.paramsObj);
  }

  productAddtoCart(item: any) {
    let obj = {
      product_qty: 1,
    };

    this.productsService.productAddToCart(item, obj);
  }

  productAddtoWishlist(product: any) {
    let wishlistIcon: any = document.querySelector(`.wishlist_${product.id}`);
    if (wishlistIcon?.classList.contains('wishlist')) {
      this.wishlistProduct = true;
      wishlistIcon?.classList.remove('wishlist');
      wishlistIcon?.classList.add('filled');
    } else {
      this.wishlistProduct = false;
      wishlistIcon?.classList.remove('filled');
      wishlistIcon?.classList.add('wishlist');
    }
    let obj: any = {};
    if (this.wishlistProduct) {
      obj['product'] = product;
      obj['method'] = 'AddtoWishlist';
      this.productsService.productAddToWishlist(obj);
    } else {
      obj['product'] = product;
      obj['method'] = 'RemovetoWishlist';
      this.productsService.productAddToWishlist(obj);
    }
    this.cdr.detectChanges();
  }
}
