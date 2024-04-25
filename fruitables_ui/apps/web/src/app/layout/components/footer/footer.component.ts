import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { from } from 'rxjs';
import { ContactUsService } from '../../../services/http/dashboard/contact.us.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  //gust subscribe form varinable
  gustSubscribe: any;

  constructor(private contactUs: ContactUsService) {
    this.gustSubscribe = new FormGroup({
      email: new FormControl('tejacharanghanta@yopmail.com', [
        Validators.required,
      ]),
    });
  }

  //contact us form submite
  contactMe() {
    if (this.gustSubscribe.valid) {
      this.contactUs
        .subscribeMe(this.gustSubscribe.value)
        .subscribe((result: any) => {});
    } else {
      // TO DO show alert message
    }
  }
}
