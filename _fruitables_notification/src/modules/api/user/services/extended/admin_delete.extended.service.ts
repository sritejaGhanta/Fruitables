import { Injectable } from '@nestjs/common';

import { AdminDeleteService } from '../admin_delete.service';

@Injectable()
export class AdminDeleteExtendedService extends AdminDeleteService {

  getWhereClause = (queryObject, inputParams, extraConfig) => {
    const reqObject = extraConfig.request_obj;
    const adminDeleteCond = this.general.getAdminWhereCriteria('delete', inputParams, queryObject, reqObject);
    if (adminDeleteCond) {
      return adminDeleteCond.toString();
    } else {
      return ;
    }
  };
}