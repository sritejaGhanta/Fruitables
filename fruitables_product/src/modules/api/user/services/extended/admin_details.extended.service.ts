import { Injectable } from '@nestjs/common';

import { AdminDetailsService } from '../admin_details.service';

@Injectable()
export class AdminDetailsExtendedService extends AdminDetailsService {

  getWhereClause = (queryObject, inputParams, extraConfig) => {
    const reqObject = extraConfig.request_obj;
    const adminDetailCond = this.general.getAdminWhereCriteria('details', inputParams, queryObject, reqObject);
    if (adminDetailCond) {
      return adminDetailCond.toString();
    } else {
      return ;
    }
  };
}