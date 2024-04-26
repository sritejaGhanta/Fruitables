import { createActionGroup } from '@ngrx/store';

export const ProductApiActions = createActionGroup({
  source: 'Products API',
  events: {
    productCategories: (prop: any) => prop,
    productListData: (prop: any) => prop,
  },
});
