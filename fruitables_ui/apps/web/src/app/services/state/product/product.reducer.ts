import { createReducer, on } from '@ngrx/store';
import { ProductApiActions } from './product.action';

const initialproductReviewListState: any = [];
export const productReviewListReducer = createReducer(
  initialproductReviewListState,
  on(ProductApiActions.productReviewListData, (state: any, data: any) => {
    if (Object.keys(data).length == 1) {
      return [];
    }
    if (Object.values(state).length) {
      let res_arr: any = [];
      Object.values(state).filter((ele: any) => {
        res_arr.push(ele);
      });
      state = { ...res_arr[0], data };

      return state;
    } else {
      console.log(Object.values(state));
      let resData = [...Object.values(state), data];
      return Object.values(resData);
    }
  })
);
