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
export class CustomerResetPasswordService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CustomerResetPasswordService.name,
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
      'get_customer_info',
      'update_customer_password',
    ];
  }

  /**
   * startCustomerResetPassword method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCustomerResetPassword(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCustomerInfo(inputParams);
      if (!_.isEmpty(inputParams.get_customer_info) && inputParams.otp_code === inputParams.mc_opt_code) {
      inputParams = await this.updateCustomerPassword(inputParams);
      if (!custom.isEmpty(inputParams.mc_password)) {
      inputParams = await this.sendChangePasswordEmail(inputParams);
      }
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> customer_reset_password >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCustomerInfo method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCustomerInfo(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.customerEntityRepo.createQueryBuilder('mc');

      queryObject.select('id', 'mc_id');
      queryObject.addSelect('email', 'mc_email');
      queryObject.addSelect('otpCode', 'mc_opt_code');
      queryObject.addSelect('CONCAT(mc.firstName,\' \',mc.lastName)', 'mc_name');
      queryObject.addSelect('password', 'mc_password');
      if (!custom.isEmpty(inputParams.customer_id)) {
        queryObject.andWhere('id = :id', { id: inputParams.customer_id });
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
    inputParams.get_customer_info = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * updateCustomerPassword method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateCustomerPassword(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      if ('password' in inputParams) {
        queryColumns.password = inputParams.password;
      }
      //@ts-ignore;
      queryColumns.password = this.passwordEncrypt(queryColumns.password, inputParams, {
        field: 'password',
        request: this.requestObj,
      });
      queryColumns.updatedAt = () => 'NOW()';

      const queryObject = this.customerEntityRepo
        .createQueryBuilder()
        .update(CustomerEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.customer_id)) {
        queryObject.andWhere('id = :id', { id: inputParams.customer_id });
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
    inputParams.update_customer_password = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * sendChangePasswordEmail method is used to process email notification.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async sendChangePasswordEmail(inputParams: any) {
    this.blockResult = {};
    let success: number;
    let message: string;
    try {
      const emailParams: any = {};
      emailParams.to_email = inputParams.mc_email || null;

      emailParams.async = true,
      emailParams.new_priority = 'default';
      emailParams.params = {};
      emailParams.params.NAME = inputParams.mc_name || null;

      const extraParams = { ...inputParams };
      extraParams.async = true;

      const res = await this.general.sendMailNotification(
        emailParams,
        'USER_PASSWORD_CHANGED',
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
    inputParams.send_change_password_email = this.blockResult;

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
      message: custom.lang('Password updated successfully. Please login to continue.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'customer_reset_password',
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
      message: custom.lang('Sorry! #otp_code# does not matched.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'customer_reset_password',
      },
    );
  }
}
