import { Injectable } from '@nestjs/common';

import * as _ from 'lodash';
import * as custom from 'src/utilities/custom-helper';

interface sourceInterfaceData {
      FILE_TYPE: string;
      FILE_SIZE: string;
      FILE_EXT: string,
      FILE_WIDTH: string,
      FILE_HEIGHT: string,
}

import { SettingsUploadFilesService } from '../settings_upload_files.service';

@Injectable()
export class SettingsUploadFilesExtendedService extends SettingsUploadFilesService {

  getFileOptions = (inputParams) => {
    const sourceValue:sourceInterfaceData = inputParams.ms_source_value;
  
    let fileExtensions;
    let fileMaxSize;
    if (_.isObject(sourceValue)) {
      if ( sourceValue.FILE_EXT) {
        fileExtensions = sourceValue.FILE_EXT;
      }
      if (sourceValue.FILE_SIZE) {
        fileMaxSize = sourceValue.FILE_SIZE;
      }
    }
  
    return {
      file_extensions: fileExtensions, 
      file_max_size: fileMaxSize,
    };
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

  getFileType = (value, inputParams) => {
    const sourceValue:sourceInterfaceData = inputParams.ms_source_value_1;
    if (_.isObject(sourceValue) && sourceValue.FILE_TYPE && sourceValue.FILE_TYPE === 'image') {
      return 'image';
    } else {
      return 'file';
    }
  }

  getImageHeight = (value, inputParams) => {
    const sourceValue:sourceInterfaceData = inputParams.ms_source_value_1;
    if (_.isObject(sourceValue) && sourceValue.FILE_TYPE && sourceValue.FILE_TYPE === 'image') {
      return sourceValue.FILE_HEIGHT || '50px';
    } else {
      return '';
    }
  }

  getImageWidth = (value, inputParams) => {
    const sourceValue:sourceInterfaceData = inputParams.ms_source_value_1;
    if (_.isObject(sourceValue) && sourceValue.FILE_TYPE && sourceValue.FILE_TYPE === 'image') {
      return sourceValue.FILE_WIDTH || '50px';
    } else {
      return '';
    }
  }
}