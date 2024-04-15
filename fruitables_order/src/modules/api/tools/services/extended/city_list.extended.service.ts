import { Injectable } from '@nestjs/common';

import { CityListService } from '../city_list.service';

@Injectable()
export class CityListExtendedService extends CityListService {

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
      city_id: 'mc.id',
      city_name: 'mc.city',
      city_code: 'mc.cityCode',
      country_id: 'mc.countryId',
      country_name: 'mc1.country',
      state_id: 'mc.stateId',
      state_name: 'ms.state',
      status: 'mc.status',
    }
  }
}