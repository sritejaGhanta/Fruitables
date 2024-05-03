import { Injectable } from '@nestjs/common';

import { DashboardProductsService } from '../dashboard_products.service';

@Injectable()
export class DashboardProductsExtendedService extends DashboardProductsService {


  applyWhere(quaryObj, inputParms){
    quaryObj.innerJoin(`(
      SELECT id, iProductCategoryId, vProductName, vProductImage, fProductCost, vProductDescription, fRating, eStatus, eOfferType,
             ROW_NUMBER() OVER(PARTITION BY iProductCategoryId ORDER BY fRating DESC) AS row_num
      FROM products
  )`, 'ranked_products', `p.id = ranked_products.id`);
    quaryObj.where(`ranked_products.row_num <= 4`);
    quaryObj.orderBy(`p.iProductCategoryId`, `DESC`);
    quaryObj.addOrderBy(`p.fRating`, `DESC`)
  
  }
}