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
import { BaseService } from 'src/services/base.service';

@Injectable()
export class AdminAddService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    AdminAddService.name,
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
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'prepare_verify_email_link',
      'insert_admin_data',
    ];
    this.multipleKeys = [
      'get_admin_email_for_add',
    ];
  }

  /**
   * startAdminAdd method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startAdminAdd(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getAdminEmailForAdd(inputParams);
      if (!_.isEmpty(inputParams.get_admin_email_for_add)) {
        outputResponse = this.finishDuplicate(inputParams);
      } else {
      inputParams = await this.prepareVerifyEmailLink(inputParams);
      inputParams = await this.insertAdminData(inputParams);
      if (!_.isEmpty(inputParams.insert_admin_data)) {
      inputParams = await this.sendRegistrationEmail(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
      }
    } catch (err) {
      this.log.error('API Error >> admin_add >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getAdminEmailForAdd method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getAdminEmailForAdd(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.adminEntityRepo.createQueryBuilder('ma');

      queryObject.select('id', 'ma_id');
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.andWhere('email = :email', { email: inputParams.email });
      }
      if (!custom.isEmpty(inputParams.username)) {
        queryObject.andWhere('username = :username', { username: inputParams.username });
      }

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
    inputParams.get_admin_email_for_add = this.blockResult.data;

    return inputParams;
  }

  /**
   * finishDuplicate method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishDuplicate(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Email / Username already exists.'),
      fields: [],
    };
    settingFields.fields = [
      'ma_id',
    ];

    const outputKeys = [
      'get_admin_email_for_add',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'admin_add';

    funcData.output_keys = outputKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * prepareVerifyEmailLink method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async prepareVerifyEmailLink(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.getAdminVerifyEmailLink(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.prepare_verify_email_link = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * insertAdminData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertAdminData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('name' in inputParams) {
        queryColumns.name = inputParams.name;
      }
      if ('email' in inputParams) {
        queryColumns.email = inputParams.email;
      }
      if ('username' in inputParams) {
        queryColumns.username = inputParams.username;
      }
      if ('dial_code' in inputParams) {
        queryColumns.dialCode = inputParams.dial_code;
      }
      if ('phone_number' in inputParams) {
        queryColumns.phoneNumber = inputParams.phone_number;
      }
      if ('group_id' in inputParams) {
        queryColumns.groupId = inputParams.group_id;
      }
      if ('otp_code' in inputParams) {
        queryColumns.otpCode = inputParams.otp_code;
      }
      if ('verify_code' in inputParams) {
        queryColumns.verificationCode = inputParams.verify_code;
      }
      queryColumns.isTemporaryPassword = 'Yes';
      queryColumns.createdAt = () => 'NOW()';
      if ('status' in inputParams) {
        queryColumns.status = inputParams.status;
      }
      const queryObject = this.adminEntityRepo;
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
    inputParams.insert_admin_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * sendRegistrationEmail method is used to process email notification.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async sendRegistrationEmail(inputParams: any) {
    this.blockResult = {};
    let success: number;
    let message: string;
    try {
      const emailParams: any = {};
      emailParams.to_email = inputParams.email || null;

      emailParams.async = true,
      emailParams.new_priority = 'default';
      emailParams.params = {};
      emailParams.params.NAME = inputParams.name || null;
      emailParams.params.USER_EMAIL = inputParams.email || null;
      emailParams.params.USER_NAME = inputParams.username || null;
      emailParams.params.VERIFY_EMAIL = inputParams.verify_link || null;

      const extraParams = { ...inputParams };
      extraParams.async = true;

      const res = await this.general.sendMailNotification(
        emailParams,
        'ADMIN_REGISTER',
        extraParams,
      );
      if (!res) {
        throw new Error('Failure in sending email notification.');
      }
      success = 1;
      message = 'Email notification send successfully.';
    } catch (err) {
      success = 0;
      message = err;
    }
    this.blockResult.success = success;
    this.blockResult.message = message;
    inputParams.send_registration_email = this.blockResult;

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
      message: custom.lang('Admin added successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'insert_id',
    ];

    const outputKeys = [
      'insert_admin_data',
    ];
    const outputAliases = {
      insert_id: 'admin_id',
    };
    const outputObjects = [
      'insert_admin_data',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'admin_add';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
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
      success: 0,
      message: custom.lang('Something went wrong.Please try again.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_add',
      },
    );
  }
}
