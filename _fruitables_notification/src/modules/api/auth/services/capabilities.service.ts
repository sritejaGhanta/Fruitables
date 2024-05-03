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


import { AdminEntity } from 'src/entities/admin.entity';
import { GroupMasterEntity } from 'src/entities/group-master.entity';
import { CapabilityMasterEntity } from 'src/entities/capability-master.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class CapabilitiesService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CapabilitiesService.name,
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
    @InjectRepository(AdminEntity)
  protected adminEntityRepo: Repository<AdminEntity>;
    @InjectRepository(CapabilityMasterEntity)
  protected capabilityMasterEntityRepo: Repository<CapabilityMasterEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_admin_group_data',
    ];
    this.multipleKeys = [
      'fetch_capability_data',
      'prepare_capability_list',
    ];
  }

  /**
   * startCapabilities method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCapabilities(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getAdminGroupData(inputParams);
      inputParams = await this.fetchCapabilityData(inputParams);
      inputParams = await this.prepareCapabilityList(inputParams);
        outputResponse = this.finishSuccess(inputParams);
    } catch (err) {
      this.log.error('API Error >> capabilities >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getAdminGroupData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getAdminGroupData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.adminEntityRepo.createQueryBuilder('ma');

      queryObject.leftJoin(GroupMasterEntity, 'mgm', 'ma.groupId = mgm.id');
      queryObject.select('mgm.groupCode', 'mgm_group_code');
      queryObject.addSelect('mgm.groupCapabilities', 'mgm_group_capabilities');
      queryObject.andWhere('ma.id = :id', { id: this.requestObj.user.id });

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
    inputParams.get_admin_group_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * fetchCapabilityData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async fetchCapabilityData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.capabilityMasterEntityRepo.createQueryBuilder('mcm');

      queryObject.select('mcm.capabilityCode', 'capability');
      queryObject.andWhere('mcm.status IN (:...status)', { status :['Active'] });

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
    inputParams.fetch_capability_data = this.blockResult.data;

    return inputParams;
  }

  /**
   * prepareCapabilityList method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async prepareCapabilityList(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.getCapabilityList(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.prepare_capability_list = formatData;

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
      message: custom.lang('Admin capabilities fetched successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'list',
    ];

    const outputKeys = [
      'prepare_capability_list',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'capabilities';

    funcData.output_keys = outputKeys;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }
}
