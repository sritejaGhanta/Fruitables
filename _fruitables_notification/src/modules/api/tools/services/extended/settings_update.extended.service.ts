import { Injectable } from '@nestjs/common';

import * as custom from 'src/utilities/custom-helper';
import * as _ from 'lodash';

import { SettingsUpdateService } from '../settings_update.service';

@Injectable()
export class SettingsUpdateExtendedService extends SettingsUpdateService {


  getSettingsUpdateData = (inputParams,requestObj) => {
    const settingData = [];
    const settingObj = inputParams.setting;
  
    if (_.isObject(settingObj) && !_.isEmpty(settingObj)) {
      Object.keys(settingObj).forEach(key => {
        if (!_.isEmpty(settingObj[key])) {
          settingData.push({
            setting_key: key,
            setting_val: settingObj[key]
          });
        }
      });
    }
  
    return settingData;
  }
}