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
import { FileFetchDto } from 'src/common/dto/amazon.dto';

import { ResponseLibrary } from 'src/utilities/response-library';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';

import { UserEntity } from 'src/entities/user.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class RmqGetUserDetailsService extends BaseService {
  protected readonly log = new LoggerHandler(
    RmqGetUserDetailsService.name,
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
    this.singleKeys = ['rmq_get_user'];
  }

  /**
   * startRmqGetUserDetails method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startRmqGetUserDetails(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.rmqGetUser(inputParams);
      outputResponse = this.finishSuccess(inputParams);
    } catch (err) {
      this.log.error('API Error >> rmq_get_user_details >>', err);
    }
    return outputResponse;
  }

  /**
   * rmqGetUser method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async rmqGetUser(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.userEntityRepo.createQueryBuilder('u');

      queryObject.select('u.iUserId', 'u_user_id');
      queryObject.addSelect('u.vProfileImage', 'u_profile_image');
      queryObject.addSelect('u.vFirstName', 'u_first_name');
      queryObject.addSelect('u.vLastName', 'u_last_name');
      queryObject.addSelect('u.vEmail', 'u_email');
      queryObject.addSelect('u.vPhoneNumber', 'u_phone_number');
      queryObject.addSelect('u.vDialCode', 'u_dial_code');
      queryObject.addSelect('u.eStatus', 'u_status');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('u.iUserId = :iUserId', {
          iUserId: inputParams.id,
        });
      }

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let fileConfig: FileFetchDto;
      let val;
      if (_.isObject(data) && !_.isEmpty(data)) {
        const row: any = data;
        val = row.u_profile_image;
        fileConfig = {};
        fileConfig.source = 'local';
        fileConfig.path = 'user_images';
        fileConfig.image_name = val;
        fileConfig.extensions = await this.general.getConfigItem(
          'allowed_extensions',
        );
        val = await this.general.getFile(fileConfig, inputParams);
        data['u_profile_image'] = val;
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
    inputParams.rmq_get_user = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

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
      message: custom.lang('User details found'),
      fields: [],
    };
    settingFields.fields = [
      'u_user_id',
      'u_profile_image',
      'u_first_name',
      'u_last_name',
      'u_email',
      'u_phone_number',
      'u_dial_code',
      'u_status',
    ];

    const outputKeys = ['rmq_get_user'];
    const outputAliases = {
      u_user_id: 'user_id',
      u_profile_image: 'profile_image',
      u_first_name: 'first_name',
      u_last_name: 'last_name',
      u_email: 'email',
      u_phone_number: 'phone_number',
      u_dial_code: 'dial_code',
      u_status: 'status',
    };
    const outputObjects = ['rmq_get_user'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'rmq_get_user_details';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }
}
