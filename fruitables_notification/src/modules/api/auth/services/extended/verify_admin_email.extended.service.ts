import { Injectable } from '@nestjs/common';

import { VerifyAdminEmailService } from '../verify_admin_email.service';

@Injectable()
export class VerifyAdminEmailExtendedService extends VerifyAdminEmailService {

  decodeAdminVerifyToken = async inputParams => {
    const keysObject:any = await this.general.decryptVerifyToken(inputParams.verify_token);

    const returnData = {
      verify_code: keysObject.code,
      admin_email: keysObject.email,
      set_password: keysObject.pass || 0,
    };
  
    return returnData;
  }

  setPasswordFlag = (value, data, wholeData) => {
    let inputParams = wholeData.params;
    return inputParams.set_password;
  }
}