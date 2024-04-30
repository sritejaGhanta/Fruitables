import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { ProductsService } from '../../../services/http/products/products.service';
import { RattingComponentComponent } from '../../../genral-components/ratting-component/ratting-component.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RattingComponentComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit {
  wishlistData: any;
  wishlistEmptyStatus: boolean = false;
  constructor(
    private store: Store<any>,
    private cdr: ChangeDetectorRef,
    private productsService: ProductsService
  ) {}
  ngOnInit(): void {
    this.store.select('wishlist_data').subscribe((data: any) => {
      if (data != undefined && data != null) {
        if (Object.values(data) && Object.values(data).length > 0) {
          const filteredCartItems = Object.values(data).filter(
            (item: any) => typeof item !== 'string'
          );
          if (filteredCartItems.length < 1) {
            this.wishlistEmptyStatus = true;
          } else {
            this.wishlistEmptyStatus = false;
          }
          this.cdr.detectChanges();
          this.wishlistData = filteredCartItems;
        } else {
          this.wishlistData = [];
          this.wishlistEmptyStatus = true;
          this.cdr.detectChanges();
        }
      } else {
        this.wishlistData = [];
        this.cdr.detectChanges();
      }
    });
  }

  deleteProductItem(item: any) {
    let obj = {
      product: item,
      method: 'RemovetoWishlist',
    };
    this.productsService.productAddToWishlist(obj);
  }
}
