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
import { CartEntity } from 'src/entities/cart.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class UserLoginService extends BaseService {
  protected readonly log = new LoggerHandler(
    UserLoginService.name,
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
    this.singleKeys = ['get_user_details_1', 'verify_login_password'];
  }

  /**
   * startUserLogin method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUserLogin(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getUserDetails1(inputParams);
      if (!_.isEmpty(inputParams.get_user_details_1)) {
        inputParams = await this.verifyLoginPassword(inputParams);
        if (inputParams.is_matched === 1) {
          if (inputParams.u_status === 'Active') {
            outputResponse = this.userFinishSuccess(inputParams);
          } else {
            outputResponse = this.inactiveUser(inputParams);
          }
        } else {
          outputResponse = this.worngPassword(inputParams);
        }
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> user_login >>', err);
    }
    outputResponse = await this.general.createAPIToken(
      'user_login',
      outputResponse,
    );
    return outputResponse;
  }

  /**
   * getUserDetails1 method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUserDetails1(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.userEntityRepo.createQueryBuilder('u');

      queryObject.leftJoin(CartEntity, 'c', 'u.iUserId = c.iUserId');
      queryObject.select('u.vEmail', 'u_email');
      queryObject.addSelect('u.vPassword', 'mc_password');
      queryObject.addSelect('u.iUserId', 'u_user_id');
      queryObject.addSelect('u.vProfileImage', 'u_profile_image');
      queryObject.addSelect('u.vFirstName', 'u_first_name');
      queryObject.addSelect('u.vLastName', 'u_last_name');
      queryObject.addSelect('u.vPhoneNumber', 'u_phone_number');
      queryObject.addSelect('u.vDialCode', 'u_dial_code');
      queryObject.addSelect('u.eStatus', 'u_status');
      queryObject.addSelect('u.vProfileImage', 'profile_image_name');
      queryObject.addSelect('c.id', 'cart_id');
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.andWhere('u.vEmail = :vEmail', {
          vEmail: inputParams.email,
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
        fileConfig.path = 'user_profile_image';
        fileConfig.image_name = val;
        fileConfig.extensions = await this.general.getConfigItem(
          'allowed_extensions',
        );
        fileConfig.width = 40;
        fileConfig.height = 40;
        fileConfig.resize_mode = 'fill';
        fileConfig.no_img_req = false;
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
    inputParams.get_user_details_1 = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * verifyLoginPassword method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async verifyLoginPassword(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.general.verifyCustomerLoginPassword(
        inputParams,
      );

      formatData = this.response.assignFunctionResponse(result);
      inputParams.verify_login_password = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
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
      message: custom.lang('Welcome back! #u_first_name#  #u_last_name# '),
      fields: [],
    };
    settingFields.fields = [
      'u_email',
      'u_user_id',
      'u_profile_image',
      'u_first_name',
      'u_last_name',
      'u_phone_number',
      'u_dial_code',
      'u_status',
      'profile_image_name',
      'cart_id',
    ];

    const outputKeys = ['get_user_details_1'];
    const outputAliases = {
      u_email: 'email',
      u_user_id: 'user_id',
      u_profile_image: 'profile_image',
      u_first_name: 'first_name',
      u_last_name: 'last_name',
      u_phone_number: 'phone_number',
      u_dial_code: 'dial_code',
      u_status: 'status',
    };
    const outputObjects = ['get_user_details_1'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'user_login';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * inactiveUser method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  inactiveUser(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('User is Inactive, Please contact admin.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_login',
      },
    );
  }

  /**
   * worngPassword method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  worngPassword(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Invalid credentials.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_login',
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
      message: custom.lang('Invalid User.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_login',
      },
    );
  }
}
