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
export class RmqGetUserAddressService extends BaseService {
  protected readonly log = new LoggerHandler(
    RmqGetUserAddressService.name,
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
    this.singleKeys = ['get_address'];
  }

  /**
   * startRmqGetUserAddress method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startRmqGetUserAddress(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getAddress(inputParams);
      if (!_.isEmpty(inputParams.get_address)) {
        outputResponse = this.userAddressFinishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> rmq_get_user_address >>', err);
    }
    return outputResponse;
  }

  /**
   * getAddress method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getAddress(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.userAddressEntityRepo.createQueryBuilder('ua');

      queryObject.select('ua.vLandMark', 'ua_land_mark');
      queryObject.addSelect('ua.vAddress', 'ua_address');
      queryObject.addSelect('ua.vStateName', 'ua_state_name');
      queryObject.addSelect('ua.vCountryName', 'ua_countr_name');
      queryObject.addSelect('ua.vPinCode', 'ua_pin_code');
      queryObject.addSelect('ua.vFirstName', 'ua_first_name');
      queryObject.addSelect('ua.vLastName', 'ua_last_name');
      queryObject.addSelect('ua.vPhoneNumber', 'ua_phone_number');
      queryObject.addSelect('ua.vDialCode', 'ua_dial_code');
      queryObject.addSelect('ua.vCity', 'ua_city');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('ua.id = :id', { id: inputParams.id });
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
    inputParams.get_address = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * userAddressFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userAddressFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Address Found'),
      fields: [],
    };
    settingFields.fields = [
      'ua_land_mark',
      'ua_address',
      'ua_state_name',
      'ua_countr_name',
      'ua_pin_code',
      'ua_first_name',
      'ua_last_name',
      'ua_phone_number',
      'ua_dial_code',
      'ua_city',
    ];

    const outputKeys = ['get_address'];
    const outputAliases = {
      ua_land_mark: 'land_mark',
      ua_address: 'address',
      ua_state_name: 'state_name',
      ua_countr_name: 'countr_name',
      ua_pin_code: 'pin_code',
      ua_first_name: 'first_name',
      ua_last_name: 'last_name',
      ua_phone_number: 'phone_number',
      ua_dial_code: 'dial_code',
      ua_city: 'city',
    };
    const outputObjects = ['get_address'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'rmq_get_user_address';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
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
      message: custom.lang('Address not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'rmq_get_user_address',
      },
    );
  }
}
