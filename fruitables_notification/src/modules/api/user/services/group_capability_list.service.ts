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


import { CapabilityCategoryEntity } from 'src/entities/capability-category.entity';
import { CapabilityMasterEntity } from 'src/entities/capability-master.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class GroupCapabilityListService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    GroupCapabilityListService.name,
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
    @InjectRepository(CapabilityCategoryEntity)
  protected capabilityCategoryEntityRepo: Repository<CapabilityCategoryEntity>;
    @InjectRepository(CapabilityMasterEntity)
  protected capabilityMasterEntityRepo: Repository<CapabilityMasterEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = [
      'get_capability_category_list',
    ];
  }

  /**
   * startGroupCapabilityList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startGroupCapabilityList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCapabilityCategoryList(inputParams);
      if (!_.isEmpty(inputParams.get_capability_category_list)) {
        inputParams = await this.startLoop(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> group_capability_list >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCapabilityCategoryList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCapabilityCategoryList(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.capabilityCategoryEntityRepo.createQueryBuilder('mcc');

      queryObject.select('id', 'mcc_id');
      queryObject.addSelect('categoryName', 'mcc_category_name');
      queryObject.addSelect('categoryCode', 'mcc_category_code');
      queryObject.andWhere('status IN (:...status)', { status :['Active'] });

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
    inputParams.get_capability_category_list = this.blockResult.data;

    return inputParams;
  }

  /**
   * startLoop method is used to process loop flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async startLoop(inputParams: any) {
    inputParams.get_capability_category_list = await this.iterateStartLoop(inputParams.get_capability_category_list, inputParams);
    return inputParams;
  }


  /**
   * getCapabilityList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCapabilityList(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.capabilityMasterEntityRepo.createQueryBuilder('mcm');

      queryObject.select('id', 'mcm_id');
      queryObject.addSelect('capabilityName', 'mcm_capability_name');
      queryObject.addSelect('capabilityCode', 'mcm_capability_code');
      queryObject.addSelect('capabilityType', 'mcm_capability_type');
      queryObject.addSelect('entityName', 'mcm_entity_name');
      queryObject.addSelect('capabilityMode', 'mcm_capability_mode');
      queryObject.addSelect('parentEntity', 'mcm_parent_entity');
      if (!custom.isEmpty(inputParams.mcc_id)) {
        queryObject.andWhere('categoryId = :categoryId', { categoryId: inputParams.mcc_id });
      }
      queryObject.andWhere('status IN (:...status)', { status :['Active'] });

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
    inputParams.get_capability_list = this.blockResult.data;

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
      message: custom.lang('Capabilities list found.'),
      fields: [],
    };
    settingFields.fields = [
      'mcc_id',
      'mcc_category_name',
      'mcc_category_code',
      'get_capability_list',
      'mcm_id',
      'mcm_capability_name',
      'mcm_capability_code',
      'mcm_capability_type',
      'mcm_entity_name',
      'mcm_capability_mode',
      'mcm_parent_entity',
    ];

    const outputKeys = [
      'get_capability_category_list',
    ];
    const innerKeys = [
      'get_capability_list',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'group_capability_list';

    funcData.output_keys = outputKeys;
    funcData.inner_keys = innerKeys;
    funcData.multiple_keys = this.multipleKeys;
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
      success: 1,
      message: custom.lang('Capabilities list not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'group_capability_list',
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

      delete eachLoopObj.get_capability_category_list;
      if (_.isObject(loopDataObject[i])) {
        eachLoopObj = { ...inputDataLocal, ...loopDataObject[i] };
      } else {
        eachLoopObj.get_capability_category_list = loopDataObject[i];
        loopDataObject[i] = [];
        loopDataObject[i].get_capability_category_list = eachLoopObj.get_capability_category_list;
      }

      eachLoopObj.i = i;
      inputParams = { ...eachLoopObj };

      inputParams = await this.getCapabilityList(inputParams);

      itrLoopData[i] = this.response.filterLoopParams(inputParams, loopDataObject[i], eachLoopObj);
    }
    return itrLoopData;
  }
}
