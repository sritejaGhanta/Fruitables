import { Injectable } from '@nestjs/common';

import { VerifyCustomerEmailService } from '../verify_customer_email.service';

@Injectable()
export class VerifyCustomerEmailExtendedService extends VerifyCustomerEmailService {

  decodeCustomerVerifyToken = async inputParams => {
    const keysObject = await this.general.decryptVerifyToken(inputParams.verify_token);

    const returnData = {
      verify_code: keysObject.code,
      customer_email: keysObject.email,
      set_password: keysObject.pass,
    };
    return returnData;
  }

  setPasswordFlag = (value, data, idx, inputParams) => {
    return inputParams.set_password;
  }
}