interface AuthObject {
  user: any;
}
import { Inject, Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import * as _ from 'lodash';
import * as custom from 'src/utilities/custom-helper';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { BlockResultDto, SettingsParamsDto } from 'src/common/dto/common.dto';import { FileFetchDto } from 'src/common/dto/amazon.dto';

import { ResponseLibrary } from 'src/utilities/response-library';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';


import { UserEntity } from 'src/entities/user.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class UserListService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    UserListService.name,
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
    this.multipleKeys = [
      'get_user_list',
    ];
  }

  /**
   * startUserList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUserList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getUserList(inputParams);
      if (!_.isEmpty(inputParams.get_user_list)) {
        outputResponse = this.finishUserListSuccess(inputParams);
      } else {
        outputResponse = this.finishUserListFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> user_list >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getUserList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUserList(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'user',
        table_alias: 'u',
        primary_key: '',
        request_obj: this.requestObj,
      };
      let pageIndex = 1;
      if ('page' in inputParams) {
        pageIndex = Number(inputParams.page);
      } else if ('page_index' in inputParams) {
        pageIndex = Number(inputParams.page_index);
      }
      pageIndex = pageIndex > 0 ? pageIndex : 1;
      const recLimit = Number(inputParams.limit);
      const startIdx = custom.getStartIndex(pageIndex, recLimit);

      let queryObject = this.userEntityRepo.createQueryBuilder('u');

      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('u.vFirstName LIKE :vFirstName', { vFirstName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('u.vLastName LIKE :vLastName', { vLastName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('u.vEmail LIKE :vEmail', { vEmail: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('u.eStatus = :eStatus', { eStatus: inputParams.keyword });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('u.vPhoneNumber LIKE :vPhoneNumber', { vPhoneNumber: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('u.vDialCode LIKE :vDialCode', { vDialCode: `${inputParams.keyword}%` });
      }

      const totalCount = await queryObject.getCount();
      this.settingsParams = custom.getPagination(totalCount, pageIndex, recLimit);
      if (!totalCount) {
        throw new Error('No records found.');
      }

      queryObject = this.userEntityRepo.createQueryBuilder('u');

      queryObject.select('u.iUserId', 'u_user_id');
      queryObject.addSelect('u.vFirstName', 'u_first_name');
      queryObject.addSelect('u.vLastName', 'u_last_name');
      queryObject.addSelect('u.vEmail', 'u_email');
      queryObject.addSelect('u.eStatus', 'u_status');
      queryObject.addSelect('u.vPhoneNumber', 'u_phone_number');
      queryObject.addSelect('u.vDialCode', 'dial_code');
      queryObject.addSelect('u.vProfileImage', 'profile_image');
      queryObject.addSelect('u.vProfileImage', 'profile_image_name');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('u.vFirstName LIKE :vFirstName', { vFirstName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('u.vLastName LIKE :vLastName', { vLastName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('u.vEmail LIKE :vEmail', { vEmail: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('u.eStatus = :eStatus', { eStatus: inputParams.keyword });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('u.vPhoneNumber LIKE :vPhoneNumber', { vPhoneNumber: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('u.vDialCode LIKE :vDialCode', { vDialCode: `${inputParams.keyword}%` });
      }
      //@ts-ignore;
      this.getOrderByClause(queryObject, inputParams, extraConfig);
      queryObject.offset(startIdx);
      queryObject.limit(recLimit);

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
          fileConfig.source = 'local';
          fileConfig.path = 'user_profile_image';
          fileConfig.image_name = val;
          fileConfig.extensions = await this.general.getConfigItem('allowed_extensions');
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
    inputParams.get_user_list = this.blockResult.data;

    return inputParams;
  }

  /**
   * finishUserListSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishUserListSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('User list found.'),
      fields: [],
    };
    settingFields.fields = [
      'u_user_id',
      'u_first_name',
      'u_last_name',
      'u_email',
      'u_status',
      'u_phone_number',
      'dial_code',
      'profile_image',
      'profile_image_name',
    ];

    const outputKeys = [
      'get_user_list',
    ];
    const outputAliases = {
      u_user_id: 'user_id',
      u_first_name: 'first_name',
      u_last_name: 'last_name',
      u_email: 'email',
      u_status: 'status',
      u_phone_number: 'phone_number',
    };

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'user_list';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * finishUserListFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishUserListFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('No records found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_list',
      },
    );
  }
}
