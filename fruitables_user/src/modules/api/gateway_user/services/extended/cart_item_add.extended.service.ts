import { Injectable } from '@nestjs/common';

import { CartItemAddService } from '../cart_item_add.service';

@Injectable()
export class CartItemAddExtendedService extends CartItemAddService {

  async getProductCostInCart(inputparams){
  
    let productCost = inputparams.external_api.product_cost
    return {product_costs:productCost}
  }
}