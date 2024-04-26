import { createReducer, on } from '@ngrx/store';
import { ProductApiActions } from './product.action';

const initialCategoriesState: any = [];
export const productCategoriesReducer = createReducer(
  initialCategoriesState,
  on(ProductApiActions.productCategories, (state: any, data: any) => {
    return Object.values(data);
    // return (state = data);
  })
);

const initialproductList = {};
export const productListReducer = createReducer(
  initialproductList,
  on(ProductApiActions.productListData, (state: any, data: any) => {
    return { ...state, ...data };
    // if('filters' in data && data.filters.length){
    //   data.filters.
    // }

    // if (data.component === 'detailComponet') {
    //   delete data.component;
    //   let filtersArr = [];
    //   if (
    //     state.filters.length == 1 &&
    //     'key' in state.filters &&
    //     state.key == ''
    //   ) {
    //     filtersArr.push(data);
    //     state.filters = filtersArr;
    //   } else {
    //     let keyFound = false;
    //     state.filters.map((ele: any, index: any): any => {
    //       if (ele.key === data.key) {
    //         console.log(index);
    //         state.filters.splice(index, 1, data);
    //         keyFound = true;
    //         return true;
    //       }
    //     });
    //     if (!keyFound) {
    //       state.filters.push(data);
    //     }
    //   }
    // } else {
    //   // state = { ...state, ...data };
    //   return data;
    //   // return (state = data);
    // }
  })
);
