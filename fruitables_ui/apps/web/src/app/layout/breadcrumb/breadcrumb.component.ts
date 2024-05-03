import { AfterViewChecked, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent implements AfterViewChecked {
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    // console.log(activatedRoute.snapshot.data['breadcrumb']);
  }

  ngAfterViewChecked(): void {
    // console.log(this.activatedRoute.data);
  }
}
