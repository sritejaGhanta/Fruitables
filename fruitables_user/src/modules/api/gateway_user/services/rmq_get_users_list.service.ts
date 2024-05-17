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
export class RmqGetUsersListService extends BaseService {
  protected readonly log = new LoggerHandler(
    RmqGetUsersListService.name,
  ).getInstance();
  protected inputParams: object = {};
  protected blockResult: BlockResultDto;
  protected settingsParams: SettingsParamsDto;
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
    this.multipleKeys = ['get_rmq_user_list'];
  }

  /**
   * startRmqGetUsersList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startRmqGetUsersList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getRmqUserList(inputParams);
      if (!_.isEmpty(inputParams.get_rmq_user_list)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> rmq_get_users_list >>', err);
    }
    return outputResponse;
  }

  /**
   * getRmqUserList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getRmqUserList(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.userEntityRepo.createQueryBuilder('u');

      queryObject.select('u.vProfileImage', 'profile_image');
      queryObject.addSelect('u.vFirstName', 'first_name');
      queryObject.addSelect('u.vEmail', 'email');
      queryObject.addSelect('u.vLastName', 'last_name');
      queryObject.addSelect('u.vPhoneNumber', 'phone_number');
      queryObject.addSelect('u.vDialCode', 'dial_code');
      queryObject.addSelect('u.eStatus', 'status');
      queryObject.addSelect('u.vProfileImage', 'profile_image_name');
      queryObject.addSelect('u.iUserId', 'user_id');
      if (!custom.isEmpty(inputParams.ids)) {
        queryObject.andWhere('u.iUserId IN (:...iUserId)', {
          iUserId: inputParams.ids,
        });
      }

      const data = await queryObject.getRawMany();
      if (!_.isArray(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let fileConfig: FileFetchDto;
      let val;
      if (_.isArray(data) && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          val = row.profile_image;
          fileConfig = {};
          fileConfig.source = 'SYSTEM';
          fileConfig.path = 'user_profile_image';
          fileConfig.image_name = val;
          fileConfig.extensions = await this.general.getConfigItem(
            'allowed_extensions',
          );
          fileConfig.width = 150;
          fileConfig.height = 150;
          fileConfig.resize_mode = 'fill';
          fileConfig.no_img_req = false;
          val = await this.general.getFile(fileConfig, inputParams);
          data[i].profile_image = val;
        }
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
    inputParams.get_rmq_user_list = this.blockResult.data;

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
      message: custom.lang('Users found.'),
      fields: [],
    };
    settingFields.fields = [
      'profile_image',
      'first_name',
      'email',
      'last_name',
      'phone_number',
      'dial_code',
      'status',
      'profile_image_name',
      'user_id',
    ];

    const outputKeys = ['get_rmq_user_list'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'rmq_get_users_list';

    funcData.output_keys = outputKeys;
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
      message: custom.lang('Users not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'rmq_get_users_list',
      },
    );
  }
}
