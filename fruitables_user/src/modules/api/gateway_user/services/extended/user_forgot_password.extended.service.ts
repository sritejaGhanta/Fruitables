import { Injectable } from '@nestjs/common';

import { UserForgotPasswordService } from '../user_forgot_password.service';

@Injectable()
export class UserForgotPasswordExtendedService extends UserForgotPasswordService {

  genarateOtp(){
    return {
      //@ts-ignore
      otp: this.gernral.generateOTPCode()
    }
  }
}