import { Injectable } from '@nestjs/common';

import appConfig from 'src/config/appConfig';
import * as _ from 'lodash';

import { CapabilitiesService } from '../capabilities.service';

@Injectable()
export class CapabilitiesExtendedService extends CapabilitiesService {

  getCapabilityList = async (inputParams, reqObject) => {
    let capabilityList = [];
    try {
      const restrictAdminGroups = appConfig().restrict_admin_groups;
      if (_.isArray(restrictAdminGroups) && restrictAdminGroups.includes(inputParams.group_code)) {
        const groupCapabilities = inputParams.fetch_capability_data;
      
        if(groupCapabilities && groupCapabilities.length) {
          groupCapabilities.forEach( (row) => {
            capabilityList.push(row.capability);
          });
        }
      } else {
        capabilityList = JSON.parse(inputParams.mgm_group_capabilities);
      }
    } catch (err){
      this.log.error(err);
    }
  
    if (!_.isArray(capabilityList)) {
      capabilityList = [];
    }
    const result = {
      list: capabilityList,
    };
    return result;
  }
}