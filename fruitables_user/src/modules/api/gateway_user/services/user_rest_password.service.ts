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
export class UserRestPasswordService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    UserRestPasswordService.name,
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
    this.singleKeys = [
      'user_details',
      'update_passord',
    ];
  }

  /**
   * startUserRestPassword method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUserRestPassword(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.userDetails(inputParams);
      if (!_.isEmpty(inputParams.user_details)) {
      inputParams = await this.updatePassord(inputParams);
        outputResponse = this.userFinishSuccess(inputParams);
      } else {
        outputResponse = this.invalidOtp(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> user_rest_password >>', err);
    }
    return outputResponse;
  }
  

  /**
   * userDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async userDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.userEntityRepo.createQueryBuilder('u');

      queryObject.select('u.iUserId', 'u_user_id');
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.andWhere('u.vEmail = :vEmail', { vEmail: inputParams.email });
      }
      if (!custom.isEmpty(inputParams.otp)) {
        queryObject.andWhere('u.vOtpCode = :vOtpCode', { vOtpCode: inputParams.otp });
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
    inputParams.user_details = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * updatePassord method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updatePassord(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      if ('password' in inputParams) {
        queryColumns.vPassword = inputParams.password;
      }
      //@ts-ignore;
      queryColumns.vPassword = this.general.encryptPassword(queryColumns.vPassword, inputParams, {
        field: 'password',
        request: this.requestObj,
      });

      const queryObject = this.userEntityRepo
        .createQueryBuilder()
        .update(UserEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.u_user_id)) {
        queryObject.andWhere('iUserId = :iUserId', { iUserId: inputParams.u_user_id });
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
    inputParams.update_passord = this.blockResult.data;
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
      message: custom.lang('Update passoword successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_rest_password',
      },
    );
  }

  /**
   * invalidOtp method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  invalidOtp(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Invalid Otp.'),
      fields: [],
    };
    settingFields.fields = [
      'u_user_id',
    ];

    const outputKeys = [
      'user_details',
    ];
    const outputObjects = [
      'user_details',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'user_rest_password';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }
}
