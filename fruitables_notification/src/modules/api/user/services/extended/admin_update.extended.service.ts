import { Injectable } from '@nestjs/common';

import { AdminUpdateService } from '../admin_update.service';

@Injectable()
export class AdminUpdateExtendedService extends AdminUpdateService {

  getWhereClause = (queryObject, inputParams, extraConfig) => {
  
    queryObject.andWhere('ma.id <> :custom_id', { custom_id: inputParams.id });
    queryObject.andWhere((qb) => {
      qb.where('ma.username = :custom_username', { custom_username: inputParams.username })
        .orWhere('ma.email = :custom_email', { custom_email: inputParams.email });
    })
  
    return 1;
  }

  getUpdateCriteria = (queryObject, inputParams, extraConfig) => {
    const reqObject = extraConfig.request_obj;
    const criteria = {
      can_update: 1,
    };
    const adminUpdateCond = this.general.getAdminWhereCriteria('update', inputParams, queryObject, reqObject);
    if (adminUpdateCond === 0) {
      criteria.can_update = 0;
    }
    return criteria;
  };
}