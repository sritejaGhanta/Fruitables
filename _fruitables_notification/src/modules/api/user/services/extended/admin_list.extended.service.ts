import { Injectable } from '@nestjs/common';

import { AdminListService } from '../admin_list.service';

@Injectable()
export class AdminListExtendedService extends AdminListService {

  getWhereClause = (queryObject, inputParams, extraConfig) => {
    const reqObject = extraConfig.request_obj;
    this.general.getAdminWhereCriteria('list', inputParams, queryObject, reqObject);
    const aliasList = this.getColumnAliases();
    this.general.prepareListingCriteriaWhere(inputParams, aliasList, queryObject);
  };

  getOrderByClause = (queryObject, inputParams, extraConfig) => {
    const reqObject = extraConfig.request_obj;
    this.general.getAdminWhereCriteria('list', inputParams, queryObject, reqObject);
    const aliasList = this.getColumnAliases();
    this.general.prepareListingCriteriaOrderBy(inputParams, aliasList, queryObject);
  };

  getColumnAliases = () => {
    return {
      admin_id: 'ma.id',
      name: 'ma.name',
      email: 'ma.email',
      username: 'ma.userName',
      phone_number: "ma.phonenumber",
      last_access: "ma.lastLoginAt	",
      modified_date: "ma.updatedAt",
      group_id: 'ma.groupId',
      group_name: 'mgm.groupName',
      group_code: 'mgm.groupCode',
      added_date: 'ma.createdAt',
      status: 'ma.status',
    }
  };
}