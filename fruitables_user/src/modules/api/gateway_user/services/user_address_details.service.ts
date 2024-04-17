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


import { UserAddressEntity } from 'src/entities/user-address.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class UserAddressDetailsService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    UserAddressDetailsService.name,
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
    @InjectRepository(UserAddressEntity)
  protected userAddressEntityRepo: Repository<UserAddressEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_user_address_details',
    ];
  }

  /**
   * startUserAddressDetails method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUserAddressDetails(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getUserAddressDetails(inputParams);
      if (!_.isEmpty(inputParams.get_user_address_details)) {
        outputResponse = this.userAddressDetailsFinishSuccess(inputParams);
      } else {
        outputResponse = this.userAddressDetailsFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> user_address_details >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getUserAddressDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUserAddressDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.userAddressEntityRepo.createQueryBuilder('ua');

      queryObject.select('ua.id', 'ua_id');
      queryObject.addSelect('ua.vLandMark', 'ua_land_mark');
      queryObject.addSelect('ua.vAddress', 'ua_address');
      queryObject.addSelect('ua.vStateName', 'ua_state_name');
      queryObject.addSelect('ua.vCountrName', 'ua_countr_name');
      queryObject.addSelect('ua.vPinCode', 'ua_pin_code');
      queryObject.addSelect('ua.eStatus', 'ua_status');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('ua.id = :id', { id: inputParams.id });
      }
      queryObject.andWhere('ua.iUserId = :iUserId', { iUserId: this.requestObj.user.user_id });

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
    inputParams.get_user_address_details = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * userAddressDetailsFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userAddressDetailsFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('User address details found.'),
      fields: [],
    };
    settingFields.fields = [
      'ua_id',
      'ua_land_mark',
      'ua_address',
      'ua_state_name',
      'ua_countr_name',
      'ua_pin_code',
      'ua_status',
    ];

    const outputKeys = [
      'get_user_address_details',
    ];
    const outputAliases = {
      ua_id: 'id',
      ua_land_mark: 'land_mark',
      ua_address: 'address',
      ua_state_name: 'state_name',
      ua_countr_name: 'countr_name',
      ua_pin_code: 'pin_code',
      ua_status: 'status',
    };
    const outputObjects = [
      'get_user_address_details',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'user_address_details';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * userAddressDetailsFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userAddressDetailsFinishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('user_address details not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_address_details',
      },
    );
  }
}
