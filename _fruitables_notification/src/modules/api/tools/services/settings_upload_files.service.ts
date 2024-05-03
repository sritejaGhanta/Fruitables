interface AuthObject {
  user: any;
}
import { Inject, Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import * as _ from 'lodash';
import * as custom from 'src/utilities/custom-helper';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { BlockResultDto, SettingsParamsDto } from 'src/common/dto/common.dto';import { FileFetchDto } from 'src/common/dto/amazon.dto';

import { ResponseLibrary } from 'src/utilities/response-library';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';


import { SettingEntity } from 'src/entities/setting.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class SettingsUploadFilesService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    SettingsUploadFilesService.name,
  ).getInstance();
  protected inputParams: object = {};
  protected blockResult: BlockResultDto;
  protected settingsParams: SettingsParamsDto;
  protected singleKeys: any[] = [];
  protected requestObj: AuthObject = {
    user: {},
  };
  
  @InjectDataSource()
  protected dataSource: DataSource;
  @Inject()
  protected readonly general: CitGeneralLibrary;
  @Inject()
  protected readonly response: ResponseLibrary;
    @InjectRepository(SettingEntity)
  protected settingEntityRepo: Repository<SettingEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_settings_file_data',
      'prepare_file_options',
      'update_settings_file_data',
      'get_settings_updated_data',
    ];
  }

  /**
   * startSettingsUploadFiles method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startSettingsUploadFiles(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getSettingsFileData(inputParams);
      if (!_.isEmpty(inputParams.get_settings_file_data)) {
      inputParams = await this.prepareFileOptions(inputParams);
      inputParams = await this.updateSettingsFileData(inputParams);
      inputParams = await this.getSettingsUpdatedData(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> settings_upload_files >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getSettingsFileData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getSettingsFileData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.settingEntityRepo.createQueryBuilder('ms');

      queryObject.select('ms.name', 'ms_name');
      queryObject.addSelect('ms.sourceValue', 'ms_source_value');
      queryObject.addSelect('ms.status', 'ms_status');
      if (!custom.isEmpty(inputParams.setting_key)) {
        queryObject.andWhere('ms.name = :name', { name: inputParams.setting_key });
      }

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      const success = 1;
      const message = 'Records found.';

      const queryResult = {
        success,
        message,
        data,
      };
      this.blockResult = queryResult;
    } catch (err) {
      this.blockResult.success = 0;
      this.blockResult.message = err;
      this.blockResult.data = [];
    }
    inputParams.get_settings_file_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * prepareFileOptions method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async prepareFileOptions(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.getFileOptions(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.prepare_file_options = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * updateSettingsFileData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateSettingsFileData(inputParams: any) {
    this.blockResult = {};
    try {                
      

      let uploadResult: any = {};
      let uploadConfig: any = {};
      let uploadInfo: any = {};
      let fileProp: any = {};
      let fileInfo: any = {};

      if ('setting_file' in inputParams && !custom.isEmpty(inputParams.setting_file)) {
        const tmpUploadPath = await this.general.getConfigItem('upload_temp_path');
        if (this.general.isFile(`${tmpUploadPath}${inputParams.setting_file}`)) {
          fileInfo = {};
          fileInfo.name = inputParams.setting_file;
          fileInfo.file_name = inputParams.setting_file;
          fileInfo.file_path = `${tmpUploadPath}${inputParams.setting_file}`;
          fileInfo.file_type = this.general.getFileMime(fileInfo.file_path);
          fileInfo.file_size = this.general.getFileSize(fileInfo.file_path);
          fileInfo.max_size = 512000;
          fileInfo.extensions = inputParams.file_extensions;
          uploadInfo.setting_file = fileInfo;
        }
      }
      const queryColumns: any = {};
      if ('setting_file' in uploadInfo && 'name' in uploadInfo.setting_file) {
        queryColumns.value = uploadInfo.setting_file.name;
      } else {
        queryColumns.value = inputParams.setting_file;
      }
      if ('ms_status' in inputParams) {
        queryColumns.status = inputParams.ms_status;
      }

      const queryObject = this.settingEntityRepo
        .createQueryBuilder()
        .update(SettingEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.setting_key)) {
        queryObject.andWhere('name = :name', { name: inputParams.setting_key });
      }
      const res = await queryObject.execute();
      const data = {
        affected_rows: res.affected,
      };

      if ('setting_file' in uploadInfo && 'name' in uploadInfo.setting_file) {
        uploadConfig = {};
        uploadConfig.source = 'local';
        uploadConfig.upload_path = 'settings_files/';
        uploadConfig.extensions = uploadInfo.setting_file.extensions;
        uploadConfig.file_type = uploadInfo.setting_file.file_type;
        uploadConfig.file_size = uploadInfo.setting_file.file_size;
        uploadConfig.max_size = uploadInfo.setting_file.max_size;
        uploadConfig.src_file = uploadInfo.setting_file.file_path;
        uploadConfig.dst_file = uploadInfo.setting_file.name;
        uploadResult = this.general.uploadFile(uploadConfig, inputParams);
        // if (!uploadResult.success) {
        // File upload failed
        // }
      }
      const success = 1;
      const message = 'Record(s) updated.';

      const queryResult = {
        success,
        message,
        data,
      };
      this.blockResult = queryResult;
    } catch (err) {
      this.blockResult.success = 0;
      this.blockResult.message = err;
      this.blockResult.data = [];
    }
    inputParams.update_settings_file_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * getSettingsUpdatedData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getSettingsUpdatedData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.settingEntityRepo.createQueryBuilder('ms');

      queryObject.select('ms.name', 'ms_name_1');
      queryObject.addSelect('ms.value', 'ms_value');
      queryObject.addSelect('ms.value', 'custom_value');
      queryObject.addSelect('ms.sourceValue', 'ms_source_value_1');
      queryObject.addSelect("''", 'custom_file_type');
      queryObject.addSelect("''", 'custom_image_height');
      queryObject.addSelect("''", 'custom_image_width');
      if (!custom.isEmpty(inputParams.setting_key)) {
        queryObject.andWhere('ms.name = :name', { name: inputParams.setting_key });
      }

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let fileConfig: FileFetchDto;
      let val;
      if (_.isObject(data) && !_.isEmpty(data)) {
        const row: any = data;
          val = row.ms_value;
          fileConfig = {};
          fileConfig.source = 'local';
          fileConfig.path = 'settings_files';
          fileConfig.image_name = val;
          fileConfig.extensions = inputParams.file_extensions;
          fileConfig.color = 'FFFFF';
          fileConfig.no_img_req = false;
          val = await this.general.getFile(fileConfig, inputParams);
          data['ms_value'] = val;

          val = row.ms_source_value_1;
          //@ts-ignore;
          val = this.parseValidationJson(val, row, {
            field: 'ms_source_value_1',
            params: inputParams,
            request: this.requestObj,
          })
          data['ms_source_value_1'] = val;

          val = row.custom_file_type;
          //@ts-ignore;
          val = this.getFileType(val, row, {
            field: 'custom_file_type',
            params: inputParams,
            request: this.requestObj,
          })
          data['custom_file_type'] = val;

          val = row.custom_image_height;
          //@ts-ignore;
          val = this.getImageHeight(val, row, {
            field: 'custom_image_height',
            params: inputParams,
            request: this.requestObj,
          })
          data['custom_image_height'] = val;

          val = row.custom_image_width;
          //@ts-ignore;
          val = this.getImageWidth(val, row, {
            field: 'custom_image_width',
            params: inputParams,
            request: this.requestObj,
          })
          data['custom_image_width'] = val;
      }

      const success = 1;
      const message = 'Records found.';

      const queryResult = {
        success,
        message,
        data,
      };
      this.blockResult = queryResult;
    } catch (err) {
      this.blockResult.success = 0;
      this.blockResult.message = err;
      this.blockResult.data = [];
    }
    inputParams.get_settings_updated_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * finishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('File uploaded successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'ms_name_1',
      'ms_value',
      'custom_value',
      'custom_file_type',
      'custom_image_height',
      'custom_image_width',
    ];

    const outputKeys = [
      'get_settings_updated_data',
    ];
    const outputAliases = {
      ms_name_1: 'setting_key',
      ms_value: 'url',
      custom_value: 'name',
      custom_file_type: 'type',
      custom_image_height: 'height',
      custom_image_width: 'width',
    };
    const outputObjects = [
      'get_settings_updated_data',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'settings_upload_files';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * finishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Something went wrong. Please try again.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'settings_upload_files',
      },
    );
  }
}
