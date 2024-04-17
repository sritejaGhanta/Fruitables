import { Injectable } from '@nestjs/common';

import { UserListService } from '../user_list.service';

@Injectable()
export class UserListExtendedService extends UserListService {

  getWhereClause(queryObject, inputParams, extraConfig){
    const aliasList = this.getColumnAliases();
    this.general.prepareListingCriteriaWhere(inputParams, aliasList, queryObject);
  };

  getOrderByClause(queryObject, inputParams, extraConfig){
  	const aliasList = this.getColumnAliases();
  	this.general.prepareListingCriteriaOrderBy(inputParams, aliasList, queryObject);
  };

  getColumnAliases(){
    return {
      user_id: 'u.iUserId',
      createdAt: 'u.createdAt',
      updatedAt: 'u.updatedAt',
      first_name: 'u.vFirstName',
      last_name: 'u.vLastName',
      email: 'u.vEmail',
      password: 'u.vPassword',
      profile_image: 'u.vProfileImage',
      status: 'u.eStatus',
      phone_number: 'u.vPhoneNumber',
      dial_code: 'u.vDialCode',
      otp_code: 'u.vOtpCode',
    
    }
  }
}