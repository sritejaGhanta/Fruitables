import { Injectable } from '@nestjs/common';

import { CustomerAddService } from '../customer_add.service';

@Injectable()
export class CustomerAddExtendedService extends CustomerAddService {


  getCustomerVerifyEmailLink = async (inputParams) => {
    const verifyCode = this.general.generateOTPCode();
    const resetCode = this.general.generateOTPCode();
  
    const tokenInfo = {
      email: inputParams.email,
      code: verifyCode,
      pass: 1,
    };
    const encToken = await this.general.encryptVerifyToken(tokenInfo);
    // TODO: Website route link
    const verifyLink = `${this.general.getConfigItem('site_url')}/verify-email/${encToken}`;
    const fullName = `${inputParams.first_name} ${inputParams.last_name}`;
  
    return {
      full_name: fullName,
      reset_code: resetCode,
      verify_code: verifyCode,
      verify_link: verifyLink,
    };
  }
}