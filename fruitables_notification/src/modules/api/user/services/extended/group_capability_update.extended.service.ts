import { Injectable } from '@nestjs/common';

import * as _ from 'lodash';

import { GroupCapabilityUpdateService } from '../group_capability_update.service';

@Injectable()
export class GroupCapabilityUpdateExtendedService extends GroupCapabilityUpdateService {

  getCapabilityList = (inputParams) => {
    const capabilities = inputParams.capabilities;
    let capabilityList = '[]';
    if (_.isArray(capabilities)) {
      capabilityList = JSON.stringify(capabilities);
    } else if (capabilities) {
      capabilityList = capabilities;
    }
  
    return {
      capability_list: capabilityList
    }
  };
}