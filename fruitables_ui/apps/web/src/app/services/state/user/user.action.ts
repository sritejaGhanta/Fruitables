import { createActionGroup, props } from '@ngrx/store';

export const UserApiActions = createActionGroup({
  source: 'Users API',
  events: {
    userdata: (prop: any) => prop,
    cartdata: (prop: any) => prop,
    wishlistdata: (prop: any) => prop,
  },
});
