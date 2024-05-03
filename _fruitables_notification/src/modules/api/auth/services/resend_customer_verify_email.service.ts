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
export class ResendCustomerVerifyEmailService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    ResendCustomerVerifyEmailService.name,
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
      'get_customer_data_by_id',
      'prepare_verify_email_link',
      'update_customer_verify_code',
    ];
  }

  /**
   * startResendCustomerVerifyEmail method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startResendCustomerVerifyEmail(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCustomerDataById(inputParams);
      if (!_.isEmpty(inputParams.get_customer_data_by_id)) {
      inputParams = await this.prepareVerifyEmailLink(inputParams);
      inputParams = await this.updateCustomerVerifyCode(inputParams);
      inputParams = await this.sendVerificationEmail(inputParams);
        outputResponse = this.modCustomerFinishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> resend_customer_verify_email >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCustomerDataById method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCustomerDataById(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.customerEntityRepo.createQueryBuilder('mc');

      queryObject.select('id', 'mc_id');
      queryObject.addSelect('firstName', 'mc_first_name');
      queryObject.addSelect('lastName', 'mc_last_name');
      queryObject.addSelect('email', 'mc_email');
      queryObject.andWhere('id = :id', { id: this.requestObj.user.customer_id });

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
    inputParams.get_customer_data_by_id = this.blockResult.data;
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
      const result = await this.getCustomerVerifyEmailLink(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.prepare_verify_email_link = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * updateCustomerVerifyCode method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateCustomerVerifyCode(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      if ('verify_code' in inputParams) {
        queryColumns.verificationCode = inputParams.verify_code;
      }
      queryColumns.updatedAt = 'NOW()';

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
    inputParams.update_customer_verify_code = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * sendVerificationEmail method is used to process email notification.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async sendVerificationEmail(inputParams: any) {
    this.blockResult = {};
    let success: number;
    let message: string;
    try {
      const emailParams: any = {};
      emailParams.to_email = inputParams.mc_email || null;

      emailParams.async = true,
      emailParams.new_priority = 'default';
      emailParams.params = {};
      emailParams.params.NAME = inputParams.full_name || null;
      emailParams.params.VERIFY_EMAIL = inputParams.verify_link || null;

      const extraParams = { ...inputParams };
      extraParams.async = true;

      const res = await this.general.sendMailNotification(
        emailParams,
        'USER_VERIFY_EMAIL',
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
    inputParams.send_verification_email = this.blockResult;

    return inputParams;
  }

  /**
   * modCustomerFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  modCustomerFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Email verification link sent to your registered email.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'resend_customer_verify_email',
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
      status: 400,
      success: 0,
      message: custom.lang('User details not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'resend_customer_verify_email',
      },
    );
  }
}
