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
import { LogHistoryEntity } from 'src/entities/log-history.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class AdminLoginService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    AdminLoginService.name,
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
    @InjectRepository(LogHistoryEntity)
  protected logHistoryEntityRepo: Repository<LogHistoryEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_admin_login_details',
      'verify_admin_password',
      'insert_admin_login_history',
    ];
  }

  /**
   * startAdminLogin method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startAdminLogin(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getAdminLoginDetails(inputParams);
      if (!_.isEmpty(inputParams.get_admin_login_details)) {
      inputParams = await this.verifyAdminPassword(inputParams);
      if (inputParams.is_matched === 1) {
      if (inputParams.ma_status === 'Active') {
      if (inputParams.mgm_status === 'Active') {
      inputParams = await this.insertAdminLoginHistory(inputParams);
        outputResponse = this.modAdminFinishSuccess(inputParams);
      } else {
        outputResponse = this.invalidGroup(inputParams);
      }
      } else {
        outputResponse = this.invalidStatus(inputParams);
      }
      } else {
        outputResponse = this.invalidPassword(inputParams);
      }
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> admin_login >>', err);
    }
    outputResponse = await this.general.createAPIToken('admin_login', outputResponse);
    return outputResponse;
  }
  

  /**
   * getAdminLoginDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getAdminLoginDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.adminEntityRepo.createQueryBuilder('ma');

      queryObject.leftJoin(GroupMasterEntity, 'mgm', 'ma.groupId = mgm.id');
      queryObject.select('ma.id', 'ma_id');
      queryObject.addSelect('ma.name', 'ma_name');
      queryObject.addSelect('ma.email', 'ma_email');
      queryObject.addSelect('ma.username', 'ma_username');
      queryObject.addSelect('ma.password', 'ma_password');
      queryObject.addSelect('ma.phoneNumber', 'ma_phone_number');
      queryObject.addSelect('ma.groupId', 'ma_group_id');
      queryObject.addSelect('ma.lastLoginAt', 'ma_last_login_at');
      queryObject.addSelect('ma.status', 'ma_status');
      queryObject.addSelect('mgm.groupName', 'mgm_group_name');
      queryObject.addSelect('mgm.groupCode', 'mgm_group_code');
      queryObject.addSelect('mgm.status', 'mgm_status');
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.orWhere('ma.email = :email', { email: inputParams.email });
      }
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.orWhere('ma.username = :username', { username: inputParams.email });
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
    inputParams.get_admin_login_details = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * verifyAdminPassword method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async verifyAdminPassword(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.general.verifyAdminLoginPassword(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.verify_admin_password = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * insertAdminLoginHistory method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertAdminLoginHistory(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('ma_id' in inputParams) {
        queryColumns.userId = inputParams.ma_id;
      }
      queryColumns.ip = 'ip';
      //@ts-ignore;
      queryColumns.ip = this.checkIP(queryColumns.ip, inputParams, {
        field: 'ip',
        request: this.requestObj,
      });
      queryColumns.userType = 'Admin';
      queryColumns.loginDate = () => 'NOW()';
      const queryObject = this.logHistoryEntityRepo;
      const res = await queryObject.insert(queryColumns);
      const data = {
        insert_id: res.raw.insertId,
      };

      const success = 1;
      const message = 'Record(s) inserted.';

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
    inputParams.insert_admin_login_history = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * modAdminFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  modAdminFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Welcome #ma_name#, you have successfully logged in.'),
      fields: [],
    };
    settingFields.fields = [
      'ma_id',
      'ma_name',
      'ma_email',
      'ma_username',
      'ma_phone_number',
      'ma_group_id',
      'ma_status',
      'mgm_group_name',
      'mgm_group_code',
      'mgm_status',
      'insert_id',
    ];

    const outputKeys = [
      'get_admin_login_details',
      'insert_admin_login_history',
    ];
    const outputAliases = {
      ma_id: 'id',
      ma_name: 'name',
      ma_email: 'email',
      ma_username: 'username',
      ma_phone_number: 'phone_number',
      ma_group_id: 'group_id',
      ma_status: 'status',
      mgm_group_name: 'group_name',
      mgm_group_code: 'group_code',
      mgm_status: 'group_status',
      insert_id: 'log_id',
    };
    const outputObjects = [
      'get_admin_login_details',
      'insert_admin_login_history',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'admin_login';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * invalidGroup method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  invalidGroup(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Your group login temporarily inactivated. Please contact administrator..!'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_login',
      },
    );
  }

  /**
   * invalidStatus method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  invalidStatus(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Your admin login temporarily inactivated. Please contact administrator..!'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_login',
      },
    );
  }

  /**
   * invalidPassword method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  invalidPassword(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Sorry! Invalid credentials. Please enter valid credentials.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_login',
      },
    );
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
      message: custom.lang('Sorry! Invalid credentials. Please enter valid credentials.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_login',
      },
    );
  }
}
