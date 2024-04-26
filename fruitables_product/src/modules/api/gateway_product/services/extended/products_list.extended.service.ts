import { Injectable } from '@nestjs/common';

import { ProductsListService } from '../products_list.service';

@Injectable()
export class ProductsListExtendedService extends ProductsListService {
  getWhereClause(queryObject, inputParams, extraConfig) {
    if ('keyword' in inputParams && inputParams.keyword) {
      queryObject.where(`(p.vProductName LIKE %${inputParams.keyword}%)`);
    }
    if ('filters' in inputParams && inputParams.filters.length) {
      let price;
      let rating;
      inputParams.filters.map((e) => {
        if (e.key == 'price') {
          price = e;
        }
        if (e.key == 'rating') {
          rating = e;
        }
      });
      if (price) {
        queryObject.where(`(p.fProductCost < %${price.value}%)`);
      }
      if (rating) {
        let symboles = rating.value.split(' ');
        if (symboles[0] == '>') {
          queryObject.where(`(p.fRating > ${Number(symboles[1])})`);
        } else {
          queryObject.where(`(p.fRating < ${Number(symboles[1])})`);
        }
      }
    }
    const aliasList = this.getColumnAliases();
    this.general.prepareListingCriteriaWhere(
      inputParams,
      aliasList,
      queryObject,
    );
  }

  getOrderByClause(queryObject, inputParams, extraConfig) {
    const aliasList = this.getColumnAliases();
    this.general.prepareListingCriteriaOrderBy(
      inputParams,
      aliasList,
      queryObject,
    );
  }

  getColumnAliases() {
    return {
      id: 'p.id',
      product_name: 'p.vProductName',
      product_image: 'p.vProductImage',
      // product_cost: 'p.fProductCost',
      product_description: 'p.vProductDescription',
      rating: 'p.fRating',
      product_category_id: 'p.iProductCategoryId',
      status: 'p.eStatus',
      offer_type: 'p.eOfferType',
    };
  }
}
