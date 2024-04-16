import { Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { ProfileComponent } from './profile/profile.component';

export const USER_ROUTING: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [{ path: 'profile', component: ProfileComponent }],
  },
];
