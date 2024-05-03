import { Injectable } from '@nestjs/common';

import { CustomerRegistrationService } from '../customer_registration.service';

@Injectable()
export class CustomerRegistrationExtendedService extends CustomerRegistrationService {

  getCustomerVerifyEmailLink = async inputParams => {
    const verifyCode = this.general.generateOTPCode();
    const otpCode = this.general.generateOTPCode();
  
    const keysObject = {
      email: inputParams.email,
      code: verifyCode,
      pass: 1,
    };
    const encToken = await this.general.encryptVerifyToken(keysObject);
    // TODO: Website route link
    const verifyLink = `${this.general.getConfigItem('site_url')}/verify-email/${encToken}`;
    const fullName = `${inputParams.first_name} ${inputParams.last_name}`;
  
    const returnData = {
      full_name: fullName,
      verify_code: verifyCode,
      verify_link: verifyLink,
      otp_code: otpCode,
    };
  
    return returnData;
  }
}