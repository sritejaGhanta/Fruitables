import { Injectable } from '@nestjs/common';

import { ResendCustomerVerifyEmailService } from '../resend_customer_verify_email.service';

@Injectable()
export class ResendCustomerVerifyEmailExtendedService extends ResendCustomerVerifyEmailService {

  getCustomerVerifyEmailLink =async inputParams => {
    const verifyCode = this.general.generateOTPCode();
  
    const keysObject = {
      email: inputParams.mc_email,
      code: verifyCode,
      pass: 0
    };
    const encToken = await this.general.encryptVerifyToken(keysObject);
    // TODO: Website route link
    const verifyLink = `${this.general.getConfigItem('site_url')}/verify-email/${encToken}`
    const fullName = `${inputParams.mc_first_name} ${inputParams.mc_last_name}`;
  
    const returnData = {
      full_name: fullName,
      verify_code: verifyCode,
      verify_link: verifyLink,
    };
  
    return returnData;
  }
}