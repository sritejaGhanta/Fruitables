import { Injectable } from '@nestjs/common';

import { CustomerListService } from '../customer_list.service';

@Injectable()
export class CustomerListExtendedService extends CustomerListService {

  getWhereClause = (queryObject, inputParams, extraConfig) => {
    if (inputParams.keyword) {
       queryObject.andWhere((qb) => {
          qb.where('firstName LIKE :custom_like', { custom_like: '%'+ inputParams.keyword + '%' })
            .orWhere('lastName LIKE :custom_like1', { custom_like1: '%' + inputParams.keyword + '%' });
        })
    }

    const aliasList = this.getColumnAliases();
    this.general.prepareListingCriteriaWhere(inputParams, aliasList, queryObject);
  };

  getOrderByClause = (queryObject, inputParams, extraConfig) => {
    if (inputParams.keyword) {
      queryObject.andWhere((qb) => {
          qb.where('firstName LIKE :custom_like', { custom_like: '%'+ inputParams.keyword + '%' })
            .orWhere('lastName LIKE :custom_like1', { custom_like1: '%' + inputParams.keyword + '%' });
        })
    }

    const aliasList = this.getColumnAliases();
    this.general.prepareListingCriteriaOrderBy(inputParams, aliasList, queryObject);
  };

  getColumnAliases = () => {
    return {
      customer_id: 'mc.id',
      first_name: 'mc.firstName',
      last_name: 'mc.lastName',
      email: 'mc.email',
      registered_date: 'mc.createdAt',
      status: 'mc.status',
    }
  }
}