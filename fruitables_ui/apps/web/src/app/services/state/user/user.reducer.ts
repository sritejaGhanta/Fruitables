import { UserApiActions } from './user.action';
import { createReducer, on } from '@ngrx/store';
const initialState: any = [];

export const userReducer = createReducer(
  initialState,
  on(UserApiActions.userdata, (state: any, data: any): any => {
    return (state = data);
  })
);
