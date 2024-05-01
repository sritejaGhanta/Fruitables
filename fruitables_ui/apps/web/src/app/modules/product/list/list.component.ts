import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren, inject } from '@angular/core';
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

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, NgFor, NgbPaginationModule, RouterLink, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit, AfterViewInit {
  constructor(
    private productsService: ProductsService,
    private cdr: ChangeDetectorRef,
    private categoryService: CategoryService,
    private userService: UserService,
    private ls: LocalStorage,
    private env: Environment,
    private router: Router,
    private store: Store<any>,
    private renderer: Renderer2, private el: ElementRef
  ) {}

  productkeyword: any = '';
  productPriceRange: any = '';
  productCategorys: any;
  startIndexForVegitables: Number = 0;
  filtersArr: any = [];
  keyword: any = '';
  pagelimit: any = 9;
  productData: any;
  featuredproductData: any;
  productSettingData: any;
  sort: any = [];
  fitersArray: any = [{ key: '', value: '' }];

  paramsObj: any = {
    filters: this.fitersArray,
    keyword: this.productkeyword,
    limit: this.pagelimit,
    page: 1,
    sort: [{ prop: '', dir: '' }],
    review_products: 'yes',
  };

  storeProductList: boolean = false;

  ngOnInit(): void {
    // this.store.select('product_list_data').subscribe((data: any) => {
    //   if (Object.values(data).length) this.storeProductList = true;
    //   console.log(data);
    //   // this.productList(this.paramsObj);
    // });
    // if (!this.storeProductList) {
    this.categoryService.list({ limit: 10000 }).subscribe((result: any) => {
      this.productCategorys = result.data;
      this.store.dispatch(ProductApiActions.productCategories(result.data));
      this.startIndexForVegitables = result.data[0]?.id;
    });
    this.productList(this.paramsObj);
    

    // }
  }
  @ViewChildren('scrollContainer') scrollContainers?: QueryList<any>;

  ngAfterViewInit() {
    // console.log(this.scrollContainers)
    // this.scrollContainers?.forEach(container => {
    //   console.log(container)
    //   container.nativeElement.scrollTop = 0;
    // });

    document.addEventListener("DOMContentLoaded", function() {
      // Scroll to the top of the container when the document is loaded
      var scrollContainer = document.getElementById("scrollContainer");
      if (scrollContainer) {
          scrollContainer.scrollTop = 0;
      }
  });

  }

  productSearch() {
    console.log(this.paramsObj);
    this.paramsObj = { ...this.paramsObj, keyword: this.productkeyword };
    this.productList(this.paramsObj);
  }

  priceChange(ele: any) {
    let obj = { key: 'product_cost', value: ele.innerText };
    this.filterArrayFunction(obj);
    this.paramsObj = { ...this.paramsObj, filters: this.fitersArray };
    this.productList(this.paramsObj);
  }
  productList(obj: any) {
    this.productsService.list(obj).subscribe((ele: any) => {
      this.productData = ele.data?.get_products_list;
      this.featuredproductData = ele.data?.reviewproductslist;
    });
  }

  getCategoryProducts(categoryId: any) {
    let obj = { key: 'product_category_id', value: categoryId };
    this.filterArrayFunction(obj);
    this.paramsObj = { ...this.paramsObj, filters: this.fitersArray };

    this.productList(this.paramsObj);
  }

  viewallFeaturedProducts() {
    let obj = { key: 'rating', value: '> 3.9' };
    this.filterArrayFunction(obj);
    this.paramsObj = { ...this.paramsObj, filters: this.fitersArray };
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
    this.paramsObj = {
      filters: [{ key: '', value: '' }],
      keyword: '',
      limit: 9,
      page: 1,
      sort: [{ prop: '', dir: '' }],
    };
    this.productList(this.paramsObj);
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

  productAddtoCart(item: any) {
    let obj = {
      product_qty: 1,
    };

    this.productsService.productAddToCart(item, obj);
  }
}
