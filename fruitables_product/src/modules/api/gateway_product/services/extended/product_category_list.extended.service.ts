import { Injectable } from '@nestjs/common';

import { ProductCategoryListService } from '../product_category_list.service';

@Injectable()
export class ProductCategoryListExtendedService extends ProductCategoryListService {

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
      id: 'pc.id',
      category_name: 'pc.vCategoryName',
      status: 'pc.eStatus',
    
    }
  }
}