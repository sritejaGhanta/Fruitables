import { Routes } from '@angular/router';

export const APP_ROUTING: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('../app/layout/layout.route').then((m) => m.LAYOUT_ROUTING),
  },
];
