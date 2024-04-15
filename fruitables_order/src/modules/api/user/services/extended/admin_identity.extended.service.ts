import { Injectable } from '@nestjs/common';

import appConfig from 'src/config/appConfig';
import * as _ from 'lodash';


import { AdminIdentityService } from '../admin_identity.service';

@Injectable()
export class AdminIdentityExtendedService extends AdminIdentityService {


  parseCapabilities = (params) => {
    let result = [];
    try {
      result = JSON.parse(params);
    } catch (err) {
      this.log.error('[parseCapability] >> Error ', err);
    }
    return result;
  };

  setCapabilities = async (params, reqObject) => {
    const restrictAdminGroups = appConfig().restrict_admin_groups;
    console.log(params.get_admin_data, "params.get_admin_data");
    if(params.get_admin_data && Object.keys(params.get_admin_data).length) {
      const { groupCode } = params.get_admin_data[0];
      if (_.isArray(restrictAdminGroups) && restrictAdminGroups.includes(groupCode)) {
      
      
        const getGroupCapabitilty = params.get_capability_data;
        console.log(getGroupCapabitilty, "getGroupCapabitilty");
        const capability = [];
        if(getGroupCapabitilty && getGroupCapabitilty.length) {
          getGroupCapabitilty.forEach((ele) => {
            capability.push(ele.capabilities);
          });
        }
        params.get_admin_data[0].capabilities = capability;
      }
    }
    return  {}
  }
}