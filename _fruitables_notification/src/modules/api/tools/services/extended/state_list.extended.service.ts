import { Injectable } from '@nestjs/common';

import { StateListService } from '../state_list.service';

@Injectable()
export class StateListExtendedService extends StateListService {

  getWhereClause = (queryObject, inputParams, extraConfig) => {
    const aliasList = this.getColumnAliases();
    this.general.prepareListingCriteriaWhere(inputParams, aliasList, queryObject);
  };

  getOrderByClause = (queryObject, inputParams, extraConfig) => {
    const aliasList = this.getColumnAliases();
    this.general.prepareListingCriteriaOrderBy(inputParams, aliasList, queryObject);
  };

  getColumnAliases = () => {
    return {
       state_id: 'ms.id',
      state_name: 'ms.state',
      state_code: 'ms.stateCode',
      country_id: 'ms.countryId',
      country_name: 'mc.country',
      country_code: 'mc.countryCode',
      status: 'ms.status',
    }
  }
}