import { Injectable } from '@nestjs/common';

import { CustomerResetPasswordService } from '../customer_reset_password.service';

@Injectable()
export class CustomerResetPasswordExtendedService extends CustomerResetPasswordService {

  passwordEncrypt= async (password, inputParams, requestObj)=>{
   return await this.general.encryptPassword(password, inputParams, requestObj);
  }
}