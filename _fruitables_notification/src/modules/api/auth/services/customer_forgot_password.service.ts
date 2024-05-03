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


import { CustomerEntity } from 'src/entities/customer.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class CustomerForgotPasswordService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CustomerForgotPasswordService.name,
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
    @InjectRepository(CustomerEntity)
  protected customerEntityRepo: Repository<CustomerEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_customer_data_by_email',
      'prepare_reset_password_code',
      'update_customer_reset_code',
    ];
  }

  /**
   * startCustomerForgotPassword method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCustomerForgotPassword(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCustomerDataByEmail(inputParams);
      if (!_.isEmpty(inputParams.get_customer_data_by_email)) {
      inputParams = await this.prepareResetPasswordCode(inputParams);
      inputParams = await this.updateCustomerResetCode(inputParams);
      inputParams = await this.sendResetPasswordEmail(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> customer_forgot_password >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCustomerDataByEmail method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCustomerDataByEmail(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.customerEntityRepo.createQueryBuilder('mc');

      queryObject.select('id', 'mc_id');
      queryObject.addSelect('firstName', 'mc_first_name');
      queryObject.addSelect('email', 'mc_email');
      queryObject.addSelect('lastName', 'mc_last_name');
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
    inputParams.get_customer_data_by_email = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * prepareResetPasswordCode method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async prepareResetPasswordCode(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.getCustomerResetPasswordCode(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.prepare_reset_password_code = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * updateCustomerResetCode method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateCustomerResetCode(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      if ('reset_code' in inputParams) {
        queryColumns.otpCode = inputParams.reset_code;
      }
      queryColumns.updatedAt = () => 'NOW()';

      const queryObject = this.customerEntityRepo
        .createQueryBuilder()
        .update(CustomerEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.mc_id)) {
        queryObject.andWhere('id = :id', { id: inputParams.mc_id });
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
    inputParams.update_customer_reset_code = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * sendResetPasswordEmail method is used to process email notification.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async sendResetPasswordEmail(inputParams: any) {
    this.blockResult = {};
    let success: number;
    let message: string;
    try {
      const emailParams: any = {};
      emailParams.to_email = inputParams.email || null;

      emailParams.async = true,
      emailParams.new_priority = 'default';
      emailParams.params = {};
      emailParams.params.NAME = inputParams.full_name || null;
      emailParams.params.RESET_CODE = inputParams.reset_code || null;

      const extraParams = { ...inputParams };
      extraParams.async = true;

      const res = await this.general.sendMailNotification(
        emailParams,
        'USER_RESET_PASSWORD',
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
    inputParams.send_reset_password_email = this.blockResult;

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
      message: custom.lang('We have send an email to reset your password. Please check and follow the instructions'),
      fields: [],
    };
    settingFields.fields = [
      'mc_id',
    ];

    const outputKeys = [
      'get_customer_data_by_email',
    ];
    const outputAliases = {
      mc_id: 'customer_id',
    };
    const outputObjects = [
      'get_customer_data_by_email',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'customer_forgot_password';

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
      message: custom.lang('Sorry, we don\'t recognize the email address provided.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'customer_forgot_password',
      },
    );
  }
}
