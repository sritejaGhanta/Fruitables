import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { from } from 'rxjs';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/http/user/user.service';
import { NgToastService } from 'ng-angular-popup';

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

  constructor(private userService: UserService, private toast: NgToastService) {
    this.gustSubscribe = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  //contact us form submite
  subscribe() {
    if (this.gustSubscribe.valid) {
      this.userService
        .subscribeMe(this.gustSubscribe.value)
        .subscribe((result: any) => {
          if (result.settings.success) {
            this.toast.success({
              detail: 'Success message',
              summary: result.settings.message,
            });
            this.gustSubscribe.reset();
          } else {
            this.toast.error({
              detail: 'Error message',
              summary: result.settings.message,
            });
          }
        });
    } else {
      this.toast.error({
        detail: 'Error message',
        summary: 'Please enter a valid Email',
      });
    }
  }
}
