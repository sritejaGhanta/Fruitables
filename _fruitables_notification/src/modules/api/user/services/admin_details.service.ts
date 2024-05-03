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
export class AdminDetailsService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    AdminDetailsService.name,
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
      'get_admin_details_by_id',
    ];
  }

  /**
   * startAdminDetails method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startAdminDetails(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getAdminDetailsById(inputParams);
      if (!_.isEmpty(inputParams.get_admin_details_by_id)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> admin_details >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getAdminDetailsById method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getAdminDetailsById(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'mod_admin',
        table_alias: 'ma',
        primary_key: 'id',
        request_obj: this.requestObj,
      };
      const queryObject = this.adminEntityRepo.createQueryBuilder('ma');

      queryObject.leftJoin(GroupMasterEntity, 'mgm', 'ma.groupId = mgm.id');
      queryObject.select('ma.id', 'admin_id');
      queryObject.addSelect('ma.name', 'name');
      queryObject.addSelect('ma.email', 'email');
      queryObject.addSelect('ma.username', 'username');
      queryObject.addSelect('ma.dialCode', 'dial_code');
      queryObject.addSelect('ma.phoneNumber', 'phone_number');
      queryObject.addSelect('ma.groupId', 'group_id');
      queryObject.addSelect('ma.isEmailVerified', 'is_email_verified');
      queryObject.addSelect('ma.status', 'status');
      queryObject.addSelect('mgm.groupName', 'group_name');
      queryObject.addSelect('mgm.groupCode', 'group_code');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('ma.id = :id', { id: inputParams.id });
      }
      //@ts-ignore;              
      this.getWhereClause(queryObject, inputParams, extraConfig);

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
    inputParams.get_admin_details_by_id = this.blockResult.data;
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
      message: custom.lang('Admin details found.'),
      fields: [],
    };
    settingFields.fields = [
      'admin_id',
      'name',
      'email',
      'username',
      'dial_code',
      'phone_number',
      'group_id',
      'is_email_verified',
      'status',
      'group_name',
      'group_code',
    ];

    const outputKeys = [
      'get_admin_details_by_id',
    ];
    const outputObjects = [
      'get_admin_details_by_id',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'admin_details';

    funcData.output_keys = outputKeys;
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
      success: 1,
      message: custom.lang('Admin details not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_details',
      },
    );
  }
}
