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
export class UserAddressAddService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    UserAddressAddService.name,
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
      'insert_user_address_data',
      'get_insert_address',
    ];
  }

  /**
   * startUserAddressAdd method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUserAddressAdd(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.insertUserAddressData(inputParams);
      if (!_.isEmpty(inputParams.insert_user_address_data)) {
      inputParams = await this.getInsertAddress(inputParams);
        outputResponse = this.userAddressAddFinishSuccess(inputParams);
      } else {
        outputResponse = this.userAddressAddFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> user_address_add >>', err);
    }
    return outputResponse;
  }
  

  /**
   * insertUserAddressData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertUserAddressData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      queryColumns.iUserId = this.requestObj.user.user_id;
      if ('land_mark' in inputParams) {
        queryColumns.vLandMark = inputParams.land_mark;
      }
      if ('address' in inputParams) {
        queryColumns.vAddress = inputParams.address;
      }
      if ('state_name' in inputParams) {
        queryColumns.vStateName = inputParams.state_name;
      }
      if ('countr_name' in inputParams) {
        queryColumns.vCountrName = inputParams.countr_name;
      }
      if ('pin_code' in inputParams) {
        queryColumns.vPinCode = inputParams.pin_code;
      }
      if ('first_name' in inputParams) {
        queryColumns.vFirstName = inputParams.first_name;
      }
      if ('last_name' in inputParams) {
        queryColumns.vLastName = inputParams.last_name;
      }
      if ('email' in inputParams) {
        queryColumns.vEmail = inputParams.email;
      }
      if ('phone_number' in inputParams) {
        queryColumns.vPhoneNumber = inputParams.phone_number;
      }
      if ('company_name' in inputParams) {
        queryColumns.vCompanyName = inputParams.company_name;
      }
      queryColumns.eStatus = 'Active';
      const queryObject = this.userAddressEntityRepo;
      const res = await queryObject.insert(queryColumns);
      const data = {
        insert_id: res.raw.insertId,
      };

      const success = 1;
      const message = 'Record(s) inserted.';

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
    inputParams.insert_user_address_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * getInsertAddress method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getInsertAddress(inputParams: any) {
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
      queryObject.addSelect('ua.vFirstName', 'ua_first_name');
      queryObject.addSelect('ua.vLastName', 'ua_last_name');
      queryObject.addSelect('ua.vEmail', 'ua_email');
      queryObject.addSelect('ua.vPhoneNumber', 'ua_phone_number');
      queryObject.addSelect('ua.vCompanyName', 'ua_company_name');
      if (!custom.isEmpty(inputParams.insert_id)) {
        queryObject.andWhere('ua.id = :id', { id: inputParams.insert_id });
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
    inputParams.get_insert_address = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * userAddressAddFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userAddressAddFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('User address added successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'insert_id',
      'ua_id',
      'ua_land_mark',
      'ua_address',
      'ua_state_name',
      'ua_countr_name',
      'ua_pin_code',
      'ua_status',
      'ua_first_name',
      'ua_last_name',
      'ua_email',
      'ua_phone_number',
      'ua_company_name',
    ];

    const outputKeys = [
      'insert_user_address_data',
      'get_insert_address',
    ];
    const outputAliases = {
      ua_id: 'id',
      ua_land_mark: 'land_mark',
      ua_address: 'address',
      ua_state_name: 'state_name',
      ua_countr_name: 'countr_name',
      ua_pin_code: 'pin_code',
      ua_status: 'status',
      ua_first_name: 'first_name',
      ua_last_name: 'last_name',
      ua_email: 'email',
      ua_phone_number: 'phone_number',
      ua_company_name: 'company_name',
    };
    const outputObjects = [
      'insert_user_address_data',
      'get_insert_address',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'user_address_add';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * userAddressAddFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userAddressAddFinishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Something went wrong, Please try again.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_address_add',
      },
    );
  }
}
