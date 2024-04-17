import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthLoyoutComponent } from './auth-layout/auth-loyout.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, AuthLoyoutComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {}
