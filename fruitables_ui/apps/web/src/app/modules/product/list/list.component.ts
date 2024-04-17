import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductReviewComponent } from '../product-review/product-review.component';
import { FaqComponent } from '../faq/faq.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ProductReviewComponent, FaqComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {}
