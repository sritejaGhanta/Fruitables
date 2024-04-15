import { Injectable } from '@nestjs/common';

import * as custom from 'src/utilities/custom-helper';


import { CustomerLoginService } from '../customer_login.service';

@Injectable()
export class CustomerLoginExtendedService extends CustomerLoginService {

  checkIP = (value, inputParams) => {
    const ipAddress = custom.getIPAddress(this.requestObj);
    return ipAddress;
  }
}