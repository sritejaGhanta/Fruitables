import { Injectable } from '@nestjs/common';

import appConfig from 'src/config/appConfig';

import { AdminForgotPasswordService } from '../admin_forgot_password.service';

@Injectable()
export class AdminForgotPasswordExtendedService extends AdminForgotPasswordService {

  getVerifyEmailLink = async (inputParams) => {
    try {
      const expirySec = appConfig().OTP_EXPIRY_SECONDS;
      const expiryTime = await this.general.getDateTime('datetime_after', {
        value: expirySec,
        type: 'seconds',
      });
   
      const tokenIssued = await this.general.getDateTime('timems', {});
      const tokenExpire = await this.general.getDateTime('timems', {
        value: new Date(expiryTime),
      });
      const verifyCode = await this.general.generateOTPCode();
    
      const encToken = await this.general.encryptVerifyToken({
        type: 'forgot',
        email: inputParams.email.toLowerCase(),
        code: verifyCode,
        iat: tokenIssued,
        exp: tokenExpire,
      });
      const resetLink=`${this.general.getConfigItem('admin_url')}/verify-email/${encToken}`;
    
      return {
        token: encToken,
        verify_code: verifyCode,
        reset_link: resetLink,
        expire_min: expirySec/60,
      };
    } catch(error) {
      this.log.error(error);
    }
    return {};
  };
}