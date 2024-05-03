import { Injectable } from '@nestjs/common';

import { WishlistListService } from '../wishlist_list.service';

@Injectable()
export class WishlistListExtendedService extends WishlistListService {

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
      id: 'w.id',
      user_id: 'w.iUserId',
      product_id: 'w.iProductId',
    
    }
  }
}