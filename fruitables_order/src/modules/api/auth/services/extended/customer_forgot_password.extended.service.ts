import { Injectable } from '@nestjs/common';

import { CustomerForgotPasswordService } from '../customer_forgot_password.service';

@Injectable()
export class CustomerForgotPasswordExtendedService extends CustomerForgotPasswordService {

  getCustomerResetPasswordCode = inputParams => {
    const resetCode = this.general.generateOTPCode();
    const fullName = `${inputParams.mc_first_name} ${inputParams.mc_last_name}`;
  
    const returnData = {
      full_name: fullName,
      reset_code: resetCode,
    };
  
    return returnData;
  }
}