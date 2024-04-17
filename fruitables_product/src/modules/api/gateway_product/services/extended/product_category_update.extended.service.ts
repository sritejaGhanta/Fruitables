import { Injectable } from '@nestjs/common';

import { ProductCategoryUpdateService } from '../product_category_update.service';

@Injectable()
export class ProductCategoryUpdateExtendedService extends ProductCategoryUpdateService {

  getWhereClause(queryObject, inputParams, extraConfig) {
  	queryObject.where('pc.id <> :id', { id: inputParams.id });
  }
}