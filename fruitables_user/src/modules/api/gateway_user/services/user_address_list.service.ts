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
export class UserAddressListService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    UserAddressListService.name,
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
      'get_user_address_list',
    ];
  }

  /**
   * startUserAddressList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUserAddressList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getUserAddressList(inputParams);
      if (!_.isEmpty(inputParams.get_user_address_list)) {
        outputResponse = this.finishUserAddressListSuccess(inputParams);
      } else {
        outputResponse = this.finishUserAddressListFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> user_address_list >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getUserAddressList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUserAddressList(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'user_address',
        table_alias: 'ua',
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

      let queryObject = this.userAddressEntityRepo.createQueryBuilder('ua');

      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ua.vLandMark LIKE :vLandMark', { vLandMark: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ua.vAddress LIKE :vAddress', { vAddress: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ua.vStateName LIKE :vStateName', { vStateName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ua.vCountrName LIKE :vCountrName', { vCountrName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ua.vPinCode LIKE :vPinCode', { vPinCode: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ua.eStatus = :eStatus', { eStatus: inputParams.keyword });
      }
      //@ts-ignore;              
      this.getWhereClause(queryObject, inputParams, extraConfig);

      const totalCount = await queryObject.getCount();
      this.settingsParams = custom.getPagination(totalCount, pageIndex, recLimit);
      if (!totalCount) {
        throw new Error('No records found.');
      }

      queryObject = this.userAddressEntityRepo.createQueryBuilder('ua');

      queryObject.select('ua.id', 'ua_id');
      queryObject.addSelect('ua.vLandMark', 'ua_land_mark');
      queryObject.addSelect('ua.vAddress', 'ua_address');
      queryObject.addSelect('ua.vStateName', 'ua_state_name');
      queryObject.addSelect('ua.vCountrName', 'ua_countr_name');
      queryObject.addSelect('ua.vPinCode', 'ua_pin_code');
      queryObject.addSelect('ua.eStatus', 'ua_status');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ua.vLandMark LIKE :vLandMark', { vLandMark: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ua.vAddress LIKE :vAddress', { vAddress: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ua.vStateName LIKE :vStateName', { vStateName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ua.vCountrName LIKE :vCountrName', { vCountrName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ua.vPinCode LIKE :vPinCode', { vPinCode: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ua.eStatus = :eStatus', { eStatus: inputParams.keyword });
      }
      //@ts-ignore;              
      this.getWhereClause(queryObject, inputParams, extraConfig);
      //@ts-ignore;
      this.getOrderByClause(queryObject, inputParams, extraConfig);
      queryObject.offset(startIdx);
      queryObject.limit(recLimit);

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
    inputParams.get_user_address_list = this.blockResult.data;

    return inputParams;
  }

  /**
   * finishUserAddressListSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishUserAddressListSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('User_address list found.'),
      fields: [],
    };
    settingFields.fields = [
      'ua_id',
      'ua_user_id',
      'ua_land_mark',
      'ua_address',
      'ua_state_name',
      'ua_countr_name',
      'ua_pin_code',
      'ua_status',
      'get_user_address_list',
    ];

    const outputKeys = [
      'get_user_address_list',
    ];
    const outputAliases = {
      ua_id: 'id',
      ua_user_id: 'user_id',
      ua_land_mark: 'land_mark',
      ua_address: 'address',
      ua_state_name: 'state_name',
      ua_countr_name: 'countr_name',
      ua_pin_code: 'pin_code',
      ua_status: 'status',
    };

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'user_address_list';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * finishUserAddressListFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishUserAddressListFailure(inputParams: any) {
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
        name: 'user_address_list',
      },
    );
  }
}
