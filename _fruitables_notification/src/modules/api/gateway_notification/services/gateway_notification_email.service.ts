interface AuthObject {
  user: any;
}
import { Inject, Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Client, ClientProxy } from '@nestjs/microservices';

import * as _ from 'lodash';
import * as custom from 'src/utilities/custom-helper';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { BlockResultDto, SettingsParamsDto } from 'src/common/dto/common.dto';

import { ResponseLibrary } from 'src/utilities/response-library';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
import { ResponseHandlerInterface } from 'src/utilities/response-handler';

import { GatewayNotificationEntity } from 'src/entities/gateway-notification.entity';
import { BaseService } from 'src/services/base.service';

import { rabbitmqUserConfig, rabbitmqOrderConfig } from 'src/config/all-rabbitmq-core';
@Injectable()
export class GatewayNotificationEmailService extends BaseService {
  
  @Client({
    ...rabbitmqUserConfig,
    options: {
      ...rabbitmqUserConfig.options,
    }
  })
  rabbitmqRmqUserDetailsClient: ClientProxy;

  @Client({
    ...rabbitmqUserConfig,
    options: {
      ...rabbitmqUserConfig.options,
    }
  })
  rabbitmqRmqUserOtpUpdateClient: ClientProxy;

  @Client({
    ...rabbitmqOrderConfig,
    options: {
      ...rabbitmqOrderConfig.options,
    }
  })
  rabbitmqRmqOrderDetailsClient: ClientProxy;
  
