import { Injectable } from '@nestjs/common';

import { ProductsListService } from '../products_list.service';

@Injectable()
export class ProductsListExtendedService extends ProductsListService {

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
      id: 'p.id',
      product_name: 'p.vProductName',
      product_image: 'p.vProductImage',
      product_cost: 'p.fProductCost',
      product_description: 'p.vProductDescription',
      rating: 'p.fRating',
      product_category_id: 'p.iProductCategoryId',
      status: 'p.eStatus',
      offer_type: 'p.eOfferType',
    
    }
  }
}