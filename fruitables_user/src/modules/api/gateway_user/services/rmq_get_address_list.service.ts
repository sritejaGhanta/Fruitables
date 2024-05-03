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
export class RmqGetAddressListService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    RmqGetAddressListService.name,
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
    @InjectRepository(UserAddressEntity)
  protected userAddressEntityRepo: Repository<UserAddressEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = [
      'get_address_list',
    ];
  }

  /**
   * startRmqGetAddressList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startRmqGetAddressList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getAddressList(inputParams);
      if (!_.isEmpty(inputParams.get_address_list)) {
        outputResponse = this.userAddressFinishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> rmq_get_address_list >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getAddressList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getAddressList(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.userAddressEntityRepo.createQueryBuilder('ua');

      queryObject.select('ua.id', 'id');
      queryObject.addSelect('ua.iUserId', 'user_id');
      queryObject.addSelect('ua.vLandMark', 'land_mark');
      queryObject.addSelect('ua.vAddress', 'address');
      queryObject.addSelect('ua.vStateName', 'state_name');
      queryObject.addSelect('ua.vCountryName', 'countr_name');
      queryObject.addSelect('ua.vPinCode', 'pin_code');
      queryObject.addSelect('ua.vFirstName', 'ua_first_name');
      queryObject.addSelect('ua.vLastName', 'ua_last_name');
      queryObject.addSelect('ua.vEmail', 'ua_email');
      queryObject.addSelect('ua.vPhoneNumber', 'ua_phone_number');
      queryObject.addSelect('ua.vDialCode', 'ua_dial_code');
      queryObject.addSelect('ua.vCompanyName', 'ua_company_name');
      queryObject.addSelect('ua.eStatus', 'ua_status');
      if (!custom.isEmpty(inputParams.ids)) {
        queryObject.andWhere('ua.id IN (:...id)', { id:inputParams.ids });
      }

      const data = await queryObject.getRawMany();
      if (!_.isArray(data) || _.isEmpty(data)) {
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
    inputParams.get_address_list = this.blockResult.data;

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
      message: custom.lang('List found.'),
      fields: [],
    };
    settingFields.fields = [
      'id',
      'user_id',
      'land_mark',
      'address',
      'state_name',
      'countr_name',
      'pin_code',
      'ua_first_name',
      'ua_last_name',
      'ua_email',
      'ua_phone_number',
      'ua_dial_code',
      'ua_company_name',
      'ua_status',
    ];

    const outputKeys = [
      'get_address_list',
    ];
    const outputAliases = {
      countr_name: 'country_name',
      ua_first_name: 'first_name',
      ua_last_name: 'last_name',
      ua_email: 'email',
      ua_phone_number: 'phone_number',
      ua_dial_code: 'dial_code',
      ua_company_name: 'company_name',
      ua_status: 'status',
    };

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'rmq_get_address_list';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
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
      message: custom.lang('List not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'rmq_get_address_list',
      },
    );
  }
}
