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

import { SubscribersEntity } from 'src/entities/subscribers.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class GetUserSubscribeDtailsService extends BaseService {
  protected readonly log = new LoggerHandler(
    GetUserSubscribeDtailsService.name,
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
  @InjectRepository(SubscribersEntity)
  protected subscribersEntityRepo: Repository<SubscribersEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = ['get_user_subscribe_details'];
  }

  /**
   * startGetUserSubscribeDtails method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startGetUserSubscribeDtails(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getUserSubscribeDetails(inputParams);
      if (!_.isEmpty(inputParams.get_user_subscribe_details)) {
        outputResponse = this.subscribersFinishSuccess(inputParams);
      } else {
        outputResponse = this.subscribersFinishSuccess1(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> get_user_subscribe_dtails >>', err);
    }
    return outputResponse;
  }

  /**
   * getUserSubscribeDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUserSubscribeDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.subscribersEntityRepo.createQueryBuilder('s');

      queryObject.select('s.vEmail', 's_email');
      if (!custom.isEmpty(inputParams.user_subs_id)) {
        queryObject.andWhere('s.id = :id', { id: inputParams.user_subs_id });
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
    inputParams.get_user_subscribe_details = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * subscribersFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  subscribersFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('subscriber user details found.'),
      fields: [],
    };
    settingFields.fields = ['s_email'];

    const outputKeys = ['get_user_subscribe_details'];
    const outputAliases = {
      s_email: 'subscribe_email',
    };
    const outputObjects = ['get_user_subscribe_details'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'get_user_subscribe_dtails';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * subscribersFinishSuccess1 method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  subscribersFinishSuccess1(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('user not subscribed yet.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'get_user_subscribe_dtails',
      },
    );
  }
}
