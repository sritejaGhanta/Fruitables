import { Injectable } from '@nestjs/common';

import { UserUpdateService } from '../user_update.service';

@Injectable()
export class UserUpdateExtendedService extends UserUpdateService {


  getWhereClause(queryObject, inputParams, extraConfig) {
  	queryObject.where('u.iUserId <> :id', { id: inputParams.id });
  }
}