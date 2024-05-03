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
import { BaseService } from 'src/services/base.service';

@Injectable()
export class AdminIdentityService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    AdminIdentityService.name,
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
    @InjectRepository(AdminEntity)
  protected adminEntityRepo: Repository<AdminEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_admin_data',
    ];
  }

  /**
   * startAdminIdentity method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startAdminIdentity(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getAdminData(inputParams);
      if (!_.isEmpty(inputParams.get_admin_data)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> admin_identity >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getAdminData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getAdminData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.adminEntityRepo.createQueryBuilder('ma');

      queryObject.leftJoin(GroupMasterEntity, 'mgm', 'ma.groupId = mgm.id');
      queryObject.select('ma.id', 'userId');
      queryObject.addSelect('ma.name', 'name');
      queryObject.addSelect('ma.email', 'email');
      queryObject.addSelect('ma.dialCode', 'dialCode');
      queryObject.addSelect('ma.phoneNumber', 'phoneNumber');
      queryObject.addSelect('ma.isEmailVerified', 'emailVerified');
      queryObject.addSelect('ma.status', 'status');
      queryObject.addSelect('mgm.id', 'groupId');
      queryObject.addSelect('mgm.groupName', 'groupName');
      queryObject.addSelect('mgm.groupCode', 'groupCode');
      queryObject.addSelect('mgm.groupCapabilities', 'capabilities1');
      queryObject.andWhere('ma.id = :id', { id: this.requestObj.user.id });
      queryObject.andWhere('ma.groupId = :groupId', { groupId: this.requestObj.user.group_id });

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let val;
      if (_.isObject(data) && !_.isEmpty(data)) {
        const row: any = data;
          val = row.capabilities1;
          //@ts-ignore;
          val = this.parseCapabilities(val, row, {
            field: 'capabilities1',
            params: inputParams,
            request: this.requestObj,
          })
          data['capabilities1'] = val;
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
    inputParams.get_admin_data = this.blockResult.data;
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
      message: custom.lang('Admin details found'),
      fields: [],
    };
    settingFields.fields = [
      'userId',
      'name',
      'email',
      'dialCode',
      'phoneNumber',
      'emailVerified',
      'status',
      'groupId',
      'groupName',
      'groupCode',
      'capabilities1',
    ];

    const outputKeys = [
      'get_admin_data',
    ];
    const outputAliases = {
      capabilities1: 'capabilities',
    };
    const outputObjects = [
      'get_admin_data',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'admin_identity';

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
      message: custom.lang('Admin details not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_identity',
      },
    );
  }
}
