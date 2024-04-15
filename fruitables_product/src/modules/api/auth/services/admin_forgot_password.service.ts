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
export class AdminForgotPasswordService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    AdminForgotPasswordService.name,
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
      'get_admin_by_email',
      'prepare_verify_email_link',
      'update_admin_otp_code',
    ];
  }

  /**
   * startAdminForgotPassword method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startAdminForgotPassword(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getAdminByEmail(inputParams);
      if (!_.isEmpty(inputParams.get_admin_by_email)) {
      inputParams = await this.prepareVerifyEmailLink(inputParams);
      inputParams = await this.updateAdminOtpCode(inputParams);
      inputParams = await this.sendForgotPasswordEmail(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> admin_forgot_password >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getAdminByEmail method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getAdminByEmail(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.adminEntityRepo.createQueryBuilder('ma');

      queryObject.select('id', 'ma_id');
      queryObject.addSelect('name', 'ma_name');
      queryObject.addSelect('email', 'ma_email');
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.andWhere('email = :email', { email: inputParams.email });
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
    inputParams.get_admin_by_email = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
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
      const result = await this.getVerifyEmailLink(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.prepare_verify_email_link = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * updateAdminOtpCode method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateAdminOtpCode(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      if ('verify_code' in inputParams) {
        queryColumns.verificationCode = inputParams.verify_code;
      }
      queryColumns.updatedAt = () => 'NOW()';
      if ('verify_code' in inputParams) {
        queryColumns.otpCode = inputParams.verify_code;
      }

      const queryObject = this.adminEntityRepo
        .createQueryBuilder()
        .update(AdminEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.ma_id)) {
        queryObject.andWhere('id = :id', { id: inputParams.ma_id });
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
    inputParams.update_admin_otp_code = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * sendForgotPasswordEmail method is used to process email notification.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async sendForgotPasswordEmail(inputParams: any) {
    this.blockResult = {};
    let success: number;
    let message: string;
    try {
      const emailParams: any = {};
      emailParams.to_email = inputParams.ma_email || null;

      emailParams.async = true,
      emailParams.new_priority = 'default';
      emailParams.params = {};
      emailParams.params.NAME = inputParams.ma_name || null;
      emailParams.params.RESET_CODE = inputParams.verify_code || null;

      const extraParams = { ...inputParams };
      extraParams.async = true;

      const res = await this.general.sendMailNotification(
        emailParams,
        'ADMIN_RESET_PASSWORD',
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
    inputParams.send_forgot_password_email = this.blockResult;

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
      message: custom.lang('OTP sent successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'token',
    ];

    const outputKeys = [
      'prepare_verify_email_link',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'admin_forgot_password';

    funcData.output_keys = outputKeys;
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
      message: custom.lang('No admin exists with this email address.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_forgot_password',
      },
    );
  }
}
