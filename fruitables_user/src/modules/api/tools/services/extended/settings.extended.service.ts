import { Injectable } from '@nestjs/common';

import * as _ from 'lodash';
import * as custom from 'src/utilities/custom-helper';

interface sourceInterfaceData {
      FILE_TYPE: string;
      FILE_SIZE: string;
    }

import { SettingsService } from '../settings.service';

@Injectable()
export class SettingsExtendedService extends SettingsService {

  getFileExtensions = (inputParams) => {
    let extensionsList = [];
    const resultData = inputParams.get_settings_files_config;

    if (_.isArray(resultData) && resultData.length > 0) {
      resultData.forEach((dataObj) => {
        let sourceValue:any = dataObj.ms_source_value_2;
        if (!_.isObject(dataObj.ms_source_value_2)) {
          sourceValue = this.parseValidationJson(dataObj.ms_source_value_2);
        }
        if (sourceValue.FILE_EXT) {
          extensionsList.push(sourceValue.FILE_EXT);
        }
      });
    }
  
    extensionsList = _.uniq(extensionsList);
    let fileExtensions = extensionsList.join(',');
  
    return {
      file_extensions: fileExtensions,
    }
  }

  getSelectType = (value, data) => {
    let displayType;
    let selectType;
    if ('ms_display_type' in data) {
      displayType = data.ms_display_type;
      selectType = data.ms_select_type;
    } else {
      displayType = data.ms_display_type_1;
      selectType = data.ms_select_type_1;
    }
  
    if (displayType === 'selectbox') {
      if (selectType === 'Multiple') {
        value = "multiselect"; 
      } else {
        value = "select"; 
      }
    } else if (displayType === 'checkbox') {
      value = "checkbox";
    }

    return value;
  }

  getSourceValue = (value, data) => {
  
    let sourceList;
    let displayType;
    let sourceType;
    let name;
    if ('ms_display_type' in data) {
      displayType = data.custom_display_type;
      sourceType = data.ms_source;
      name = data.ms_name;
    } else {
      displayType = data.ms_display_type_1;
      sourceType = data.ms_source_1;
      name = data.ms_name_1;
    }
    if (displayType === 'file') {
      sourceList = this.parseValidationJson(value);
    } else if (displayType === 'checkbox') {
      sourceList = [
        {
          name: 'Yes',
          value: 'Y',
        }, 
        {
          name: 'No',
          value: 'N',
        }
      ];
    } else if (sourceType === 'List') {
      sourceList = [];
      let sourceName;
      let sourceValue;
      const sourcePairs = (value) ? value.split(',') : [];
      sourcePairs.forEach(pair => {
        [sourceName, sourceValue] = (pair) ? pair.split('::') : [];
        const formats = ['ADMIN_DATE_FORMAT', 'ADMIN_DATE_TIME_FORMAT', 'ADMIN_TIME_FORMAT'];
        if (formats.includes(name)) {
          sourceValue = this.general.getSysDateFormat1(sourceName, name);
        }
        sourceList.push({
          name: sourceName,
          value: sourceValue,
        });
      });
    } else if (sourceType === 'Query') {
      sourceList = [];
      // TODO:
    } else {
      sourceList = value;
    }
    return sourceList;
  }

  getValidationCode = (value, data) => {

    value = this.parseValidationJson(value);
    value = _.isObject(value) ? value : {};
    let displayType;
    let sourceValue:sourceInterfaceData;
    if ('ms_display_type' in data) {
      displayType = data.ms_display_type;
      sourceValue = data.ms_source_value;
    } else {
      displayType = data.ms_display_type_1;
      sourceValue = data.ms_source_value_1;
    }
    if (displayType === 'file') {
      if (!_.isObject(sourceValue)) {
        sourceValue = this.parseValidationJson(sourceValue);
      }
      if (_.isObject(sourceValue)) {
        if (sourceValue.FILE_TYPE) {
          const fileTypes = sourceValue.FILE_TYPE.split(',');
          fileTypes.forEach(dKey => {
            value[dKey] = true;
          });
        }
        if (sourceValue.FILE_SIZE) {
          value.maxSizeAllowed = sourceValue.FILE_SIZE;
        }
      }
    }
    return value;
  }

  getValidationMessage = (value, data) => {
    value = this.parseValidationJson(value);
    value = _.isObject(value) ? value : {};
    let displayType;
    let sourceValue:sourceInterfaceData;
    if ('ms_display_type' in data) {
      displayType = data.ms_display_type;
      sourceValue = data.ms_source_value;
    } else {
      displayType = data.ms_display_type_1;
      sourceValue = data.ms_source_value_1;
    }
    if (displayType === 'file') {
      if (!_.isObject(sourceValue)) {
        sourceValue = this.parseValidationJson(sourceValue);
      }
      if (_.isObject(sourceValue)) {
        if (sourceValue.FILE_TYPE) {
          const fileTypes = sourceValue.FILE_TYPE.split(',');
          fileTypes.forEach(dKey => {
            value[dKey] = 'Please upload valid file';
          });
        }
        if (sourceValue.FILE_SIZE) {
          value.maxSizeAllowed = 'Uploaded file exceeds the maximum allowed size';
        }
      }
    }
    return value;
  }

  parseValidationJson = (value) => {
    try {
      if(!custom.isEmpty(value)) {
        value = JSON.parse(value);
      }
    } catch (err) {
      console.log(err);
    }
    return value;
  }
}