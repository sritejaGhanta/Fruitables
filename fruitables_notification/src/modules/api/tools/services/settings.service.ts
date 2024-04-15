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
export class SettingsService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    SettingsService.name,
  ).getInstance();
  protected inputParams: object = {};
  protected blockResult: BlockResultDto;
  protected settingsParams: SettingsParamsDto;
  protected singleKeys: any[] = [];
  protected multipleKeys: any[] = [];
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
      'prepare_file_extensions',
    ];
    this.multipleKeys = [
      'get_settings_files_config',
      'get_settings_files',
      'get_settings_data',
    ];
  }

  /**
   * startSettings method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startSettings(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      if (inputParams.type === 'files') {
      inputParams = await this.getSettingsFilesConfig(inputParams);
      inputParams = await this.prepareFileExtensions(inputParams);
      inputParams = await this.getSettingsFiles(inputParams);
      if (!_.isEmpty(inputParams.get_settings_files)) {
        outputResponse = this.filesFinishSuccess(inputParams);
      } else {
        outputResponse = this.filesFinishFailure(inputParams);
      }
      } else {
      inputParams = await this.getSettingsData(inputParams);
      if (!_.isEmpty(inputParams.get_settings_data)) {
        outputResponse = this.settingFinishSuccess(inputParams);
      } else {
        outputResponse = this.settingFinishFailure(inputParams);
      }
      }
    } catch (err) {
      this.log.error('API Error >> settings >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getSettingsFilesConfig method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getSettingsFilesConfig(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.settingEntityRepo.createQueryBuilder('ms');

      queryObject.select('name', 'ms_name_2');
      queryObject.addSelect('sourceValue', 'ms_source_value_2');
      queryObject.andWhere('status IN (:...status)', { status :['Active'] });
      queryObject.andWhere('displayType IN (:...displayType)', { displayType :['file'] });

      const data = await queryObject.getRawMany();
      if (!_.isArray(data) || _.isEmpty(data)) {
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
    inputParams.get_settings_files_config = this.blockResult.data;

    return inputParams;
  }

  /**
   * prepareFileExtensions method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async prepareFileExtensions(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.getFileExtensions(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.prepare_file_extensions = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * getSettingsFiles method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getSettingsFiles(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.settingEntityRepo.createQueryBuilder('ms');

      queryObject.select('ms.name', 'ms_name_1');
      queryObject.addSelect('ms.desc', 'ms_desc_1');
      queryObject.addSelect('ms.value', 'ms_value_1');
      queryObject.addSelect('ms.configType', 'ms_config_type_1');
      queryObject.addSelect('ms.displayType', 'ms_display_type_1');
      queryObject.addSelect('ms.source', 'ms_source_1');
      queryObject.addSelect('ms.sourceValue', 'ms_source_value_1');
      queryObject.addSelect('ms.selectType', 'ms_select_type_1');
      queryObject.addSelect('ms.validateCode', 'ms_validate_code_1');
      queryObject.addSelect('ms.validateMessage', 'ms_validate_message_1');
      queryObject.addSelect('ms.placeholder', 'ms_placeholder_1');
      queryObject.addSelect('ms.helpText', 'ms_help_text_1');
      queryObject.addSelect('ms.vValue', 'custom_value_1');
      queryObject.andWhere('ms.status IN (:...status)', { status :['Active'] });
      queryObject.andWhere('ms.displayType IN (:...displayType)', { displayType :['file'] });
      queryObject.addOrderBy('ms.configType', 'ASC');
      queryObject.addOrderBy('ms.orderBy', 'ASC');

      const data = await queryObject.getRawMany();
      if (!_.isArray(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let fileConfig: FileFetchDto;
      let val;
      if (_.isArray(data) && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          val = row.ms_value_1;
          fileConfig = {};
          fileConfig.source = 'local';
          fileConfig.path = 'settings_files';
          fileConfig.image_name = val;
          fileConfig.extensions = inputParams.file_extensions;
          fileConfig.color = 'FFFFFF';
          val = await this.general.getFile(fileConfig, inputParams);
          data[i].ms_value_1 = val;

          val = row.ms_display_type_1;
          //@ts-ignore;
          val = this.getSelectType(val, row, {
            index: i,
            field: 'ms_display_type_1',
            params: inputParams,
            request: this.requestObj,
          });
          data[i].ms_display_type_1 = val;

          val = row.ms_source_value_1;
          //@ts-ignore;
          val = this.getSourceValue(val, row, {
            index: i,
            field: 'ms_source_value_1',
            params: inputParams,
            request: this.requestObj,
          });
          data[i].ms_source_value_1 = val;

          val = row.ms_validate_code_1;
          //@ts-ignore;
          val = this.getValidationCode(val, row, {
            index: i,
            field: 'ms_validate_code_1',
            params: inputParams,
            request: this.requestObj,
          });
          data[i].ms_validate_code_1 = val;

          val = row.ms_validate_message_1;
          //@ts-ignore;
          val = this.getValidationMessage(val, row, {
            index: i,
            field: 'ms_validate_message_1',
            params: inputParams,
            request: this.requestObj,
          });
          data[i].ms_validate_message_1 = val;
        }
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
    inputParams.get_settings_files = this.blockResult.data;

    return inputParams;
  }

  /**
   * filesFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  filesFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Settings files found.'),
      fields: [],
    };
    settingFields.fields = [
      'ms_desc_1',
      'ms_value_1',
      'ms_display_type_1',
      'ms_source_1',
      'ms_validate_code_1',
      'ms_validate_message_1',
      'ms_placeholder_1',
      'ms_help_text_1',
      'custom_value_1',
    ];

    const outputKeys = [
      'get_settings_files',
      'get_settings_data',
    ];
    const outputAliases = {
      ms_desc_1: 'desc',
      ms_value_1: 'value',
      ms_display_type_1: 'display_type',
      ms_source_1: 'source',
      ms_validate_code_1: 'validate_code',
      ms_validate_message_1: 'validate_message',
      ms_placeholder_1: 'placeholder',
      ms_help_text_1: 'help_text',
      custom_value_1: 'file_name',
    };

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'settings';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * filesFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  filesFinishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Settings files not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'settings',
      },
    );
  }

  /**
   * getSettingsData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getSettingsData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.settingEntityRepo.createQueryBuilder('ms');

      queryObject.select('name', 'ms_name');
      queryObject.addSelect('desc', 'ms_desc');
      queryObject.addSelect('value', 'ms_value');
      queryObject.addSelect('groupType', 'ms_group_type');
      queryObject.addSelect('configType', 'ms_config_type');
      queryObject.addSelect('displayType', 'ms_display_type');
      queryObject.addSelect('source', 'ms_source');
      queryObject.addSelect('sourceValue', 'ms_source_value');
      queryObject.addSelect('selectType', 'ms_select_type');
      queryObject.addSelect('validateCode', 'ms_validate_code');
      queryObject.addSelect('validateMessage', 'ms_validate_message');
      queryObject.addSelect('placeholder', 'ms_placeholder');
      queryObject.addSelect('helpText', 'ms_help_text');
      queryObject.addSelect('ms.DisplayType', 'custom_display_type');
      if (!custom.isEmpty(inputParams.type)) {
        queryObject.andWhere('ms.configType IN (:...configType)', { configType:inputParams.type });
      }
      queryObject.andWhere('ms.displayType IN (:...displayType)', { displayType :['text', 'selectbox', 'textarea', 'checkbox', 'radio', 'hidden', 'editor', 'file', 'readonly', 'password'] });
      queryObject.andWhere('ms.status IN (:...status)', { status :['Active'] });
      queryObject.addOrderBy('ms.orderBy', 'ASC');

      const data = await queryObject.getRawMany();
      if (!_.isArray(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let val;
      if (_.isArray(data) && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          val = row.ms_display_type;
          //@ts-ignore;
          val = this.getSelectType(val, row, {
            index: i,
            field: 'ms_display_type',
            params: inputParams,
            request: this.requestObj,
          });
          data[i].ms_display_type = val;

          val = row.ms_source_value;
          //@ts-ignore;
          val = this.getSourceValue(val, row, {
            index: i,
            field: 'ms_source_value',
            params: inputParams,
            request: this.requestObj,
          });
          data[i].ms_source_value = val;

          val = row.ms_validate_code;
          //@ts-ignore;
          val = this.getValidationCode(val, row, {
            index: i,
            field: 'ms_validate_code',
            params: inputParams,
            request: this.requestObj,
          });
          data[i].ms_validate_code = val;

          val = row.ms_validate_message;
          //@ts-ignore;
          val = this.getValidationMessage(val, row, {
            index: i,
            field: 'ms_validate_message',
            params: inputParams,
            request: this.requestObj,
          });
          data[i].ms_validate_message = val;
        }
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
    inputParams.get_settings_data = this.blockResult.data;

    return inputParams;
  }

  /**
   * settingFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  settingFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Settings list found.'),
      fields: [],
    };
    settingFields.fields = [
      'ms_name_1',
      'ms_source_value_1',
      'ms_desc',
      'ms_value',
      'ms_group_type',
      'ms_display_type',
      'ms_source',
      'ms_source_value',
      'ms_validate_code',
      'ms_validate_message',
      'ms_placeholder',
      'ms_help_text',
    ];

    const outputKeys = [
      'get_settings_data',
    ];
    const outputAliases = {
      ms_name_1: 'name',
      ms_source_value_1: 'source_value',
      ms_desc: 'desc',
      ms_value: 'value',
      ms_group_type: 'group_type',
      ms_display_type: 'display_type',
      ms_source: 'source',
      ms_source_value: 'source_value',
      ms_validate_code: 'validate_code',
      ms_validate_message: 'validate_message',
      ms_placeholder: 'placeholder',
      ms_help_text: 'help_text',
    };

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'settings';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * settingFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  settingFinishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Settings list not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'settings',
      },
    );
  }
}
