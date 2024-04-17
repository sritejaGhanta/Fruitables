import { Injectable } from '@nestjs/common';

import { CartItemListService } from '../cart_item_list.service';

@Injectable()
export class CartItemListExtendedService extends CartItemListService {

  getWhereClause(queryObject, inputParams, extraConfig){
    const aliasList = this.getColumnAliases();
    this.general.prepareListingCriteriaWhere(inputParams, aliasList, queryObject);
  };

  getOrderByClause(queryObject, inputParams, extraConfig){
  	const aliasList = this.getColumnAliases();
  	this.general.prepareListingCriteriaOrderBy(inputParams, aliasList, queryObject);
  };

  getColumnAliases(){
    return {
      id: 'ci.id',
      cart_id: 'ci.iCartId',
      product_id: 'ci.iProductId',
      product_qty: 'ci.iProductQty',
    
    }
  }
}