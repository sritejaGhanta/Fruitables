import { Injectable } from '@nestjs/common';

import { AdminAddService } from '../admin_add.service';

@Injectable()
export class AdminAddExtendedService extends AdminAddService {

  getAdminVerifyEmailLink = async inputParams => {
    const verifyCode = this.general.generateOTPCode();
    const otpCode = this.general.generateOTPCode();
  
    const tokenInfo = {
      type: 'addnew',
      email: inputParams.email,
      code: verifyCode
    };
    const encToken = await this.general.encryptVerifyToken(tokenInfo);
    const verifyLink = `${this.general.getConfigItem('admin_url')}/verify-email/${encToken}`;
  
     return {
      otp_code: otpCode,
      verify_code: verifyCode,
      verify_link: verifyLink,
    };
  }
}