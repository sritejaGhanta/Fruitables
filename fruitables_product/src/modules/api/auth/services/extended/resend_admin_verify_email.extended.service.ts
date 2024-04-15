import { Injectable } from '@nestjs/common';

import { ResendAdminVerifyEmailService } from '../resend_admin_verify_email.service';

@Injectable()
export class ResendAdminVerifyEmailExtendedService extends ResendAdminVerifyEmailService {

  getAdminVerifyEmailLink = async (inputParams, reqObject) => {
    try {
      const verifyCode = this.general.generateOTPCode();
    
      const encToken = await this.general.encryptVerifyToken({
        type: 'resend',
        email: inputParams.ma_email.toLowerCase(),
        code: verifyCode,
      });
      const verifyLink=`${this.general.getConfigItem('admin_url')}/verify-email/${encToken}`;
  
      return {
        verify_code: verifyCode,
        verify_link: verifyLink,
      };
    } catch(error) {
      this.log.error(error);
    }
    return {};
  }
}