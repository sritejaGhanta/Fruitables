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

import { UserEntity } from 'src/entities/user.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class RmqUserOtpUpdateService extends BaseService {
  protected readonly log = new LoggerHandler(
    RmqUserOtpUpdateService.name,
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
  @InjectRepository(UserEntity)
  protected userEntityRepo: Repository<UserEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = ['verify_user_id', 'update_user_otp'];
  }

  /**
   * startRmqUserOtpUpdate method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startRmqUserOtpUpdate(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.verifyUserId(inputParams);
      if (!_.isEmpty(inputParams.verify_user_id)) {
        inputParams = await this.updateUserOtp(inputParams);
        outputResponse = this.userFinishSuccess(inputParams);
      } else {
        outputResponse = this.userFinishSuccess1(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> rmq_user_otp_update >>', err);
    }
    return outputResponse;
  }

  /**
   * verifyUserId method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async verifyUserId(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.userEntityRepo.createQueryBuilder('u');

      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('u.iUserId = :iUserId', {
          iUserId: inputParams.id,
        });
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
    inputParams.verify_user_id = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * updateUserOtp method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateUserOtp(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('otp' in inputParams) {
        queryColumns.vOtpCode = inputParams.otp;
      }
      if ('updatedAt' in inputParams) {
        queryColumns.updatedAt = inputParams.updatedAt;
      }

      const queryObject = this.userEntityRepo
        .createQueryBuilder()
        .update(UserEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('iUserId = :iUserId', { iUserId: inputParams.id });
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
    inputParams.update_user_otp = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
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
      message: custom.lang('user otp updated successfully.'),
      fields: [],
    };
    settingFields.fields = ['affected_rows'];

    const outputKeys = ['update_user_otp'];
    const outputObjects = ['update_user_otp'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'rmq_user_otp_update';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
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
      message: custom.lang('user_id not found.'),
      fields: [],
    };
    settingFields.fields = [];

    const outputKeys = ['verify_user_id'];
    const outputObjects = ['verify_user_id'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'rmq_user_otp_update';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }
}
