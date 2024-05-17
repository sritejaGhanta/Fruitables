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

import { UserEntity } from 'src/entities/user.entity';
import { BaseService } from 'src/services/base.service';

import { rabbitmqNotificationConfig } from 'src/config/all-rabbitmq-core';
@Injectable()
export class UserChangePasswordService extends BaseService {
  @Client({
    ...rabbitmqNotificationConfig,
    options: {
      ...rabbitmqNotificationConfig.options,
    },
  })
  rabbitmqGatewayNotificationClient: ClientProxy;

  protected readonly log = new LoggerHandler(
    UserChangePasswordService.name,
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
  @InjectRepository(UserEntity)
  protected userEntityRepo: Repository<UserEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = ['user', 'custom_function', 'update_pass'];
    this.multipleKeys = ['external_api'];
  }

  /**
   * startUserChangePassword method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUserChangePassword(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.user(inputParams);
      if (!_.isEmpty(inputParams.user)) {
        inputParams = await this.customFunction(inputParams);
        if (inputParams.is_matched === 1) {
          inputParams = await this.updatePass(inputParams);
          if (!_.isEmpty(inputParams.update_pass)) {
            inputParams = await this.externalApi(inputParams);
            outputResponse = this.userFinishSuccess(inputParams);
          } else {
            outputResponse = this.userFinishSuccess1(inputParams);
          }
        } else {
          outputResponse = this.finishFailure1(inputParams);
        }
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> user_change_password >>', err);
    }
    return outputResponse;
  }

  /**
   * user method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async user(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.userEntityRepo.createQueryBuilder('u');

      queryObject.select('u.vPassword', 'mc_password');
      queryObject.addSelect('u.vEmail', 'u_email');
      queryObject.addSelect('u.iUserId', 'u_user_id');
      queryObject.andWhere('u.iUserId = :iUserId', {
        iUserId: this.requestObj.user.user_id,
      });

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
    inputParams.user = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * customFunction method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async customFunction(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.general.verifyCustomerLoginPassword(
        inputParams,
      );

      formatData = this.response.assignFunctionResponse(result);
      inputParams.custom_function = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * updatePass method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updatePass(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('new_password' in inputParams) {
        queryColumns.vPassword = inputParams.new_password;
      }
      //@ts-ignore;
      queryColumns.vPassword = await this.general.encryptPassword(
        queryColumns.vPassword,
        inputParams,
        {
          field: 'new_password',
          request: this.requestObj,
        },
      );

      const queryObject = this.userEntityRepo
        .createQueryBuilder()
        .update(UserEntity)
        .set(queryColumns);
      queryObject.andWhere('vEmail = :vEmail', {
        vEmail: this.requestObj.user.email,
      });
      queryObject.andWhere('iUserId = :iUserId', {
        iUserId: this.requestObj.user.user_id,
      });
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
    inputParams.update_pass = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * externalApi method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async externalApi(inputParams: any) {
    const extInputParams: any = {
      id: inputParams.u_user_id,
      id_type: 'user',
      notification_type: 'USER_CHANGE_PASSWORD',
      notification_status: '',
      otp: '',
    };
    console.log('emiting from here rabbitmq no response!');
    this.rabbitmqGatewayNotificationClient.emit(
      'gateway_notification',
      extInputParams,
    );
    return inputParams;
  }

  /**
   * userFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Password updated successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_change_password',
      },
    );
  }

  /**
   * userFinishSuccess1 method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userFinishSuccess1(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Somthing wents wrong please try again.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_change_password',
      },
    );
  }

  /**
   * finishFailure1 method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishFailure1(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Inavlid old password.'),
      fields: [],
    };
    settingFields.fields = ['mc_password', 'u_email'];

    const outputKeys = ['user'];
    const outputObjects = ['user'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'user_change_password';

    funcData.output_keys = outputKeys;
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
      message: custom.lang('Inavild User.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_change_password',
      },
    );
  }
}
