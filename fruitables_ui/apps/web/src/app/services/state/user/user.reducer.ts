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
    console.log(data);
    let resData: any[] = [];
    if (state.length < 1) {
      state = { ...state, data };
      console.log(state);
      if ('data' in state) {
        if ('method' in data || 'quantity' in data) {
          return [data];
        } else {
          return data;
        }
      }
      // state.push(data);
      // return state;
    }

    if ('detele_product' in data) {
      let filterProducts = Object.values(state).filter(
        (ele: any) =>
          ele.product_id != data.detele_product && typeof ele !== 'string'
        // if (typeof ele !== 'string') {
        // productId.push(ele.product_id);
        // }
      );
      
      return filterProducts;
    }
    if (Object.keys(data).length == 1) {
      return [];
    }

    if (Object.values(state).length) {
      let productId: any = [];
      let cartStateus = false;
      Object.values(state).filter((ele: any) => {
        if (typeof ele !== 'string') {
          productId.push(ele.product_id);
        }
      });

      if (Object.values(state).includes('first_time')) {
        let resData = Object.values(state).filter(
          (ele: any) => ele != 'first_time'
        );
        return resData;
      } else {
        if (productId.includes(data.product_id)) {
          cartStateus = true;
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
      }

      return (state = resData);
    } else {
      return (state = data);
    }
  })
);
