import { UserApiActions } from './user.action';
import { createReducer, on } from '@ngrx/store';
const initialState: any = {};

export const userReducer = createReducer(
  initialState,
  on(UserApiActions.userdata, (state: any, data: any): any => {
    let resdata = { ...state, ...data };
    return resdata;
  })
);

const initialCartState: any = [];
export const cartReducer = createReducer(
  initialCartState,
  on(UserApiActions.cartdata, (state: any, data: any): any => {
    let resData: any[] = [];
    if (Object.values(state).length) {
      let productId: any = [];

      Object.values(state).filter((ele: any) => {
        if (typeof ele !== 'string') {
          productId.push(ele.product_id);
        }
      });
      if (productId.includes(data.product_id)) {
        resData = Object.values(state).map((ele: any) => {
          if (
            ele.product_id == data.product_id &&
            ('quantity' in data || 'method' in data)
          ) {
            let resQty;
            if (data.quantity == 'inc') {
              resQty = ele.product_qty + data.product_qty;
            } else if (data.quantity == 'dec') {
              resQty = ele.product_qty + data.product_qty;
            } else if (data.method == 'AddtoCart') {
              resQty = ele.product_qty + data.product_qty;
            }
            return { ...ele, product_qty: resQty };
          }
          return ele;
        });
      } else {
        resData = [...Object.values(state), data];
      }

      return (state = resData);
    } else {
      return (state = data);
    }

    // console.log(data);
    // const existingProductIndex = state.findIndex(
    //   (item: any) => item.product_id === data.product_id
    // );
    // if (existingProductIndex !== -1) {
    //   // If the product already exists, update its quantity
    //   const updatedState = [...state];
    //   updatedState[existingProductIndex].product_qty += 1;
    //   return updatedState;
    // } else {
    //   // If the product doesn't exist, add it to the cart
    //   return [...state, { ...data, product_qty: 1 }];
    // }
  })
);
