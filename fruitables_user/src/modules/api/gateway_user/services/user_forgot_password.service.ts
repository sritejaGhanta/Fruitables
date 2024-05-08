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
export class UserForgotPasswordService extends BaseService {
  @Client({
    ...rabbitmqNotificationConfig,
    options: {
      ...rabbitmqNotificationConfig.options,
    },
  })
  rabbitmqGatewayNotificationClient: ClientProxy;

  protected readonly log = new LoggerHandler(
    UserForgotPasswordService.name,
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
    this.singleKeys = ['get_user', 'update_otp'];
    this.multipleKeys = ['external_api'];
  }

  /**
   * startUserForgotPassword method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUserForgotPassword(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getUser(inputParams);
      if (!_.isEmpty(inputParams.get_user)) {
        inputParams = await this.updateOtp(inputParams);
        inputParams = await this.externalApi(inputParams);
        outputResponse = this.userFinishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> user_forgot_password >>', err);
    }
    return outputResponse;
  }

  /**
   * getUser method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUser(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.userEntityRepo.createQueryBuilder('u');

      queryObject.select('u.iUserId', 'u_user_id');
      queryObject.addSelect('u.vEmail', 'u_email');
      queryObject.addSelect("''", 'otp_code');
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.andWhere('u.vEmail = :vEmail', {
          vEmail: inputParams.email,
        });
      }

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let val;
      if (_.isObject(data) && !_.isEmpty(data)) {
        const row: any = data;
        val = row.otp_code;
        //@ts-ignore;
        val = await this.general.generateOTPCode(val, row, {
          field: 'otp_code',
          params: inputParams,
          request: this.requestObj,
        });
        data['otp_code'] = val;
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
    inputParams.get_user = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * updateOtp method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateOtp(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('otp_code' in inputParams) {
        queryColumns.vOtpCode = inputParams.otp_code;
      }

      const queryObject = this.userEntityRepo
        .createQueryBuilder()
        .update(UserEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.u_user_id)) {
        queryObject.andWhere('iUserId = :iUserId', {
          iUserId: inputParams.u_user_id,
        });
      }
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.andWhere('vEmail = :vEmail', { vEmail: inputParams.email });
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
    inputParams.update_otp = this.blockResult.data;
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
      notification_type: 'FORGOT_PASSWORD',
      otp: inputParams.otp_code,
    };
    console.log('emiting from here rabbitmq no response!', extInputParams);
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
      message: custom.lang('Otp Send Successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_forgot_password',
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
      message: custom.lang('Invalid Email.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_forgot_password',
      },
    );
  }
}
