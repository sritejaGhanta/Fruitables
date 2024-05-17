import { createActionGroup } from '@ngrx/store';

export const ProductApiActions = createActionGroup({
  source: 'Products API',
  events: {
    // productListData: (prop: any) => prop,
    productReviewListData: (prop: any) => prop,
  },
});
