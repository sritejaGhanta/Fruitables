import { Injectable } from '@nestjs/common';

import { AdminTokenVerificationService } from '../admin_token_verification.service';

@Injectable()
export class AdminTokenVerificationExtendedService extends AdminTokenVerificationService {

  async decryptToken(inputParams, reqObj){
    try {
      const tokenInfo = await this.general.decryptVerifyToken(inputParams.token);
      const returnObj = {
        email: tokenInfo.email,
        time: 0,
      };
    
      if ('exp' in tokenInfo){
        returnObj.time = this.general.getDateDiff(tokenInfo.exp, 0, 'seconds');
      } else {
        const time = await this.general.getConfigItem('OTP_EXPIRY_SECONDS');
        returnObj.time = time;
      }
      return returnObj;
    } catch(error) {
      this.log.error('[decryptToken] >> Error ', error);
    }
    return {};
  }
}