import { Injectable } from '@nestjs/common';

import { CountryListService } from '../country_list.service';

@Injectable()
export class CountryListExtendedService extends CountryListService {

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
      country_id: 'id',
      country_name: 'country',
      country_code: 'countryCode',
      country_code_iso3: 'countryCodeISO3',
      status: 'status',
    }
  };
}