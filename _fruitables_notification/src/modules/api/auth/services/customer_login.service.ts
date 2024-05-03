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


import { CustomerEntity } from 'src/entities/customer.entity';
import { LogHistoryEntity } from 'src/entities/log-history.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class CustomerLoginService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CustomerLoginService.name,
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
    @InjectRepository(CustomerEntity)
  protected customerEntityRepo: Repository<CustomerEntity>;
    @InjectRepository(LogHistoryEntity)
  protected logHistoryEntityRepo: Repository<LogHistoryEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_customer_by_email',
      'insert_customer_log_histroy',
    ];
    this.multipleKeys = [
      'verify_login_password',
    ];
  }

  /**
   * startCustomerLogin method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCustomerLogin(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCustomerByEmail(inputParams);
      if (!_.isEmpty(inputParams.get_customer_by_email)) {
      inputParams = await this.verifyLoginPassword(inputParams);
      if (inputParams.is_matched === 1) {
      if (inputParams.mc_status === 'Active') {
      inputParams = await this.insertCustomerLogHistroy(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.statusFailure(inputParams);
      }
      } else {
        outputResponse = this.passwordFailure(inputParams);
      }
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> customer_login >>', err);
    }
    outputResponse = await this.general.createAPIToken('customer_login', outputResponse);
    return outputResponse;
  }
  

  /**
   * getCustomerByEmail method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCustomerByEmail(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.customerEntityRepo.createQueryBuilder('mc');

      queryObject.select('id', 'mc_id');
      queryObject.addSelect('firstName', 'mc_first_name');
      queryObject.addSelect('lastName', 'mc_last_name');
      queryObject.addSelect('email', 'mc_email');
      queryObject.addSelect('password', 'mc_password');
      queryObject.addSelect('dialCode', 'mc_dial_code');
      queryObject.addSelect('phonenumber', 'mc_phonenumber');
      queryObject.addSelect('profileImage', 'mc_profile_image');
      queryObject.addSelect('isEmailVerified', 'mc_is_email_verified');
      queryObject.addSelect('status', 'mc_status');
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.andWhere('email = :email', { email: inputParams.email });
      }

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let fileConfig: FileFetchDto;
      let val;
      if (_.isObject(data) && !_.isEmpty(data)) {
        const row: any = data;
          val = row.mc_profile_image;
          fileConfig = {};
          fileConfig.source = 'local';
          fileConfig.path = 'profile_image';
          fileConfig.image_name = val;
          fileConfig.extensions = await this.general.getConfigItem('allowed_extensions');
          fileConfig.color = 'FFFFFF';
          val = await this.general.getFile(fileConfig, inputParams);
          data['mc_profile_image'] = val;
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
    inputParams.get_customer_by_email = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * verifyLoginPassword method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async verifyLoginPassword(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.general.verifyCustomerLoginPassword(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.verify_login_password = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * insertCustomerLogHistroy method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertCustomerLogHistroy(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('mc_id' in inputParams) {
        queryColumns.userId = inputParams.mc_id;
      }
      if ('ip' in inputParams) {
        queryColumns.ip = inputParams.ip;
      }
      //@ts-ignore;
      queryColumns.ip = this.checkIP(queryColumns.ip, inputParams, {
        field: 'ip',
        request: this.requestObj,
      });
      queryColumns.userType = 'Front';
      queryColumns.loginDate = 'NOW()';
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
    inputParams.insert_customer_log_histroy = this.blockResult.data;
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
      message: custom.lang('Sign in successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'mc_id',
      'mc_first_name',
      'mc_last_name',
      'mc_email',
      'mc_dial_code',
      'mc_phonenumber',
      'mc_profile_image',
      'mc_is_email_verified',
      'mc_status',
      'insert_id',
    ];

    const outputKeys = [
      'get_customer_by_email',
      'insert_customer_log_histroy',
    ];
    const outputAliases = {
      mc_id: 'customer_id',
      mc_first_name: 'first_name',
      mc_last_name: 'last_name',
      mc_email: 'email',
      mc_dial_code: 'dial_code',
      mc_phonenumber: 'phonenumber',
      mc_profile_image: 'profile_image',
      mc_is_email_verified: 'email_verified',
      mc_status: 'status',
      insert_id: 'log_id',
    };
    const outputObjects = [
      'get_customer_by_email',
      'insert_customer_log_histroy',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'customer_login';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * statusFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  statusFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Your account is Inactive, Please contact administrator.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'customer_login',
      },
    );
  }

  /**
   * passwordFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  passwordFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Sorry, we don\'t recognize that email or password. Please try again.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'customer_login',
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
      message: custom.lang('Sorry, we don\'t recognize that email or password. Please try again.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'customer_login',
      },
    );
  }
}
