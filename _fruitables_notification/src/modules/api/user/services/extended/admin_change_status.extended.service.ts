import { Injectable } from '@nestjs/common';

import { AdminChangeStatusService } from '../admin_change_status.service';

@Injectable()
export class AdminChangeStatusExtendedService extends AdminChangeStatusService {

  getWhereClause = (queryObject, inputParams, extraConfig) => {
  
    const reqObject = extraConfig.request_obj;
    const adminChangeCond = this.general.getAdminWhereCriteria('change_status', inputParams, queryObject, reqObject);
    if (adminChangeCond) {
      return adminChangeCond.toString();
    } else {
      return ;
    }
  };
}