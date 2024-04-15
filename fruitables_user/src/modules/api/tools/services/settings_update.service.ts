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


import { SettingEntity } from 'src/entities/setting.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class SettingsUpdateService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    SettingsUpdateService.name,
  ).getInstance();
  protected inputParams: object = {};
  protected blockResult: BlockResultDto;
  protected settingsParams: SettingsParamsDto;
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
    this.multipleKeys = [
      'prepare_setting_data',
    ];
  }

  /**
   * startSettingsUpdate method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startSettingsUpdate(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      if ('setting' in inputParams && _.isObject(inputParams.setting)) {
        const dictParams = inputParams.setting;
        inputParams = { ...inputParams, ...dictParams };
      }

      inputParams = await this.prepareSettingData(inputParams);
        inputParams = await this.startLoop(inputParams);
        outputResponse = this.finishSuccess(inputParams);
    } catch (err) {
      this.log.error('API Error >> settings_update >>', err);
    }
    return outputResponse;
  }
  

  /**
   * prepareSettingData method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async prepareSettingData(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.getSettingsUpdateData(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.prepare_setting_data = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * startLoop method is used to process loop flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async startLoop(inputParams: any) {
    inputParams.prepare_setting_data = await this.iterateStartLoop(inputParams.prepare_setting_data, inputParams);
    return inputParams;
  }


  /**
   * updateSettingsData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateSettingsData(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      if ('setting_val' in inputParams) {
        queryColumns.value = inputParams.setting_val;
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
    inputParams.update_settings_data = this.blockResult.data;
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
      message: custom.lang('Settings updated successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'settings_update',
      },
    );
  }

  /**
   * iterateStartLoop method is used to iterate loop.
   * @param array itrLoopData itrLoopData array to iterate loop.
   * @param array inputData inputData array to address original input params.
   */
  async iterateStartLoop(itrLoopData, inputData) {
    itrLoopData = _.isArray(itrLoopData) ? [...itrLoopData] : [];
    const loopDataObject = [...itrLoopData];
    const inputDataLocal = { ...inputData };
    let dictObjects = {};
    let eachLoopObj:any = {};
    let inputParams = {};

    const ini = 0;
    const end = loopDataObject.length;
    for (let i = ini; i < end; i += 1) {
      eachLoopObj = inputDataLocal;

      delete eachLoopObj.prepare_setting_data;
      if (_.isObject(loopDataObject[i])) {
        eachLoopObj = { ...inputDataLocal, ...loopDataObject[i] };
      } else {
        eachLoopObj.prepare_setting_data = loopDataObject[i];
        loopDataObject[i] = [];
        loopDataObject[i].prepare_setting_data = eachLoopObj.prepare_setting_data;
      }

      eachLoopObj.i = i;
      inputParams = { ...eachLoopObj };

      inputParams = await this.updateSettingsData(inputParams);

      itrLoopData[i] = this.response.filterLoopParams(inputParams, loopDataObject[i], eachLoopObj);
    }
    return itrLoopData;
  }
}