  protected readonly log = new LoggerHandler(
    GatewayNotificationEmailService.name,
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
    @InjectRepository(GatewayNotificationEntity)
  protected gatewayNotificationEntityRepo: Repository<GatewayNotificationEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'verify_user_in_email_notification',
      'insert_user_forget_password',
      'insert_change_password',
      'user_add_notification',
    ];
    this.multipleKeys = [
      'get_user_details',
      'user_otp_update',
      'get_order_details',
      'ordered_product_data',
      'get_ordered_user_address',
    ];
  }

  /**
   * startGatewayNotificationEmail method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startGatewayNotificationEmail(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      if (inputParams.id_type === 'user') {
      inputParams = await this.getUserDetails(inputParams);
      if (!_.isEmpty(inputParams.get_user_details)) {
      inputParams = await this.verifyUserInEmailNotification(inputParams);
      if (!_.isEmpty(inputParams.verify_user_in_email_notification)) {
      if (inputParams.notification_type === 'FORGOT_PASSWORD' && !custom.isEmpty(inputParams.otp)) {
      inputParams = await this.userOtpUpdate(inputParams);
      if (!_.isEmpty(inputParams.user_otp_update)) {
      inputParams = await this.insertUserForgetPassword(inputParams);
      this.emailNotification1(inputParams);
        outputResponse = this.gatewayNotificationFinishSuccess1(inputParams);
      } else {
        outputResponse = this.gatewayNotificationFinishSuccess3(inputParams);
      }
      } else {
      inputParams = await this.insertChangePassword(inputParams);
      this.emailNotification2(inputParams);
        outputResponse = this.gatewayNotificationFinishSuccess(inputParams);
      }
      } else {
      inputParams = await this.userAddNotification(inputParams);
      this.emailNotification(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      }
      } else {
        outputResponse = this.gatewayNotificationFinishSuccess4(inputParams);
      }
      } else {
      if (inputParams.id_type === 'order') {
      inputParams = await this.getOrderDetails(inputParams);
      inputParams = await this.orderedProductData(inputParams);
      inputParams = await this.getOrderedUserAddress(inputParams);
      this.emailNotification3(inputParams);
        outputResponse = this.gatewayNotificationFinishSuccess2(inputParams);
      } else {
        outputResponse = this.gatewayNotificationFinishSuccess5(inputParams);
      }
      }
    } catch (err) {
      this.log.error('API Error >> gateway_notification_email >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getUserDetails method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUserDetails(inputParams: any) {
    
    this.blockResult = {};
    let apiResult: ResponseHandlerInterface = {};
    let apiInfo = {};
    let success;
    let message;
    
    
    const extInputParams: any = {
      id: inputParams.id,
    };
        
    try {
      console.log('emiting from here rabbitmq!');            
      apiResult = await new Promise<any>((resolve, reject) => {
        this.rabbitmqRmqUserDetailsClient
          .send('rmq_user_details', extInputParams)
          .pipe()
          .subscribe((data: any) => {
          resolve(data);
        });
      });

      if (!apiResult?.settings?.success) {
        throw new Error(apiResult?.settings?.message);
      }
      this.blockResult.data = apiResult.data;

      success = apiResult.settings.success;
      message = apiResult.settings.message;
    } catch (err) {
      success = 0;
      message = err;
    }

    this.blockResult.success = success;
    this.blockResult.message = message;

    inputParams.get_user_details = (apiResult.settings.success) ? apiResult.data : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach(key => {
        const infoKey = `' . get_user_details . '_0`;
        inputParams[infoKey] = apiInfo[key];
      });
    }

    return inputParams;
  }

  /**
   * verifyUserInEmailNotification method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async verifyUserInEmailNotification(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.gatewayNotificationEntityRepo.createQueryBuilder('gn');

      queryObject.select('gn.id', 'gn_id');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('gn.id = :id', { id: inputParams.id });
      }
      if (!custom.isEmpty(inputParams.id_type)) {
        queryObject.andWhere('gn.eIdType = :eIdType', { eIdType: inputParams.id_type });
      }
      queryObject.andWhere('gn.eNotificationType = :eNotificationType', { eNotificationType: ' USER_ADD' });

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
    inputParams.verify_user_in_email_notification = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * userOtpUpdate method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async userOtpUpdate(inputParams: any) {
    
    this.blockResult = {};
    let apiResult: ResponseHandlerInterface = {};
    let apiInfo = {};
    let success;
    let message;
    
    
    const extInputParams: any = {
      otp: inputParams.otp,
      id: inputParams.id,
    };
        
    try {
      console.log('emiting from here rabbitmq!');            
      apiResult = await new Promise<any>((resolve, reject) => {
        this.rabbitmqRmqUserOtpUpdateClient
          .send('rmq_user_otp_update', extInputParams)
          .pipe()
          .subscribe((data: any) => {
          resolve(data);
        });
      });

      if (!apiResult?.settings?.success) {
        throw new Error(apiResult?.settings?.message);
      }
      this.blockResult.data = apiResult.data;

      success = apiResult.settings.success;
      message = apiResult.settings.message;
    } catch (err) {
      success = 0;
      message = err;
    }

    this.blockResult.success = success;
    this.blockResult.message = message;

    inputParams.user_otp_update = (apiResult.settings.success) ? apiResult.data : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach(key => {
        const infoKey = `' . user_otp_update . '_1`;
        inputParams[infoKey] = apiInfo[key];
      });
    }

    return inputParams;
  }

  /**
   * insertUserForgetPassword method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertUserForgetPassword(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('id' in inputParams) {
        queryColumns.id = inputParams.id;
      }
      if ('id_type' in inputParams) {
        queryColumns.eIdType = inputParams.id_type;
      }
      if ('notification_type' in inputParams) {
        queryColumns.eNotificationType = inputParams.notification_type;
      }
      if ('notification_status' in inputParams) {
        queryColumns.eNotificationStatus = inputParams.notification_status;
      }
      if ('createdAt' in inputParams) {
        queryColumns.createdAt = inputParams.createdAt;
      }
      const queryObject = this.gatewayNotificationEntityRepo;
      const res = await queryObject.insert(queryColumns);
      const data = {
        insert_id1: res.raw.insertId,
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
    inputParams.insert_user_forget_password = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * emailNotification1 method is used to process email notification.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async emailNotification1(inputParams: any) {
    this.blockResult = {};
    let success: number;
    let message: string;
    try {
      const emailParams: any = {};
      emailParams.to_email = inputParams.email || null;

      emailParams.async = true,
      emailParams.new_priority = 'default';
      emailParams.params = {};
      emailParams.params.NAME = inputParams.first_name || null;
      emailParams.params.RESET_CODE = inputParams.otp || null;

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
    inputParams.email_notification_1 = this.blockResult;

    return inputParams;
  }

  /**
   * gatewayNotificationFinishSuccess1 method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  gatewayNotificationFinishSuccess1(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang(''),
      fields: [],
    };
    settingFields.fields = [
      'gn_id',
    ];

    const outputKeys = [
      'verify_user_in_email_notification',
    ];
    const outputObjects = [
      'verify_user_in_email_notification',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'gateway_notification_email';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * gatewayNotificationFinishSuccess3 method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  gatewayNotificationFinishSuccess3(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('user otp update something went wrong. '),
      fields: [],
    };
    settingFields.fields = [
      'update_user_otp',
      'affected_rows',
      'verify_user_id',
    ];

    const outputKeys = [
      'user_otp_update',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'gateway_notification_email';

    funcData.output_keys = outputKeys;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * insertChangePassword method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertChangePassword(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('id' in inputParams) {
        queryColumns.id = inputParams.id;
      }
      if ('id_type' in inputParams) {
        queryColumns.eIdType = inputParams.id_type;
      }
      if ('notification_type' in inputParams) {
        queryColumns.eNotificationType = inputParams.notification_type;
      }
      if ('notification_status' in inputParams) {
        queryColumns.eNotificationStatus = inputParams.notification_status;
      }
      if ('createdAt' in inputParams) {
        queryColumns.createdAt = inputParams.createdAt;
      }
      const queryObject = this.gatewayNotificationEntityRepo;
      const res = await queryObject.insert(queryColumns);
      const data = {
        insert_id2: res.raw.insertId,
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
    inputParams.insert_change_password = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * emailNotification2 method is used to process email notification.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async emailNotification2(inputParams: any) {
    this.blockResult = {};
    let success: number;
    let message: string;
    try {
      const emailParams: any = {};
      emailParams.to_email = inputParams.email || null;

      emailParams.async = true,
      emailParams.new_priority = 'default';
      emailParams.params = {};
      emailParams.params.NAME = inputParams.first_name || null;

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
    inputParams.email_notification_2 = this.blockResult;

    return inputParams;
  }

  /**
   * gatewayNotificationFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  gatewayNotificationFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang(''),
      fields: [],
    };
    settingFields.fields = [
      'gn_id',
    ];

    const outputKeys = [
      'verify_user_in_email_notification',
    ];
    const outputObjects = [
      'verify_user_in_email_notification',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'gateway_notification_email';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * userAddNotification method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async userAddNotification(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('id' in inputParams) {
        queryColumns.id = inputParams.id;
      }
      if ('id_type' in inputParams) {
        queryColumns.eIdType = inputParams.id_type;
      }
      if ('notification_type' in inputParams) {
        queryColumns.eNotificationType = inputParams.notification_type;
      }
      if ('notification_status' in inputParams) {
        queryColumns.eNotificationStatus = inputParams.notification_status;
      }
      if ('createdAt' in inputParams) {
        queryColumns.createdAt = inputParams.createdAt;
      }
      const queryObject = this.gatewayNotificationEntityRepo;
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
    inputParams.user_add_notification = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * emailNotification method is used to process email notification.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async emailNotification(inputParams: any) {
    this.blockResult = {};
    let success: number;
    let message: string;
    try {
      const emailParams: any = {};
      emailParams.to_email = inputParams.email || null;

      emailParams.async = true,
      emailParams.new_priority = 'default';
      emailParams.params = {};
      emailParams.params.NAME = inputParams.first_name || null;
      emailParams.params.USER_EMAIL = inputParams.email || null;
      emailParams.params.VERIFY_EMAIL = inputParams.email || null;

      const extraParams = { ...inputParams };
      extraParams.async = true;

      const res = await this.general.sendMailNotification(
        emailParams,
        'USER_REGISTER',
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
    inputParams.email_notification = this.blockResult;

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
      message: custom.lang('user added email sent successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'gateway_notification_email',
      },
    );
  }

  /**
   * gatewayNotificationFinishSuccess4 method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  gatewayNotificationFinishSuccess4(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('user not found.'),
      fields: [],
    };
    settingFields.fields = [
      'rmq_get_user',
      'user_id',
      'profile_image',
      'first_name',
      'last_name',
      'email',
      'phone_number',
      'dial_code',
      'status',
    ];

    const outputKeys = [
      'get_user_details',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'gateway_notification_email';

    funcData.output_keys = outputKeys;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * getOrderDetails method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getOrderDetails(inputParams: any) {
    
    this.blockResult = {};
    let apiResult: ResponseHandlerInterface = {};
    let apiInfo = {};
    let success;
    let message;
    
    
    const extInputParams: any = {
      order_id: inputParams.id,
    };
        
    try {
      console.log('emiting from here rabbitmq!');            
      apiResult = await new Promise<any>((resolve, reject) => {
        this.rabbitmqRmqOrderDetailsClient
          .send('rmq_order_details', extInputParams)
          .pipe()
          .subscribe((data: any) => {
          resolve(data);
        });
      });

      if (!apiResult?.settings?.success) {
        throw new Error(apiResult?.settings?.message);
      }
      this.blockResult.data = apiResult.data;

      success = apiResult.settings.success;
      message = apiResult.settings.message;
    } catch (err) {
      success = 0;
      message = err;
    }

    this.blockResult.success = success;
    this.blockResult.message = message;

    inputParams.get_order_details = (apiResult.settings.success) ? apiResult.data : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach(key => {
        const infoKey = `' . get_order_details . '_0`;
        inputParams[infoKey] = apiInfo[key];
      });
    }

    return inputParams;
  }

  /**
   * orderedProductData method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async orderedProductData(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.getOrderedProductDetails(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.ordered_product_data = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * getOrderedUserAddress method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getOrderedUserAddress(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.getUserAddress(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.get_ordered_user_address = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * emailNotification3 method is used to process email notification.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async emailNotification3(inputParams: any) {
    this.blockResult = {};
    let success: number;
    let message: string;
    try {
      const emailParams: any = {};
      emailParams.to_email = inputParams.email || null;

      emailParams.async = true,
      emailParams.new_priority = 'default';
      emailParams.params = {};
      emailParams.params.CUSTOMER_NAME = inputParams.first_name || null;
      emailParams.params.ORDER_ID = inputParams.order_id || null;
      emailParams.params.ORDER_DATE = inputParams.order_createdAt || null;
      emailParams.params.AMOUNT = inputParams.order_total_cost || null;

      const extraParams = { ...inputParams };
      extraParams.async = true;

      const res = await this.general.sendMailNotification(
        emailParams,
        'ORDER_CONFIRMATION',
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
    inputParams.email_notification_3 = this.blockResult;

    return inputParams;
  }

  /**
   * gatewayNotificationFinishSuccess2 method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  gatewayNotificationFinishSuccess2(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang(''),
      fields: [],
    };
    settingFields.fields = [
      'gn_id',
    ];

    const outputKeys = [
      'verify_user_in_email_notification',
    ];
    const outputObjects = [
      'verify_user_in_email_notification',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'gateway_notification_email';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * gatewayNotificationFinishSuccess5 method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  gatewayNotificationFinishSuccess5(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('some thing went wrong.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'gateway_notification_email',
      },
    );
  }
}
