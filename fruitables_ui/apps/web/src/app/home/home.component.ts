import { AfterContentInit, Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { BrowserAnimationsModule, provideAnimations, provideNoopAnimations } from '@angular/platform-browser/animations';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../services/http/products/category.service'
import { ProductsService } from '../services/http/products/products.service'


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CarouselModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('autoHeight', [
      state('inactive', style({ height: '0px' })),
      state('active', style({ height: '*' })),
      transition('inactive <=> active', animate('200ms ease-in-out'))
    ])
  ],
  providers: [
    provideAnimations(),
    provideNoopAnimations(),
  ],
  
})
export class HomeComponent{
  customOptions: OwlOptions = {
    autoplay: true,
    smartSpeed: 1500,
    center: false,
    dots: true,
    loop: true,
    margin: 25,
    nav : true,
    navText : [
        '<i class="bi bi-arrow-left"></i>',
        '<i class="bi bi-arrow-right"></i>'
    ],
    // responsiveClass: true,
    responsive: {
        0:{
            items:1
        },
        576:{
            items:1
        },
        768:{
            items:2
        },
        992:{
            items:3
        },
        1200:{
            items:4
        }
    }
  }
  
  productCategorys: any[] = [];
  categoryWiseProducts:any = {};
  products:any[] = [];
  startIndexForVegitables: Number = 0;

  constructor(private categoryService: CategoryService, private productService:ProductsService){
    this.categoryService.list({limit: 10000}).subscribe((result:any) => {
      this.productCategorys = result.data
      this.startIndexForVegitables = result.data[0]?.id
    })

    this.productService.dashBoardProducts().subscribe((result:any) => {
      result.data.map((e:any) => {
        if(!this.categoryWiseProducts[e.product_category_id]){
          this.categoryWiseProducts[e.product_category_id] = [];
        }
        this.categoryWiseProducts[e.product_category_id].push(e);
      })
    })
    this.productService.list({limit: 1000}).subscribe((result:any) => {
      this.products = result.data
    })
  }
}
