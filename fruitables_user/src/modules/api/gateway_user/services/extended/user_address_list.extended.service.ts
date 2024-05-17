import { Injectable } from '@nestjs/common';

import { UserAddressListService } from '../user_address_list.service';

@Injectable()
export class UserAddressListExtendedService extends UserAddressListService {
  getWhereClause(queryObject, inputParams, extraConfig) {
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
      id: 'ua.id',
      user_id: 'ua.iUserId',
      land_mark: 'ua.vLandMark',
      address: 'ua.vAddress',
      state_name: 'ua.vStateName',
      countr_name: 'ua.vCountrName',
      pin_code: 'ua.vPinCode',
      status: 'ua.eStatus',
    };
  }
}
