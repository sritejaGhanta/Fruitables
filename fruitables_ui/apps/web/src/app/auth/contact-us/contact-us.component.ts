import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/http/user/user.service';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent {
  form!: any;
  constructor(private userService: UserService, private toast: NgToastService) {
    this.form = new  FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', [Validators.required])
    })
  }

  get getFrom(){
    return this.form.controls;
  }

  submite(){
    if(this.form.valid){
      this.userService.contactUs(this.form.value).subscribe((data:any) => {
        console.log(data)
        this.toast.success({
          detail: 'Success message',
          summary: data.settings.message,
        });
        this.form.reset()
      })
    } else {
      Object.values(this.form.controls).forEach((control: any) => {
        control.markAsTouched();
      });
    }
  }
}
