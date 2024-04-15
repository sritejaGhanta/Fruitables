import { Injectable } from '@nestjs/common';

import { AdminResetPasswordService } from '../admin_reset_password.service';

@Injectable()
export class AdminResetPasswordExtendedService extends AdminResetPasswordService {

  decryptToken = async (inputParams) => {
    try {
      const tokenInfo:any = await this.general.decryptVerifyToken(inputParams.token);
      return {
        code: tokenInfo.code,
        email: tokenInfo.email,
      };
    } catch(error) {
      this.log.error('[decryptToken] >> Error ', error);
    }
    return {};
  };
}