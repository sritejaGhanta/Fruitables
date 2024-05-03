import {
  AfterContentInit,
  AfterViewInit,
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ratting-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ratting-component.component.html',
  styleUrl: './ratting-component.component.css',
})
export class RattingComponentComponent implements AfterViewInit {
  @Input('ratting')
  ratting: string | any;

  ngAfterViewInit(): void {
    // this.ratting = Number(this.ratting) + 1;
  }
}
