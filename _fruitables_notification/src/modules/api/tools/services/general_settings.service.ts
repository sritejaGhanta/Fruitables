interface AuthObject {
  user: any;
}
import { Inject, Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import * as _ from 'lodash';
import * as custom from 'src/utilities/custom-helper';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { BlockResultDto, SettingsParamsDto } from 'src/common/dto/common.dto';

import { ResponseLibrary } from 'src/utilities/response-library';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';



import { BaseService } from 'src/services/base.service';

@Injectable()
export class GeneralSettingsService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    GeneralSettingsService.name,
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
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'custom_general_settings',
    ];
  }

  /**
   * startGeneralSettings method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startGeneralSettings(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.customGeneralSettings(inputParams);
        outputResponse = this.finishSuccess(inputParams);
    } catch (err) {
      this.log.error('API Error >> general_settings >>', err);
    }
    return outputResponse;
  }
  

  /**
   * customGeneralSettings method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async customGeneralSettings(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.getGeneralSettings(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.custom_general_settings = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
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
      message: custom.lang('General settings found successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'company_address',
      'company_phone_number',
      'company_facebook_url',
      'company_instagram_url',
      'company_twitter_url',
      'company_youtube_url',
      'apple_store_url',
      'play_store_url',
      'copyrighted_text',
      'panel_title',
      'auto_refresh_time',
    ];

    const outputKeys = [
      'custom_general_settings',
    ];
    const outputObjects = [
      'custom_general_settings',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'general_settings';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }
}
