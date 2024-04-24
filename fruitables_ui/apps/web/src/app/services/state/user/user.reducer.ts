import { UserApiActions } from './user.action';
import { createReducer, on } from '@ngrx/store';
const initialState: any = [];

export const userReducer = createReducer(
  initialState,
  on(UserApiActions.userdata, (state: any, data: any): any => {
    return (state = data);
  })
);

const initialCartState: any = [];
export const cartReducer = createReducer(
  initialCartState,
  on(UserApiActions.cartdata, (state: any, data: any): any => {
    console.log(data);
    // let newState = Object.values(state);
    let resData: any[] = [];
    if (Object.values(state).length) {
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

      // Object.values(state).map((ele: any) => {
      //   if (ele.product_id != data.product_id) {
      //     console.log('============here');
      //     resData.push(data);
      //     // return [...resData, data];
      //   }
      // });

      // if (
      //   Object.values(newState).filter(
      //     (ele: any) => ele.product_id != data.product_id
      //   )
      // ) {
      //   resData.push(data);
      // }
      console.log(resData);
      // newState = newState.concat(resData);
      // return resData;
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
